import "server-only";

import { sendOrderAlertEmail } from "@/lib/mail/alert";
import { sendEsimEmail, sendPlanAddedEmail } from "@/lib/mail/esim";
import {
  appendIssued,
  markFailed,
  markFulfilled,
  type IssuedEsim,
  type OrderRecord,
} from "@/lib/payments/orders";
import {
  addPlanToEsim,
  issueEsim,
  readAccountEsims,
} from "@/lib/payments/provision";
import type { Esim } from "@/lib/types";

/**
 * Turns a paid order into a delivered eSIM. Runs only from the Stripe webhook,
 * only after the money has cleared, and only once — the order record advances
 * from `paid`, so a second attempt on a finished order does nothing.
 *
 * Never throws. The caller has already taken the customer's money; an exception
 * escaping here would tell Stripe to retry a step that cannot safely be retried.
 * A failure is recorded on the order and shouted about instead.
 */
export async function fulfilOrder(order: OrderRecord): Promise<void> {
  if (order.status !== "paid") return;

  const issued: IssuedEsim[] = [...order.issued];

  try {
    if (order.install.kind === "existing") {
      // One card, one plan written onto it. `issued` being non-empty means a
      // previous attempt already got this far.
      if (issued.length === 0) {
        await addPlanToEsim(order.install.iccid, order.planId, order.id);
        await appendIssued(order.id, { iccid: order.install.iccid });
        issued.push({ iccid: order.install.iccid });
      }
    } else {
      // Yesim has no bulk endpoint, so `quantity` cards means `quantity` calls.
      // Each is banked before the next is attempted.
      while (issued.length < order.quantity) {
        const iccid = await issueEsim(order.accountId, order.planId);

        await appendIssued(order.id, { iccid });
        issued.push({ iccid });
      }
    }
  } catch (cause) {
    const reason = reasonOf(cause);

    // The stored record, not the one this function started with: it carries the
    // `failed` status and the cards actually banked, which is what the alert
    // reports. Falling back keeps a failed write from silencing the alert.
    const failed = await markFailed(order.id, reason, issued);

    await alert(
      failed ?? { ...order, status: "failed", issued },
      `provisioning failed after ${issued.length} of ${order.quantity}: ${reason}`,
    );

    return;
  }

  // The cards exist and are paid for. From here nothing may re-buy anything:
  // a failed email is an annoyance, a repeated purchase is a real loss.
  const fulfilled = await markFulfilled(order.id, issued);

  // Anything alerted from here on describes a `fulfilled` order, so hand on the
  // stored record rather than the `paid` copy this function was called with.
  await deliver(fulfilled ?? { ...order, status: "fulfilled", issued }, issued);
}

/**
 * Emails each card. The account is read back from Yesim first — that both proves
 * the cards landed and fetches the QR image, which `new_esim` does not return.
 *
 * A failure here leaves the order `fulfilled`, because it is: the customer owns
 * the eSIM and can see it under `/esims`. It still needs a human, since they do
 * not yet know that. One card failing to send does not stop the others.
 */
async function deliver(
  order: OrderRecord,
  issued: IssuedEsim[],
): Promise<void> {
  let account: Map<string, Esim>;

  try {
    account = await readAccountEsims(order.accountId);
  } catch (cause) {
    await alert(
      order,
      `issued ${issued.length} eSIM(s) but could not read them back: ${reasonOf(cause)}`,
    );

    return;
  }

  for (const entry of issued) {
    const esim = account.get(entry.iccid);

    if (!esim) {
      await alert(
        order,
        `eSIM ${entry.iccid} was issued but Yesim does not list it`,
      );

      continue;
    }

    try {
      // A card the customer already installed needs a confirmation, not
      // instructions for installing it a second time.
      await (order.install.kind === "existing"
        ? sendPlanAddedEmail(order.email, esim)
        : sendEsimEmail(order.email, esim));
    } catch (cause) {
      await alert(
        order,
        `eSIM ${entry.iccid} was issued but not emailed: ${reasonOf(cause)}`,
      );
    }
  }
}

function reasonOf(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/**
 * Money is held and something did not arrive.
 *
 * Refunding is deliberately not automatic: the published refund policy is
 * request-and-review within 15 business days, so a person issues the refund
 * from the Stripe dashboard and `charge.refunded` brings the order back in
 * step. That makes this the only thing standing between a failed order and a
 * customer who paid for nothing — it has to reach someone.
 *
 * Two destinations, in this order. The console line is written first and
 * unconditionally: it costs nothing, cannot fail, and is the record that
 * survives if the mail does not. The mail is what actually reaches a person —
 * customer service, at ORDER_ALERT_EMAIL (PAYMENT.md §13.5).
 *
 * The mail failing is caught here rather than thrown. `fulfilOrder` must never
 * throw, and a supervisor who cannot be emailed is not a reason to tell Stripe
 * to retry a purchase that must not be retried. A failed alert is logged loudly
 * enough to be found — this is the one case where the console line is all we
 * have left.
 */
async function alert(order: OrderRecord, detail: string): Promise<void> {
  console.error(
    `[ORDER NEEDS ATTENTION] ${order.id} · ${order.email} · ${order.destination} · ${detail}`,
  );

  try {
    await sendOrderAlertEmail(order, detail);
  } catch (cause) {
    console.error(
      `[ALERT UNDELIVERED] could not email the order alert for ${order.id}: ${reasonOf(cause)}`,
    );
  }
}
