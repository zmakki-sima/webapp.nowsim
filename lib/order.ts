import "server-only";

import { parseQuantity } from "@/lib/checkout";
import { getDestination } from "@/lib/data/catalog";
import { scaleMoney, type Money } from "@/lib/money";
import { isDestinationKind, type Destination, type Plan } from "@/lib/types";

export type Order = {
  destination: Destination;
  plan: Plan;
  quantity: number;
  unitPrice: Money;
  total: Money;
};

type SearchParams = { [key: string]: string | string[] | undefined };

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function resolveOrder(
  searchParams: SearchParams,
): Promise<Order | undefined> {
  const kind = one(searchParams.kind);

  if (!isDestinationKind(kind)) return undefined;

  const destination = await getDestination(
    kind,
    one(searchParams.destination) ?? "",
  );

  if (!destination) return undefined;

  const planId = one(searchParams.plan);
  const plan = destination.plans.find((candidate) => candidate.id === planId);

  if (!plan) return undefined;

  const quantity = parseQuantity(one(searchParams.qty));

  if (quantity === undefined) return undefined;

  return {
    destination,
    plan,
    quantity,
    unitPrice: plan.price,
    total: scaleMoney(plan.price, quantity),
  };
}
