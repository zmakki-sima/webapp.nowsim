import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PurchaseList } from "@/components/sections/purchases/PurchaseList";
import { getPurchases } from "@/lib/data/purchases";

export const metadata: Metadata = {
  title: "Purchase History - nowsim",
  description: "Every eSIM you have bought and what you paid for it.",
  robots: { index: false, follow: false },
};

export default async function PurchasesPage() {
  const purchases = await getPurchases();

  if (!purchases) redirect("/");

  return (
    <section className="px-3 pb-20 pt-28 md:px-4 md:py-28">
      <div className="mx-auto max-w-3xl">
        <PurchaseList purchases={purchases} title="Purchase History" />
      </div>
    </section>
  );
}
