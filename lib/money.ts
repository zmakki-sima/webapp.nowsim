export type Currency = "EUR" | "USD";

export type Money = {
  amount: number;
  currency: Currency;
};

export function money(amount: number, currency: Currency): Money {
  return { amount: Math.round(amount), currency };
}

export function scaleMoney({ amount, currency }: Money, by: number): Money {
  return { amount: Math.round(amount * by), currency };
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
  return formatterFor(currency).format(amount / 100);
}
