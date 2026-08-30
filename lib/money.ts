/**
 * Every price in the catalog arrives from Yesim in euros. The euro is therefore
 * the base: nothing is stored in a display currency, and a conversion is only
 * ever applied at the last moment — when a price is painted, or when Stripe is
 * told what to charge.
 */
/**
 * Only currencies the Stripe account can actually settle in. Offering one it
 * cannot is invisible until checkout, where Stripe refuses the session outright
 * — the customer picks a plan, presses Pay and hits a dead end. BHD was here
 * and did exactly that: the account has no Bahraini bank account, so `bhd` is
 * absent from the list Stripe accepts. Adding a currency back means adding a
 * bank account for it in the Stripe dashboard first.
 */
export const currencyCodes = ["EUR", "USD", "CHF", "AED"] as const;

export type Currency = (typeof currencyCodes)[number];

export const BASE_CURRENCY: Currency = "EUR";

export type Money = {
  amount: number;
  currency: Currency;
};

type CurrencyFacts = {
  /** Decimal places the currency is written with. Not every currency has two. */
  decimals: number;
  /**
   * Units of this currency one euro buys. Fixed on purpose: a live rate would
   * mean the price on the plan card and the price on the Stripe page could be
   * fetched either side of a tick and disagree.
   */
  rate: number;
  /**
   * Coarsest step an amount is allowed to land on, in minor units. `1` for
   * every currency here, since all four are two-decimal ones. It exists for the
   * three-decimal currencies — Stripe rejects those unless the last digit is
   * zero, so one would need `step: 10` to be quantised here rather than rounded
   * by Stripe into a total the customer was never shown.
   */
  step: number;
  /** Spoken name, for the currency menu. */
  label: string;
};

export const currencies: Record<Currency, CurrencyFacts> = {
  EUR: { decimals: 2, rate: 1, step: 1, label: "Euro" },
  USD: { decimals: 2, rate: 1.08, step: 1, label: "US Dollar" },
  CHF: { decimals: 2, rate: 0.94, step: 1, label: "Swiss Franc" },
  AED: { decimals: 2, rate: 3.97, step: 1, label: "UAE Dirham" },
};

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && Object.hasOwn(currencies, value);
}

const minorUnits = (currency: Currency) => 10 ** currencies[currency].decimals;

export function money(amount: number, currency: Currency): Money {
  const { step } = currencies[currency];

  return { amount: Math.round(amount / step) * step, currency };
}

export function scaleMoney({ amount, currency }: Money, by: number): Money {
  return money(amount * by, currency);
}

/**
 * Back to euros, then out to the target. Converting the unit price and scaling
 * that by the quantity — rather than converting an already-multiplied total —
 * is what keeps the summary's `x times y` line adding up to the charge, since
 * Stripe multiplies a converted unit amount too.
 */
export function convertMoney(value: Money, to: Currency): Money {
  if (value.currency === to) return value;

  const euros = value.amount / minorUnits(value.currency) / currencies[value.currency].rate;

  return money(euros * currencies[to].rate * minorUnits(to), to);
}

const formatters = new Map<Currency, Intl.NumberFormat>();

function formatterFor(currency: Currency): Intl.NumberFormat {
  const cached = formatters.get(currency);

  if (cached) return cached;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  });

  formatters.set(currency, formatter);

  return formatter;
}

/**
 * `en-US` puts the euro and dollar signs in front of the digits but writes the
 * franc and dirham as a leading code — `AED 12.34`. Prices sit next to each
 * other in the catalog, so the mark is moved after the number for those two and
 * every price lines up on its first digit whichever currency is selected.
 *
 * Only the currency part is moved: the grouping and the decimal count still
 * come from `Intl`, which is what would keep a three-decimal currency at three
 * places if one were added.
 */
export function formatMoney({ amount, currency }: Money): string {
  const parts = formatterFor(currency).formatToParts(amount / minorUnits(currency));

  // Not necessarily index 0: a negative amount puts the minus sign first, and
  // the sign has to stay in front of the digits when the code moves behind them.
  const at = parts.findIndex((part) => part.type === "currency");

  // A *symbol* (€, $) is left where it is; only an alphabetic code is moved,
  // which is the form the franc and dirham take.
  const moves =
    at !== -1 &&
    /^\p{L}+$/u.test(parts[at].value) &&
    parts.slice(0, at).every((part) => part.type !== "integer");

  if (!moves) return parts.map((part) => part.value).join("");

  const mark = parts[at].value;
  // Drop the separator the formatter put between the code and the digits.
  const gap = parts[at + 1]?.type === "literal" ? 2 : 1;
  const rest = [...parts.slice(0, at), ...parts.slice(at + gap)];

  return `${rest.map((part) => part.value).join("")} ${mark}`;
}
