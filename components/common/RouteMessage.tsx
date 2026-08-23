import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function RouteMessage({
  eyebrow,
  title,
  body,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section className={cn("px-3 py-24 md:px-4 md:py-32", className)}>
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <p className="text-eyebrow uppercase text-muted">{eyebrow}</p>

        <h1 className="mt-4 font-display text-h2 font-extrabold tracking-[-0.03em]">
          {title}
        </h1>

        <p className="mt-4 text-base text-muted md:text-lg">{body}</p>

        {children ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export const routeMessageAction = cn(
  "rounded-full bg-brand px-6 py-3.5 text-base font-medium text-white",
  "hover:bg-brand-soft active:bg-brand-soft",
);

export const routeMessageActionQuiet = cn(
  "rounded-full border border-hairline bg-surface px-6 py-3.5",
  "text-base font-medium text-ink",
  "hover:border-ink/25 hover:bg-surface-soft active:bg-surface-soft",
);
