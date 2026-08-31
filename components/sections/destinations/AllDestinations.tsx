"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { DestinationCard } from "@/components/common/DestinationCard";
import { SearchField } from "@/components/ui/SearchField";
import { Tabs } from "@/components/ui/Tabs";
import { createSearchIndex, search } from "@/lib/search/match";
import {
  isDestinationFilter,
  type DestinationFilter,
  type DestinationSummary,
} from "@/lib/types";

const tabs: { id: DestinationFilter; label: string; badge?: string }[] = [
  { id: "all", label: "All" },
  { id: "country", label: "Countries" },
  { id: "region", label: "Regions" },
  { id: "global", label: "Global", badge: "New" },
];

function coverageNote(hits: string[]): string | undefined {
  if (!hits.length) return undefined;

  return hits.length > 1
    ? `Includes ${hits[0]} +${hits.length - 1}`
    : `Includes ${hits[0]}`;
}

export function AllDestinations({
  destinations,
  initialQuery = "",
  initialKind = "all",
}: {
  destinations: DestinationSummary[];
  initialQuery?: string;
  initialKind?: DestinationFilter;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const kindParam = params.get("kind") ?? undefined;
  const active: DestinationFilter = isDestinationFilter(kindParam)
    ? kindParam
    : initialKind;

  const queryParam = params.get("q") ?? initialQuery;

  const [query, setQuery] = useState(queryParam);
  const [seed, setSeed] = useState(queryParam);

  if (queryParam !== seed) {
    setSeed(queryParam);
    setQuery(queryParam);
  }

  function select(kind: DestinationFilter) {
    const next = new URLSearchParams(params);

    if (kind === "all") next.delete("kind");
    else next.set("kind", kind);

    const search = next.toString();

    router.replace(search ? `/destinations?${search}` : "/destinations", {
      scroll: false,
    });
  }

  const index = useMemo(() => createSearchIndex(destinations), [destinations]);

  const results = useMemo(() => {
    const byKind = (kind: DestinationFilter) =>
      active === "all" || kind === active;

    if (!query.trim()) {
      return destinations
        .filter((destination) => byKind(destination.kind))
        .map((destination) => ({ destination, coverageHits: [] as string[] }));
    }

    return search(index, query).filter(({ destination }) =>
      byKind(destination.kind),
    );
  }, [active, destinations, index, query]);

  const direct = results.filter(({ coverageHits }) => !coverageHits.length);
  const covering = results.filter(({ coverageHits }) => coverageHits.length);

  return (
    <>
      <div className="mt-10 flex flex-col-reverse gap-4 md:mt-12 md:flex-row md:items-stretch md:gap-5">
        <SearchField
          value={query}
          onChange={setQuery}
          label="Search for a destination"
          placeholder="Search for a destination"
          className="flex-1"
          inputClassName="md:h-full md:py-0"
        />

        <Tabs
          items={tabs}
          value={active}
          onChange={select}
          label="Destination type"
          tabId={(id) => `all-destinations-tab-${id}`}
          panelId="all-destinations-panel"
          className="min-w-0 shrink-0 md:w-fit"
        />
      </div>

      <div
        id="all-destinations-panel"
        role="tabpanel"
        aria-labelledby={`all-destinations-tab-${active}`}
        className="mt-8 md:mt-10"
      >
        <p aria-live="polite" className="sr-only">
          {results.length} destinations
        </p>

        {results.length ? (
          <>
            {direct.length ? (
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))] lg:gap-4">
                {direct.map(({ destination }) => (
                  <li key={`${destination.kind}/${destination.slug}`}>
                    <DestinationCard destination={destination} />
                  </li>
                ))}
              </ul>
            ) : null}

            {covering.length ? (
              <section className={direct.length ? "mt-10" : undefined}>
                <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted">
                  Other plans
                </h2>

                <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))] lg:gap-4">
                  {covering.map(({ destination, coverageHits }) => (
                    <li key={`${destination.kind}/${destination.slug}`}>
                      <DestinationCard
                        destination={destination}
                        note={coverageNote(coverageHits)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : (
          <p className="rounded-card bg-surface-soft px-6 py-12 text-center text-lg text-muted">
            Nothing matches &ldquo;{query.trim()}&rdquo; yet. Try a country,
            region, or global plan.
          </p>
        )}
      </div>
    </>
  );
}
