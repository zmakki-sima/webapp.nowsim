"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { orderStatus } from "@/app/actions/checkout";
import type { OrderStatus } from "@/lib/payments/orders";

const EVERY_MS = 3000;

/** Two minutes. Past that, Stripe is late enough that refreshing is on them. */
const MAX_CHECKS = 40;

/**
 * The webhook lands a second or two after the customer does, so this page is
 * usually rendered before the payment is confirmed. Rather than ask them to
 * refresh, it asks the server what the order says and re-renders when it
 * changes. It reads status only — nothing here grants anything.
 */
export function OrderWatch({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const router = useRouter();

  useEffect(() => {
    if (status !== "pending" && status !== "paid") return;

    let live = true;
    let checks = 0;

    const timer = setInterval(async () => {
      checks += 1;

      if (checks > MAX_CHECKS) {
        clearInterval(timer);

        return;
      }

      const next = await orderStatus(id).catch(() => null);

      if (live && next && next !== status) router.refresh();
    }, EVERY_MS);

    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [id, status, router]);

  return null;
}
