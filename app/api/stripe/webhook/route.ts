import { after, type NextRequest } from "next/server";
import type Stripe from "stripe";

import { redis } from "@/lib/auth/redis";
import { fulfilOrder } from "@/lib/payments/fulfil";
import { stripeWebhookSecret } from "@/lib/payments/env";
import {
  findOrderByIntent,
  getOrder,
  markPaid,
  markRefunded,
} from "@/lib/payments/orders";
import { stripe } from "@/lib/payments/stripe";

/**
 * Stripe gets its answer in milliseconds; this budget is for the provisioning
 * that runs after it, inside `after`.
 *
 * Worst case is the largest order `MAX_ESIMS` allows: three `new_esim` calls at
 * up to ten seconds each, one read of the account, and three emails — roughly
 * 45 seconds. Sixty leaves room without exceeding the ceiling on a hosting
 * plan's smallest tier. If provisioning is ever cut short, the cards already
 * bought are on the order record, so nothing is bought twice.
 */
export const maxDuration = 60;

/**
 * Stripe keeps retrying an event for about three days, so a claim only has to
 * outlive that window by a wide margin to be certain a retry is recognised.
 */
const SEEN_SECONDS = 30 * 24 * 60 * 60;

const seenKey = (eventId: string) => `stripe:event:${eventId}`;

const ok = () => Response.json({ received: true });

/**
 * The one door Stripe knocks on. Everything here is hostile until the signature
 * says otherwise: this URL is reachable by anyone, and a forged "order 123 is
 * paid" is a free eSIM.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  // The raw text, byte for byte. Parsing it first would break the signature.
  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = await stripe().webhooks.constructEventAsync(
      payload,
      signature,
      stripeWebhookSecret(),
    );
  } catch (cause) {
    console.error("Stripe webhook rejected:", cause);

    return new Response("Invalid signature", { status: 400 });
  }

  // Stripe re-sends events by design. First one through claims the id.
  const claimed = await redis().set(seenKey(event.id), 1, {
    nx: true,
    ex: SEEN_SECONDS,
  });

  if (claimed !== "OK") return ok();

  try {
    await handle(event);
  } catch (cause) {
    console.error(`Stripe webhook ${event.type} failed:`, cause);

    // Release the claim so Stripe's retry is allowed to try again.
    await redis().del(seenKey(event.id));

    return new Response("Handler failed", { status: 500 });
  }

  return ok();
}

async function handle(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await settle(event.data.object);
      break;

    case "charge.refunded":
      await refund(event.data.object);
      break;

    case "charge.dispute.created":
      console.error(
        "Stripe dispute opened. Respond in the dashboard before the deadline:",
        event.data.object.id,
      );
      break;

    default:
      // Everything else is noise we did not subscribe to.
      break;
  }
}

/**
 * Money has cleared. The order moves to `paid` and nothing else — issuing the
 * eSIM is a separate step, so a problem there cannot be confused with a problem
 * taking the payment.
 */
async function settle(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid") return;

  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.error("Paid Stripe session carries no order id:", session.id);

    return;
  }

  const order = await getOrder(orderId);

  if (!order) {
    console.error("Paid Stripe session names an unknown order:", orderId);

    return;
  }

  // What Stripe collected has to match what we asked for. A mismatch means the
  // session was not the one we created, and it is never fulfilled.
  if (
    session.amount_total !== order.amount ||
    session.currency !== order.currency
  ) {
    console.error(
      `Order ${orderId} amount mismatch: charged ${session.amount_total} ${session.currency}, expected ${order.amount} ${order.currency}`,
    );

    return;
  }

  const intent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!intent) {
    console.error("Paid Stripe session carries no payment intent:", session.id);

    return;
  }

  // `null` means another delivery of this event already moved it on.
  const paid = await markPaid(orderId, intent);

  if (!paid) return;

  console.info(`Order ${orderId} paid.`);

  /**
   * Buying eSIMs runs after Stripe has its `200`, not before it. Each Yesim call
   * can take ten seconds and an order may need several, which is far longer than
   * Stripe waits before assuming we failed and re-sending. Answering first and
   * provisioning second keeps a slow supplier from being read as a broken
   * webhook — and provisioning is the one step that must never be re-run.
   */
  after(() => fulfilOrder(paid));
}

async function refund(charge: Stripe.Charge): Promise<void> {
  const intent =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!intent) return;

  const order = await findOrderByIntent(intent);

  if (!order) return;

  await markRefunded(order.id);

  console.info(`Order ${order.id} refunded.`);
}