"use client";

import { useCurrency } from "@/components/layout/CurrencyStore";
import { convertMoney, formatMoney, scaleMoney, type Money } from "@/lib/money";

/**
 * A catalog price, shown in whichever currency the header is set to. Converting
 * before scaling — never the other way round — keeps a quantity of three
 * agreeing with the three line items Stripe will charge for.
 */
export function usePrice(value: Money, times = 1): string {
  const currency = useCurrency();
  const converted = convertMoney(value, currency);

  return formatMoney(times === 1 ? converted : scaleMoney(converted, times));
}

export function Price({ money, times }: { money: Money; times?: number }) {
  return usePrice(money, times);
}
