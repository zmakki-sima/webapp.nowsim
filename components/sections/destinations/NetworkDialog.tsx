"use client";

import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { SearchField } from "@/components/ui/SearchField";
import { filterCountries } from "@/lib/search/match";
import { cn } from "@/lib/cn";

export function NetworkDialog({
  open,
  onClose,
  operators,
}: {
  open: boolean;
  onClose: () => void;
  operators: string[];
}) {
  const [query, setQuery] = useState("");

  const entries = useMemo(
    () => operators.map((name) => ({ name })),
    [operators],
  );

  const results = useMemo(
    () => filterCountries(entries, query),
    [entries, query],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Available networks"
      className="max-w-[29rem]"
    >
      <p className="mt-2 pr-12 text-sm font-medium text-white/70">
        This plan roams on{" "}
        <span className="text-volt">{operators.length} networks</span>
      </p>

      <SearchField
        value={query}
        onChange={setQuery}
        label="Search available networks"
        placeholder="Search for a network or country"
        tone="dark"
        className="mt-6"
      />

      <div
        className={cn(
          "-mx-2 mt-4 min-h-0 flex-1 px-2",
          "scroll-subtle overflow-y-auto overscroll-contain",
        )}
      >
        <p aria-live="polite" className="sr-only">
          {results.length} networks
        </p>

        {results.length === 0 ? (
          <p className="py-6 text-sm text-white/60">
            {`No network matches “${query.trim()}”. Try the carrier name, or the country it serves.`}
          </p>
        ) : (
          <ul className="flex flex-col">
            {results.map((operator) => (
              <li
                key={operator.name}
                className="py-2.5 text-base font-medium text-white/85"
              >
                {operator.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
