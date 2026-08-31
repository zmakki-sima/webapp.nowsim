"use client";

import { useState } from "react";
import { MdChevronRight } from "react-icons/md";

import { DestinationCard } from "@/components/common/DestinationCard";
import { Pressable } from "@/components/ui/Pressable";
import { Tabs } from "@/components/ui/Tabs";
import type { DestinationKind, DestinationSummary } from "@/lib/types";
import { cn } from "@/lib/cn";

const tabs: { id: DestinationKind; label: string; badge?: string }[] = [
  { id: "country", label: "Countries" },
  { id: "region", label: "Regions" },
  { id: "global", label: "Global", badge: "New" },
];

export function Destinations({
  previews,
}: {
  previews: Record<DestinationKind, DestinationSummary[]>;
}) {
  const [active, setActive] = useState<DestinationKind>("country");

  return (
    <section
      aria-labelledby="destinations-heading"
      className="px-3 py-20 md:px-4 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="min-w-0">
            <h2
              id="destinations-heading"
              className={cn(
                "max-w-[15ch] font-display font-extrabold uppercase tracking-[-0.03em]",
                "text-[clamp(2.25rem,1.5rem+3.6vw,4.25rem)] leading-[1.02]",
              )}
            >
              Popular <span className="text-brand">Destinations</span>
            </h2>

            <p className="mt-5 max-w-[46ch] text-lg text-muted md:text-xl">
              200+ destinations on one account. Pick a country, a whole region,
              or go global. Activation is instant, and the plan starts when you
              land.
            </p>
          </div>

          <Tabs
            items={tabs}
            value={active}
            onChange={setActive}
            label="Destination type"
            tabId={(id) => `destinations-tab-${id}`}
            panelId={(id) => `destinations-panel-${id}`}
            className="min-w-0 self-start md:self-auto"
          />
        </div>

        <div
          role="tabpanel"
          id={`destinations-panel-${active}`}
          aria-labelledby={`destinations-tab-${active}`}
          className="mt-10 md:mt-14"
        >
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))] lg:gap-4">
            {previews[active].map((destination) => (
              <li key={`${destination.kind}/${destination.slug}`}>
                <DestinationCard destination={destination} />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex justify-end border-t border-hairline pt-8">
          <Pressable
            href="/destinations"
            className={cn(
              "group gap-2 rounded-full bg-brand px-6 py-3.5",
              "text-base font-bold text-white",
              "hover:bg-brand-soft active:bg-brand-soft",
            )}
          >
            Show all destinations
            <MdChevronRight
              aria-hidden
              className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-300 ease-hover",
                "group-hover:translate-x-0.5 motion-reduce:transition-none",
              )}
            />
          </Pressable>
        </div>
      </div>
    </section>
  );
}
