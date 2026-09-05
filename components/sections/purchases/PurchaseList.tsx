import { MdReceiptLong } from "react-icons/md";

import { PurchaseCard } from "@/components/sections/purchases/PurchaseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Purchase } from "@/lib/types";

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

      <div className="mt-8">
        {purchases.length === 0 ? (
          <EmptyState
            tone="neutral"
            icon={<MdReceiptLong aria-hidden className="h-7 w-7 text-muted" />}
            title="Nothing bought yet"
            description="Every eSIM you buy shows up here with what you paid for it"
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {purchases.map((purchase) => (
              <PurchaseCard key={purchase.id} purchase={purchase} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
