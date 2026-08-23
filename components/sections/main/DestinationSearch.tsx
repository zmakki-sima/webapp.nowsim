"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import { MdSearch } from "react-icons/md";

import { Pressable } from "@/components/ui/Pressable";
import { formatMoney } from "@/lib/money";
import { createSearchIndex, search } from "@/lib/search/match";
import { destinationHref, type DestinationSummary } from "@/lib/types";
import { cn } from "@/lib/cn";

const SUGGESTIONS = 3;

const kindNames = { country: "Country", region: "Region", global: "Global" };

export function DestinationSearch({
  destinations,
  className,
}: {
  destinations: DestinationSummary[];
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const inputId = useId();
  const listId = useId();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const index = useMemo(() => createSearchIndex(destinations), [destinations]);

  const hits = useMemo(
    () => (query.trim() ? search(index, query).slice(0, SUGGESTIONS) : []),
    [index, query],
  );

  const expanded = open && hits.length > 0;

  function go(target: string) {
    setOpen(false);
    setHighlight(-1);
    router.push(target);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const chosen = hits[highlight];

    if (chosen) {
      go(destinationHref(chosen.destination.kind, chosen.destination.slug));

      return;
    }

    const trimmed = query.trim();

    go(
      trimmed ? `/destinations?q=${encodeURIComponent(trimmed)}` : "/destinations",
    );
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setHighlight(-1);

      return;
    }

    if (!expanded) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      const step = event.key === "ArrowDown" ? 1 : -1;
      const wrapped = (highlight + step + hits.length) % hits.length;
      const next = highlight < 0 && step < 0 ? hits.length - 1 : wrapped;

      setHighlight(next);

      document
        .getElementById(`${listId}-option-${next}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={cn("group relative w-full max-w-xl", className)}
    >
      <label htmlFor={inputId} className="sr-only">
        Search destinations
      </label>

      <div
        className={cn(
          "relative flex items-center gap-2 rounded-full bg-white p-1.5 pl-6",
          "shadow-xl shadow-ink/20",
          "ring-0 ring-white/40 group-focus-within:ring-4",
          "transition-[box-shadow] duration-[120ms] ease-ios motion-reduce:transition-none",
        )}
      >
        <input
          id={inputId}
          name="q"
          type="search"
          autoComplete="off"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            highlight >= 0 ? `${listId}-option-${highlight}` : undefined
          }
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search a country or region"
          className={cn(
            "min-w-0 flex-1 bg-transparent py-3 text-base text-ink",
            "placeholder:text-muted focus-visible:outline-none",
            "[&::-webkit-search-cancel-button]:appearance-none",
          )}
        />

        <Pressable
          type="submit"
          press={false}
          className={cn(
            "h-12 w-12 shrink-0 rounded-full bg-brand text-volt",
            "transition-colors duration-300 ease-hover motion-reduce:transition-none",
            "hover:bg-brand-soft active:bg-brand-soft",
          )}
        >
          <MdSearch aria-hidden className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Pressable>
      </div>

      <ul
        id={listId}
        role="listbox"
        aria-label="Destination suggestions"
        hidden={!expanded}
        className={cn(
          "absolute inset-x-0 top-[calc(100%+0.5rem)] z-20",
          "scroll-none max-h-[min(15rem,45vh)] overflow-y-auto overscroll-contain",
          "rounded-card bg-white p-1.5 text-left shadow-xl shadow-ink/20",
        )}
      >
        {hits.map(({ destination, coverageHits }, position) => (
          <li key={`${destination.kind}/${destination.slug}`}>
            <Pressable
              id={`${listId}-option-${position}`}
              role="option"
              aria-selected={position === highlight}
              tabIndex={-1}
              press={false}
              onMouseEnter={() => setHighlight(position)}
              onMouseDown={() => clearTimeout(blurTimer.current)}
              onClick={() =>
                go(destinationHref(destination.kind, destination.slug))
              }
              className={cn(
                "w-full justify-start gap-3 rounded-control px-3 py-2.5 text-left",
                position === highlight ? "bg-brand/8" : "bg-transparent",
              )}
            >
              <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-brand/12">
                {destination.art ? (
                  <Image
                    src={destination.art}
                    alt=""
                    fill
                    quality={90}
                    sizes="32px"
                    unoptimized={destination.art.endsWith(".svg")}
                    className="object-cover"
                  />
                ) : null}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-bold text-ink">
                  {destination.name}
                </span>
                <span className="block truncate text-sm font-medium text-muted">
                  {coverageHits.length
                    ? `Includes ${coverageHits.slice(0, 2).join(", ")}`
                    : kindNames[destination.kind]}
                </span>
              </span>

              <span className="shrink-0 text-sm font-bold text-ink">
                {formatMoney(destination.from)}
              </span>
            </Pressable>
          </li>
        ))}
      </ul>
    </form>
  );
}
