import { MdReceiptLong } from "react-icons/md";

import { PurchaseCard } from "@/components/sections/purchases/PurchaseCard";
import { cn } from "@/lib/cn";
import type { Purchase } from "@/lib/types";

function Empty() {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-sheet",
        "bg-ink/5 px-6 py-24 text-center",
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-card bg-ink/8">
        <MdReceiptLong aria-hidden className="h-7 w-7 text-muted" />
      </span>

      <h2 className="mt-5 text-lg font-bold tracking-[-0.02em]">
        Nothing bought yet
      </h2>

      <p className="mt-1 text-base text-muted">
        Every eSIM you buy shows up here with what you paid for it
      </p>
    </div>
  );
}

export function PurchaseList({
  purchases,
  title,
}: {
  purchases: Purchase[];
  title: string;
}) {
  return (
    <>
      <h1 className="font-display text-h2 font-extrabold tracking-[-0.045em]">
        {title}
      </h1>

      <div className="mt-12">
        {purchases.length === 0 ? (
          <Empty />
        ) : (
          <ul className="flex flex-col divide-y divide-hairline">
            {purchases.map((purchase) => (
              <PurchaseCard key={purchase.id} purchase={purchase} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
