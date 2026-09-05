import Image from "next/image";
import { MdReceiptLong } from "react-icons/md";

import { cardPill, cardSpec, Fact } from "@/components/common/CardFact";
import { Price } from "@/components/common/Price";
import { cn } from "@/lib/cn";
import type { Purchase } from "@/lib/types";
import { formatDay } from "@/lib/units";

const pill = cn(cardPill, "bg-brand/15 text-brand");

export function PurchaseCard({ purchase }: { purchase: Purchase }) {
  const { plan, price } = purchase;

  return (
    <li className="rounded-sheet bg-surface-soft p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          {plan?.art ? (
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-brand/10">
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
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10">
              <MdReceiptLong aria-hidden className="h-5 w-5 text-muted" />
            </span>
          )}

          <div className="min-w-0">
            <h3 className="truncate text-h3">
              {plan ? `${plan.destination} eSIM` : "eSIM"}
            </h3>

            {plan && (
              <p className="mt-2 flex flex-wrap items-center gap-2">
                <span className={cardSpec}>{plan.data}</span>
                <span className={cardSpec}>
                  {plan.days} day{plan.days === 1 ? "" : "s"}
                </span>
              </p>
            )}
          </div>
        </div>

        {price && (
          <span className={pill}>
            <Price money={price} />
          </span>
        )}
      </div>

      {/* Data and validity are the pills above — what is left is what the eSIM
          card cannot say: when it was bought, and which SIM it landed on. */}
      {(purchase.boughtAt || purchase.iccid) && (
        <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-4">
          {purchase.boughtAt && (
            <Fact label="Bought" value={formatDay(purchase.boughtAt)} unbroken />
          )}

          {purchase.iccid && (
            <Fact label="ICCID" value={purchase.iccid} unbroken />
          )}
        </dl>
      )}
    </li>
  );
}
