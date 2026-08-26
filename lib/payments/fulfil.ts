import "server-only";

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

    await markFailed(order.id, reason, issued);

    alert(order, `provisioning failed after ${issued.length} of ${order.quantity}: ${reason}`);

    return;
  }

  // The cards exist and are paid for. From here nothing may re-buy anything:
  // a failed email is an annoyance, a repeated purchase is a real loss.
  await markFulfilled(order.id, issued);

  await deliver(order, issued);
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
    alert(order, `issued ${issued.length} eSIM(s) but could not read them back: ${reasonOf(cause)}`);

    return;
  }

  for (const entry of issued) {
    const esim = account.get(entry.iccid);

    if (!esim) {
      alert(order, `eSIM ${entry.iccid} was issued but Yesim does not list it`);

      continue;
    }

    try {
      // A card the customer already installed needs a confirmation, not
      // instructions for installing it a second time.
      await (order.install.kind === "existing"
        ? sendPlanAddedEmail(order.email, esim)
        : sendEsimEmail(order.email, esim));
    } catch (cause) {
      alert(
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
 * Money is held and something did not arrive. Console for now — the alert
 * channel is still undecided — but tagged so it can be routed to a person
 * without hunting through the rest of the log.
 */
function alert(order: OrderRecord, detail: string): void {
  console.error(
    `[ORDER NEEDS ATTENTION] ${order.id} · ${order.email} · ${order.destination} · ${detail}`,
  );
}
