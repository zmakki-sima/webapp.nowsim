import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Step({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-sheet bg-surface p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            "bg-ink text-sm font-bold text-white",
          )}
        >
          {index}
        </span>

        <h2 className="text-h3 font-bold">
          <span className="sr-only">Step {index}: </span>
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}
