"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { SearchField } from "@/components/ui/SearchField";
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
    <Dialog
      open={open}
      onClose={onClose}
      title="Coverage"
      className="max-w-[29rem]"
    >
      <p className="mt-2 pr-12 text-sm font-medium text-muted">
        {destinationName} connects in{" "}
        <span className="text-brand">{countries.length} countries</span> on one
        plan
      </p>

      <SearchField
        value={query}
        onChange={setQuery}
        label="Search covered countries"
        placeholder="Where do you need internet?"
        tone="panel"
        className="mt-6"
      />

      <div
        className={cn(
          "-mx-2 mt-4 min-h-0 flex-1 px-2",
          "scroll-slim overflow-y-auto overscroll-contain",
        )}
      >
        <p aria-live="polite" className="sr-only">
          {results.length} countries
        </p>

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
      </div>
    </Dialog>
  );
}
