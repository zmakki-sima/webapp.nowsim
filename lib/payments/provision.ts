import "server-only";

import { z } from "zod";

import { toEsims } from "@/lib/api/mappers";
import { newEsimResponseSchema, userResponseSchema } from "@/lib/api/schemas";
import { fetchYesim, postYesim } from "@/lib/api/yesim";
import { getPlanIndex } from "@/lib/data/catalog";
import type { Esim } from "@/lib/types";

/**
 * Provisioning is the only place in this codebase that spends money. Every call
 * below debits the partner account, and Yesim documents no way to make a call
 * idempotent: `add_plan_iccid` says outright that resending replaces the plan,
 * and `new_esim` gives back a different card each time it is asked. There is no
 * reference we can hand over that makes a repeat safe.
 *
 * Everything here follows from that. Callers record each success the moment it
 * happens, never after a batch, so a crash halfway through cannot lose the
 * knowledge that a card was already bought. Nothing retries on its own.
 */

/**
 * Yesim answers `200` with a body that describes the failure rather than an
 * error status, so success is judged on the body: `new_esim` has to name an
 * ICCID, and a plan has to be readable back on the card afterwards. A reply that
 * fails to parse is a failure, never an optimistic success.
 */
export class ProvisionError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ProvisionError";
  }
}

/**
 * Creates one eSIM with the plan already on it. `plan_id` is documented as
 * optional — omitting it produces a blank card with nothing to sell — so it is
 * always sent, as is `user_id`: an eSIM issued without one belongs to nobody and
 * cannot be reached from the customer's account.
 */
export async function issueEsim(
  yesimUserId: string,
  planId: string,
): Promise<string> {
  try {
    const created = await fetchYesim("new_esim", newEsimResponseSchema, {
      params: { user_id: yesimUserId, plan_id: planId },
      attempts: 1,
    });

    return created.iccid;
  } catch (cause) {
    throw new ProvisionError(
      `new_esim failed for plan ${planId}`,
      { cause },
    );
  }
}

/**
 * Writes a plan onto a card the customer already installed.
 *
 * Two documented behaviours matter. Sending the plan that is already on the card
 * **adds** to it rather than replacing it, so the customer keeps their data.
 * Sending a different plan **replaces** the current one, which is what the
 * dialog warns about. Either way the profile on the phone stays put.
 *
 * The order id travels as `payment_id`, which Yesim treats as a free-text
 * reference. It buys traceability in their records, not idempotency.
 */
export async function addPlanToEsim(
  iccid: string,
  planId: string,
  orderId: string,
): Promise<void> {
  try {
    await postYesim("add_plan_iccid", z.unknown(), {
      params: { iccid, plan_id: planId, payment_id: orderId },
      attempts: 1,
    });
  } catch (cause) {
    throw new ProvisionError(
      `add_plan_iccid failed for ${iccid}`,
      { cause },
    );
  }
}

/**
 * Reads the whole account back once, however many cards an order produced.
 *
 * Two jobs. It confirms the purchase actually landed — Yesim's own record is
 * better evidence than the reply to the call that made it — and it collects the
 * QR *image*, which `new_esim` does not return but the email embeds.
 *
 * One read for the order rather than one per card: each round trip to Yesim can
 * take ten seconds, and all of them have to fit inside the webhook's budget.
 */
export async function readAccountEsims(
  yesimUserId: string,
): Promise<Map<string, Esim>> {
  const [user, plans] = await Promise.all([
    fetchYesim("user", userResponseSchema, {
      params: { user_id: yesimUserId },
    }),
    getPlanIndex(),
  ]);

  return new Map(
    toEsims(user.esims, plans).map((esim) => [esim.iccid, esim]),
  );
}
