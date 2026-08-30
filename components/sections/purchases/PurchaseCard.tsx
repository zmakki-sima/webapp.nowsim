import Image from "next/image";
import { MdReceiptLong } from "react-icons/md";

import { Price } from "@/components/common/Price";
import { cn } from "@/lib/cn";
import type { Purchase } from "@/lib/types";
import { formatDay } from "@/lib/units";

const pill = cn(
  "shrink-0 rounded-full px-3 py-1",
  "text-[0.8125rem]/[1.125rem] font-bold",
  "bg-brand/15 text-brand",
);

const factLabel = "text-[0.8125rem]/[1.125rem] text-muted";

const factValue = "mt-0.5 text-base font-bold tracking-[-0.01em]";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className={factLabel}>{label}</dt>
      <dd className={cn(factValue, "break-all")}>{value}</dd>
    </div>
  );
}

export function PurchaseCard({ purchase }: { purchase: Purchase }) {
  const { plan, price } = purchase;

  return (
    <li className="px-1 py-8 first:pt-0 last:pb-0 md:px-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          {plan?.art ? (
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-ink/8">
              <Image
                src={plan.art}
                alt=""
                fill
                quality={90}
                sizes="44px"
                unoptimized={plan.art.endsWith(".svg")}
                className="object-cover"
              />
            </span>
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink/8">
              <MdReceiptLong aria-hidden className="h-5 w-5 text-muted" />
            </span>
          )}

          <h3 className="min-w-0 truncate text-h3">
            {plan ? `${plan.destination} eSIM` : "eSIM"}
          </h3>
        </div>

        {price && (
          <span className={pill}>
            <Price money={price} />
          </span>
        )}
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-3">
        {plan && (
          <>
            <Fact label="Data" value={plan.data} />
            <Fact
              label="Validity"
              value={`${plan.days} day${plan.days === 1 ? "" : "s"}`}
            />
          </>
        )}

        {purchase.boughtAt && (
          <Fact label="Bought" value={formatDay(purchase.boughtAt)} />
        )}

        {purchase.iccid && <Fact label="ICCID" value={purchase.iccid} />}
      </dl>
    </li>
  );
}
