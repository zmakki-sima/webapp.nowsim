"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { verifySession } from "@/lib/auth/dal";
import { digest, redis } from "@/lib/auth/redis";
import { MAX_ESIMS, type InstallChoice } from "@/lib/checkout";
import { getEsims } from "@/lib/data/esims";
import { env } from "@/lib/env";
import {
  attachSession,
  createOrder,
  getOrder,
  type OrderStatus,
} from "@/lib/payments/orders";
import { stripe } from "@/lib/payments/stripe";
import { convertMoney, currencyCodes, scaleMoney } from "@/lib/money";
import { resolveOrder } from "@/lib/order";
import { isDeployed } from "@/lib/stage";
import type { EsimState } from "@/lib/types";

export type InstallTarget = {
  id: string;
  iccid: string;
  name: string;
  art?: string;
  state: EsimState;
  expiresAt?: string;
  /**
   * The plan about to be written over. Only its shape: what the card has left
   * to spend is not offered as a reason to pick one, because picking it is what
   * discards it.
   */
  data?: string;
  days?: number;
};

/**
 * Every eSIM on the account, whatever country its current plan covers — a plan
 * overwrites whatever card it is written to, so the destination being bought has
 * no bearing on which cards can receive it. Only two things disqualify a card:
 * it was deleted upstream, or it has no ICCID to address it by.
 *
 * `null` means the lookup itself failed. That is deliberately not the same as an
 * empty list: reporting a Yesim outage as "you own no eSIMs" silently removes a
 * choice the customer actually has. A session that has gone stale between the
 * page render and this call is the same kind of unknown — the page still shows
 * the customer signed in, so answering "no eSIMs" would skip the dialog for an
 * account that owns several.
 */
export async function listInstallTargets(): Promise<InstallTarget[] | null> {
  try {
    const esims = await getEsims();

    if (!esims) return null;

    return esims
      .filter((esim) => esim.state !== "removed" && esim.iccid !== "")
      .map((esim) => ({
        id: esim.id,
        iccid: esim.iccid,
        name: esim.plan ? `${esim.plan.destination} eSIM` : "eSIM",
        art: esim.plan?.art,
        state: esim.state,
        expiresAt: esim.expiresAt,
        data: esim.plan?.data,
        days: esim.plan?.days,
      }));
  } catch (cause) {
    console.error("listInstallTargets failed:", cause);

    return null;
  }
}

/**
 * Status of one of the caller's own orders. Used by the success page to notice
 * the webhook landing. Returns `null` for anything that is not theirs, so the
 * endpoint cannot be used to probe for other people's orders.
 */
export async function orderStatus(id: string): Promise<OrderStatus | null> {
  const session = await verifySession();

  if (!session) return null;

  const order = await getOrder(id);

  return order && order.accountId === session.yesimUserId ? order.status : null;
}

export type StartResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * A Server Action is a public POST endpoint, so nothing the browser sends is
 * trusted: it names a plan and a quantity, and every other fact — price,
 * currency, who is buying, whether that eSIM is theirs — is re-derived here.
 */
const input = z.object({
  kind: z.string().min(1),
  destination: z.string().min(1),
  plan: z.string().min(1),
  qty: z.coerce.number().int().min(1).max(MAX_ESIMS),
  /**
   * Which currency to bill in — not what to bill. The amount is converted here
   * from the catalog's euro price at a fixed rate, so the worst a forged code
   * can do is charge the caller in a currency they did not pick. Defaulted so
   * that a page loaded before this shipped still checks out.
   */
  currency: z.enum(currencyCodes).default("EUR"),
  install: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("new") }),
    z.object({
      kind: z.literal("existing"),
      iccid: z.string().min(1),
      name: z.string().min(1),
    }),
  ]),
});

const LIMIT = { max: 10, window: 10 * 60 } as const;

const LIMIT_SCRIPT = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
  end
  return count
`;

async function overLimit(accountId: string): Promise<boolean> {
  const count = await redis().eval<[string], number>(
    LIMIT_SCRIPT,
    [`rl:checkout:${digest(accountId)}`],
    [String(LIMIT.window)],
  );

  return count > LIMIT.max;
}

/**
 * A payment page stays valid for a while, so coming back to buy the same thing
 * lands on the page already open instead of opening a second one against a
 * second order. Keyed by what is being bought, not by when it was clicked.
 *
 * Best effort, not a lock — two clicks landing at once can still pass. The
 * button disabling itself while the request runs is what stops a double-click;
 * this stops the slower duplicates.
 */
const CLAIM_SECONDS = 15 * 60;

const claimKey = (accountId: string, shape: string) =>
  `checkout:claim:${digest(`${accountId}:${shape}`)}`;

async function openSessionUrl(orderId: string): Promise<string | null> {
  const order = await getOrder(orderId);

  if (!order?.sessionId || order.status !== "pending") return null;

  const session = await stripe().checkout.sessions.retrieve(order.sessionId);

  return session.status === "open" && session.url ? session.url : null;
}

/**
 * Where Stripe sends the customer back to. A deployment states its own address
 * so a forged `Host` header cannot rewrite it; a dev machine reads the host it
 * was actually reached on, so a local test returns to localhost instead of the
 * deployed site.
 */
async function returnOrigin(): Promise<string> {
  if (isDeployed) return env.NEXT_PUBLIC_SITE_URL;

  const host = (await headers()).get("host");

  return host ? `http://${host}` : env.NEXT_PUBLIC_SITE_URL;
}

