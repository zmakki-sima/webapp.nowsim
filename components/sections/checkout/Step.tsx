import type { ReactNode } from "react";
import { MdCheck } from "react-icons/md";

import { cn } from "@/lib/cn";

export function Step({
  index,
  title,
  done = false,
  children,
}: {
  index: number;
  title: string;
  done?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="rounded-sheet border border-hairline bg-surface p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            "text-sm font-bold",
            "transition-colors duration-300 ease-hover motion-reduce:transition-none",
            done ? "bg-volt text-ink" : "bg-brand text-white",
          )}
        >
          {done ? <MdCheck className="h-3.5 w-3.5" /> : index}
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
