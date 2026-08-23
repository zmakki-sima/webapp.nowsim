import "server-only";

import { toPurchases } from "@/lib/api/mappers";
import { ordersResponseSchema } from "@/lib/api/schemas";
import { fetchYesim } from "@/lib/api/yesim";
import { verifySession } from "@/lib/auth/dal";
import { getPlanIndex } from "@/lib/data/catalog";
import type { Purchase } from "@/lib/types";

export async function getPurchases(): Promise<Purchase[] | null> {
  const session = await verifySession();

  if (!session) return null;

  const [orders, plans] = await Promise.all([
    fetchYesim("orders", ordersResponseSchema, {
      params: { search: session.yesimUserId },
    }),
    getPlanIndex(),
  ]);

  const mine = orders.filter((order) => order.user_id === session.yesimUserId);

  return toPurchases(mine, plans);
}