export async function startCheckout(raw: unknown): Promise<StartResult> {
  const session = await verifySession();

  if (!session) return { ok: false, error: "Sign in to complete your order." };

  const parsed = input.safeParse(raw);

  if (!parsed.success) return { ok: false, error: "That order is no longer valid." };

  const { kind, destination, plan, qty, currency, install } = parsed.data;

  try {
    if (await overLimit(session.yesimUserId)) {
      return { ok: false, error: "Too many attempts. Wait a few minutes." };
    }

    // The price comes from the catalog, never from the caller.
    const order = await resolveOrder({
      kind,
      destination,
      plan,
      qty: String(qty),
    });

    if (!order) return { ok: false, error: "That plan is no longer available." };

    const target = await ownedTarget(install);

    if (!target) {
      return { ok: false, error: "That eSIM is not on your account." };
    }

    // Replacing the plan on one card cannot be done more than once at a time.
    if (target.kind === "existing" && order.quantity !== 1) {
      return { ok: false, error: "Adding to an existing eSIM takes one plan." };
    }

    /**
     * The catalog is priced in euros; the customer is billed in the currency
     * the header is set to. Converting the unit price and letting Stripe do the
     * multiplication is what makes the total on the summary and the total on
     * the card the same number.
     */
    const unitPrice = convertMoney(order.unitPrice, currency);
    const total = scaleMoney(unitPrice, order.quantity);

    // Currency is part of the shape: an open euro session must not be handed
    // back to somebody who has since switched to dirhams.
    const shape = `${order.plan.id}:${order.quantity}:${currency}:${
      target.kind === "existing" ? target.iccid : "new"
    }`;
    const key = claimKey(session.yesimUserId, shape);

    const claimed = await redis().get<string>(key);

    if (claimed) {
      const open = await openSessionUrl(claimed);

      if (open) return { ok: true, url: open };
    }

    const site = await returnOrigin();

    // Abandoning the payment offers the same checkout back, still filled in.
    const back = new URLSearchParams({
      kind,
      destination,
      plan,
      qty: String(qty),
    }).toString();

    const record = await createOrder({
      accountId: session.yesimUserId,
      email: session.email,
      planId: order.plan.id,
      destination: order.destination.name,
      quantity: order.quantity,
      amount: total.amount,
      currency: currency.toLowerCase(),
      install: target,
      back,
    });

    const checkout = await stripe().checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: session.email,
        client_reference_id: record.id,
        line_items: [
          {
            quantity: order.quantity,
            price_data: {
              currency: record.currency,
              unit_amount: unitPrice.amount,
              product_data: {
                name: `${order.destination.name} eSIM`,
                description: `${order.plan.data} · ${order.plan.days} day${
                  order.plan.days === 1 ? "" : "s"
                }`,
              },
            },
          },
        ],
        // Read back by the webhook. Everything it needs to fulfil the order.
        metadata: {
          orderId: record.id,
          accountId: record.accountId,
          planId: record.planId,
          quantity: String(record.quantity),
          install: target.kind,
          iccid: target.kind === "existing" ? target.iccid : "",
        },
        payment_intent_data: { metadata: { orderId: record.id } },
        success_url: `${site}/checkout/success?order=${record.id}`,
        cancel_url: `${site}/checkout/failed?order=${record.id}`,
      },
      { idempotencyKey: record.id },
    );

    if (!checkout.url) return { ok: false, error: "Stripe returned no payment page." };

    await attachSession(record.id, checkout.id);
    await redis().set(key, record.id, { ex: CLAIM_SECONDS });

    return { ok: true, url: checkout.url };
  } catch (cause) {
    console.error("startCheckout failed:", cause);

    if (tooSmall(cause)) {
      return {
        ok: false,
        error:
          "This plan costs less than a card payment allows. Please pick a larger plan.",
      };
    }

    return { ok: false, error: "We could not start the payment. Try again." };
  }
}

/**
 * Card networks cost more to run than the smallest plans in the catalog are
 * worth, so Stripe refuses anything under roughly half a franc. 54 of the 1520
 * plans sit below that line — all of them the 0.49 GB day passes. Stripe is
 * asked rather than guessed at, because the threshold is in the account's
 * currency and moves with the exchange rate.
 */
function tooSmall(cause: unknown): boolean {
  return (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    cause.code === "amount_too_small"
  );
}

/**
 * Confirms the chosen eSIM really belongs to this account. The browser names an
 * ICCID; without this check it could name anybody's.
 */
async function ownedTarget(
  install: InstallChoice,
): Promise<InstallChoice | null> {
  if (install.kind === "new") return install;

  const targets = await listInstallTargets();

  // The list failed to load, so ownership cannot be proven. Refuse rather than
  // charge for a plan we may not be able to write anywhere.
  if (!targets) return null;

  const match = targets.find((entry) => entry.iccid === install.iccid);

  return match ? { kind: "existing", iccid: match.iccid, name: match.name } : null;
}