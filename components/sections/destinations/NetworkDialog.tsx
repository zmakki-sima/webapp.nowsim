"use client";

import { useMemo, useState } from "react";
import { SearchDialog } from "@/components/ui/SearchDialog";
import { filterCountries } from "@/lib/search/match";

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
    <SearchDialog
      open={open}
      onClose={onClose}
      title="Available networks"
      intro={
        <>
          This plan roams on{" "}
          <span className="text-brand">{operators.length} networks</span>
        </>
      }
      query={query}
      onQueryChange={setQuery}
      searchLabel="Search available networks"
      placeholder="Search for a network or country"
      status={`${results.length} networks`}
    >
      {results.length === 0 ? (
        <p className="py-6 text-sm text-muted">
          {`No network matches “${query.trim()}”. Try the carrier name, or the country it serves.`}
        </p>
      ) : (
        <ul className="flex flex-col">
          {results.map((operator) => (
            <li
              key={operator.name}
              className="py-2.5 text-base font-medium text-ink"
            >
              {operator.name}
            </li>
          ))}
        </ul>
      )}
    </SearchDialog>
  );
}
