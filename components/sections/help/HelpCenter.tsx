"use client";

import { useMemo, useState } from "react";

import { HelpCard } from "@/components/sections/help/HelpCard";
import { SearchField } from "@/components/ui/SearchField";
import { helpArticles } from "@/lib/help";
import { normalize } from "@/lib/search/match";

const haystacks = new Map(
  helpArticles.map((article) => [
    article.id,
    normalize([article.title, article.blurb, ...article.keywords].join(" ")),
  ]),
);

export function HelpCenter({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const terms = normalize(query).split(" ").filter(Boolean);

    if (!terms.length) return helpArticles;

    return helpArticles.filter((article) => {
      const haystack = haystacks.get(article.id) ?? "";

      return terms.every((term) => haystack.includes(term));
    });
  }, [query]);

  return (
    <div className={className}>
      <h1 className="font-display text-h1 font-extrabold uppercase tracking-[-0.045em]">
        {title}
      </h1>

      <div className="mt-6 grid gap-6">
        <SearchField
          value={query}
          onChange={setQuery}
          label="Search help articles"
          placeholder="Search"
          iconSide="right"
        />

        <div>
          <p aria-live="polite" className="sr-only">
            {results.length} help articles
          </p>

          {results.length ? (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6">
              {results.map((article) => (
                <li key={article.id}>
                  <HelpCard article={article} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-card bg-surface-soft px-6 py-12 text-center text-lg text-muted">
              Nothing here matches &ldquo;{query.trim()}&rdquo;. Try
              &ldquo;install&rdquo;, &ldquo;refund&rdquo;, or
              &ldquo;device&rdquo;.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}