"use client";

import type { ReactNode } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { SearchField } from "@/components/ui/SearchField";
import { cn } from "@/lib/cn";

/**
 * The shell the coverage, network and device dialogs all wear: a title, one
 * line of context under it, a panel-tone search field, and a scroll container
 * for whatever the search turned up. Only the list inside differs, so only the
 * list is passed in.
 */
export function SearchDialog({
  open,
  onClose,
  title,
  intro,
  query,
  onQueryChange,
  searchLabel,
  placeholder,
  status,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** One line under the title saying what the list covers. */
  intro: ReactNode;
  query: string;
  onQueryChange: (value: string) => void;
  /** Names the search field for screen readers. */
  searchLabel: string;
  placeholder: string;
  /** Announced result count. Omitted where the list announces itself. */
  status?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      className="max-w-[29rem]"
    >
      <p className="mt-2 pr-12 text-sm font-medium text-muted">{intro}</p>

      <SearchField
        value={query}
        onChange={onQueryChange}
        label={searchLabel}
        placeholder={placeholder}
        tone="panel"
        className="mt-6"
      />

      <div
        className={cn(
          "-mx-2 mt-4 min-h-0 flex-1 px-2",
          "scroll-slim overflow-y-auto overscroll-contain",
        )}
      >
        {status === undefined ? null : (
          <p aria-live="polite" className="sr-only">
            {status}
          </p>
        )}

        {children}
      </div>
    </Dialog>
  );
}
