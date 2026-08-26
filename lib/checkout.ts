import type { DestinationKind } from "@/lib/types";

/**
 * Yesim issues one eSIM per call and has no bulk endpoint, so an order of `n`
 * cards is `n` sequential calls that all have to finish inside the webhook's
 * time limit. Three fits comfortably; ten did not.
 */
export const MAX_ESIMS = 3;

export function checkoutHref(
  destinationKind: DestinationKind,
  destinationSlug: string,
  planId: string,
  quantity: number,
): string {
  const params = new URLSearchParams({
    kind: destinationKind,
    destination: destinationSlug,
    plan: planId,
    qty: String(quantity),
  });

  return `/checkout?${params}`;
}

/** The order, reduced to what the install dialog needs to show. */
export type OrderBrief = {
  name: string;
  art: string;
  detail: string;
};

/**
 * Where the purchased plan is written. Decided before payment, because the
 * fulfilment step runs long after the customer has left the page.
 */
export type InstallChoice =
  | { kind: "new" }
  | { kind: "existing"; iccid: string; name: string };

/**
 * What the browser is allowed to say about an order: which plan, how many.
 * Never the price — the server looks that up again from the catalog.
 */
export type OrderParams = {
  kind: string;
  destination: string;
  plan: string;
  qty: string;
};

export function clampQuantity(raw: string | undefined): number {
  const parsed = Math.trunc(Number(raw));

  if (!Number.isFinite(parsed)) return 1;

  return Math.min(MAX_ESIMS, Math.max(1, parsed));
}
