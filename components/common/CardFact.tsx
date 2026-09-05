import { cn } from "@/lib/cn";

import type { EsimState } from "@/lib/types";

/**
 * The two account cards — an eSIM and the purchase that paid for it — are the
 * same object seen twice, so they share the badge and the label/value pairs
 * under it. Only the fill of the badge differs, and that stays with the caller.
 */
export const cardPill = cn(
  "shrink-0 rounded-full px-3 py-1",
  "text-[0.8125rem]/[1.125rem] font-bold",
);

/**
 * The fill of that badge, by state. Shared so an eSIM keeps the same colour
 * wherever it is listed — the account page and the checkout picker read as the
 * same object rather than two views that happen to disagree about "Expired".
 */
export const cardPillTone: Record<EsimState, string> = {
  installed: "bg-success/12 text-success",
  issued: "bg-ink/8 text-muted",
  ready: "bg-brand/15 text-brand",
  expired: "bg-danger/12 text-danger",
  removed: "bg-danger/15 text-danger",
};

/** The plan's shape — data and validity — read under the title on both cards. */
export const cardSpec = cn(
  "shrink-0 rounded-full px-2.5 py-0.5",
  "text-[0.8125rem]/[1.125rem] font-medium text-brand",
  /* Brand-tinted, not grey — greys go muddy on the lilac card. */
  "bg-brand/10",
);

export const factLabel = "text-[0.8125rem]/[1.125rem] text-muted";

export const factValue = "mt-0.5 text-base font-bold tracking-[-0.01em]";

export function Fact({
  label,
  value,
  unbroken = false,
}: {
  label: string;
  value: string;
  /**
   * The value is one long run without spaces (an ICCID). Lets it wrap mid-word
   * rather than push the row wider than the card.
   */
  unbroken?: boolean;
}) {
  return (
    <div className={unbroken ? "min-w-0" : undefined}>
      <dt className={factLabel}>{label}</dt>
      <dd className={unbroken ? cn(factValue, "break-all") : factValue}>
        {value}
      </dd>
    </div>
  );
}
