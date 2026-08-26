import Image from "next/image";

import { Price } from "@/components/common/Price";
import { Pressable } from "@/components/ui/Pressable";
import type { Order } from "@/lib/order";
import { destinationHref } from "@/lib/types";
import { cn } from "@/lib/cn";

const line = "flex items-baseline justify-between gap-4 text-sm";

export function OrderSummary({ order }: { order: Order }) {
  // The total is derived from the converted unit price rather than read off the
  // order, so the line above and the charge on the card agree in every currency.
  const { destination, plan, quantity, unitPrice } = order;

  return (
    <div className="rounded-sheet bg-surface-soft p-6 md:p-8">
      <h2 className="text-h3 font-bold">Order summary</h2>

      <div className="mt-6 flex items-center gap-4">
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-brand/12">
          <Image
            src={destination.art}
            alt=""
            fill
            quality={90}
            sizes="48px"
            unoptimized={destination.art.endsWith(".svg")}
            className="object-cover"
          />
        </span>

        <div className="min-w-0">
          <p className="text-base font-bold tracking-[-0.01em]">
            {destination.name} eSIM
          </p>
          <p className="text-sm text-muted">
            {plan.data} &middot; {plan.days} days
          </p>
        </div>
      </div>

      <dl className="mt-6 flex flex-col gap-3 border-t border-hairline pt-6">
        <div className={line}>
          <dt className="text-muted">
            <Price money={unitPrice} /> &times; {quantity} eSIM
            {quantity > 1 ? "s" : ""}
          </dt>
          <dd className="font-bold">
            <Price money={unitPrice} times={quantity} />
          </dd>
        </div>

        <div className={line}>
          <dt className="text-muted">Taxes and fees</dt>
          <dd className="font-bold">Included</dd>
        </div>

        <div className={line}>
          <dt className="text-muted">Delivery</dt>
          <dd className="font-bold">Instant, by email</dd>
        </div>
      </dl>

      <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-hairline pt-6">
        <p className="text-base font-bold">Total</p>
        <p className="text-h3 font-bold tracking-[-0.02em]">
          <Price money={unitPrice} times={quantity} />
        </p>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-muted">
        Charged once. Your eSIM stays dormant until you install it, so you can
        buy now and activate the day you land.
      </p>

      <Pressable
        href={destinationHref(destination.kind, destination.slug)}
        className={cn(
          "mt-5 w-full rounded-full border border-brand px-6 py-3",
          "text-sm font-bold text-brand",
          "hover:bg-brand/8 active:bg-brand/8",
        )}
      >
        Change plan
      </Pressable>
    </div>
  );
}
