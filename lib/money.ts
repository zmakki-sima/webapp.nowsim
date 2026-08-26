/**
 * Every price in the catalog arrives from Yesim in euros. The euro is therefore
 * the base: nothing is stored in a display currency, and a conversion is only
 * ever applied at the last moment — when a price is painted, or when Stripe is
 * told what to charge.
 */
export const currencyCodes = ["EUR", "USD", "BHD", "AED"] as const;

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
   * Coarsest step an amount is allowed to land on, in minor units. Stripe
   * rejects a three-decimal amount whose last digit is not zero, so the dinar
   * is quantised to 10 fils here rather than being rounded down by Stripe into
   * a total the customer was never shown.
   */
  step: number;
  /** Spoken name, for the currency menu. */
  label: string;
  /** Short mark, for the currency menu's trigger. */
  symbol: string;
};

export const currencies: Record<Currency, CurrencyFacts> = {
  EUR: { decimals: 2, rate: 1, step: 1, label: "Euro", symbol: "€" },
  USD: { decimals: 2, rate: 1.08, step: 1, label: "US Dollar", symbol: "$" },
  BHD: {
    decimals: 3,
    rate: 0.41,
    step: 10,
    label: "Bahraini Dinar",
    symbol: "BD",
  },
  AED: { decimals: 2, rate: 3.97, step: 1, label: "UAE Dirham", symbol: "AED" },
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

export function formatMoney({ amount, currency }: Money): string {
  return formatterFor(currency).format(amount / minorUnits(currency));
}
