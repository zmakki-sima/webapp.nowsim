import type { Metadata } from "next";

import { AllDestinations } from "@/components/sections/destinations/AllDestinations";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getDestinationSummaries } from "@/lib/data/catalog";
import { isDestinationFilter, type DestinationFilter } from "@/lib/types";

export const metadata: Metadata = {
  title: "All destinations - nowsim",
  description:
    "Browse nowsim data plans across 200+ countries, regional bundles, and global plans. Pick a destination and connect the moment you land.",
};

export default async function AllDestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ q, kind }, destinations] = await Promise.all([
    searchParams,
    getDestinationSummaries(),
  ]);

  const initialQuery = Array.isArray(q) ? (q[0] ?? "") : (q ?? "");

  const rawKind = Array.isArray(kind) ? kind[0] : kind;
  const initialKind: DestinationFilter = isDestinationFilter(rawKind)
    ? rawKind
    : "all";

  return (
    <section className="px-3 pb-20 pt-28 md:px-4 md:py-28">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb
          className="mb-10"
          items={[
            { label: "Home", href: "/" },
            { label: "All destinations" },
          ]}
        />

        <h1 className="max-w-[14ch] font-display text-h1 font-extrabold uppercase tracking-[-0.045em]">
          All destinations
        </h1>

        <p className="mt-5 max-w-[52ch] text-lg text-muted md:text-xl">
          Find the best data plan in over 200 destinations. One account, instant
          activation, and no roaming bill wherever you go.
        </p>

        <AllDestinations
          destinations={destinations}
          initialQuery={initialQuery}
          initialKind={initialKind}
        />
      </div>
    </section>
  );
}
