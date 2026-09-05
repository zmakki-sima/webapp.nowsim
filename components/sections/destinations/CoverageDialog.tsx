"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { SearchDialog } from "@/components/ui/SearchDialog";
import { filterCountries } from "@/lib/search/match";
import type { CoveredCountry } from "@/lib/types";
import { cn } from "@/lib/cn";

export function CoverageDialog({
  open,
  onClose,
  destinationName,
  countries,
}: {
  open: boolean;
  onClose: () => void;
  destinationName: string;
  countries: CoveredCountry[];
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => filterCountries(countries, query),
    [countries, query],
  );

  return (
    <SearchDialog
      open={open}
      onClose={onClose}
      title="Coverage"
      intro={
        <>
          {destinationName} connects in{" "}
          <span className="text-brand">{countries.length} countries</span> on
          one plan
        </>
      }
      query={query}
      onQueryChange={setQuery}
      searchLabel="Search covered countries"
      placeholder="Where do you need internet?"
      status={`${results.length} countries`}
    >
      {results.length === 0 ? (
        <p className="py-6 text-sm text-muted">
          {`${query.trim()} isn’t on this plan. Try another spelling, or look for a country plan instead.`}
        </p>
      ) : (
        <ul className="flex flex-col">
          {results.map((country) => {
            const flag = country.art;

            return (
              <li
                key={country.name}
                className="flex items-center gap-3 py-2.5 text-base font-bold"
              >
                <span
                  aria-hidden
                  className={cn(
                    "relative h-8 w-8 shrink-0 overflow-hidden rounded-full",
                    "flex items-center justify-center",
                    "bg-brand/10 text-xs font-bold text-muted",
                  )}
                >
                  {flag ? (
                    <Image
                      src={flag}
                      alt=""
                      fill
                      quality={90}
                      sizes="32px"
                      unoptimized={flag.endsWith(".svg")}
                      className="object-cover"
                    />
                  ) : (
                    country.name.slice(0, 1)
                  )}
                </span>

                {country.name}
              </li>
            );
          })}
        </ul>
      )}
    </SearchDialog>
  );
}
