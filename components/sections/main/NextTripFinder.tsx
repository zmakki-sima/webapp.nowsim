"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { Pressable } from "@/components/ui/Pressable";
import { SearchField } from "@/components/ui/SearchField";
import { createSearchIndex, search } from "@/lib/search/match";
import { destinationHref, type DestinationSummary } from "@/lib/types";
import { cn } from "@/lib/cn";

const RESULTS = 12;

export function NextTripFinder({
  destinations,
  spotlight,
}: {
  destinations: DestinationSummary[];
  spotlight: DestinationSummary[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const index = useMemo(() => createSearchIndex(destinations), [destinations]);

  const searching = query.trim().length > 0;

  const shown = useMemo(() => {
    if (!searching) return spotlight;

    return search(index, query)
      .slice(0, RESULTS)
      .map((hit) => hit.destination);
  }, [index, query, searching, spotlight]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const first = searching ? shown[0] : undefined;

    router.push(
      first
        ? destinationHref(first.kind, first.slug)
        : `/destinations?q=${encodeURIComponent(query.trim())}`,
    );
  }

  return (
    <>
      <form role="search" onSubmit={onSubmit} className="mt-8 w-full max-w-md">
        <SearchField
          value={query}
          onChange={setQuery}
          label="Search destinations"
          placeholder="Search a country or region"
          clearable
        />
      </form>

      <div aria-live="polite" className="w-full">
        {shown.length ? (
          <ul
            className={cn(
              "mt-12 flex flex-wrap justify-center gap-x-2 gap-y-6",
              "md:mt-16 md:gap-x-4",
            )}
          >
            {shown.map((destination) => (
              <li key={`${destination.kind}/${destination.slug}`}>
                <Pressable
                  href={destinationHref(destination.kind, destination.slug)}
                  className={cn(
                    "w-24 flex-col gap-3 rounded-control px-2 py-3 align-top md:w-28",
                    "bg-transparent hover:bg-brand/8 active:bg-brand/8",
                  )}
                >
                  <span
                    className={cn(
                      "relative h-12 w-12 overflow-hidden rounded-full bg-brand/12 md:h-14 md:w-14",
                    )}
                  >
                    <Image
                      src={destination.art}
                      alt=""
                      fill
                      quality={90}
                      sizes="56px"
                      unoptimized={destination.art.endsWith(".svg")}
                      className="object-cover"
                    />
                  </span>

                  <span className="block w-full text-center text-sm font-bold leading-tight text-ink">
                    {destination.name}
                  </span>
                </Pressable>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-12 text-center text-base text-muted md:mt-16">
            Nothing matches &ldquo;{query.trim()}&rdquo;.
          </p>
        )}
      </div>
    </>
  );
}
