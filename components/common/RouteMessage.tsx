import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function RouteMessage({
  title,
  body,
  className,
  children,
}: {
  title: string;
  body: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section
      className={cn(
        // Every caller renders this as the only child of a `flex flex-1
        // flex-col` <main>, so `flex-1` takes the space left under the header
        // (and above the footer) and centres a short message in it instead of
        // parking it at the top of an otherwise empty page. A percentage
        // height cannot do this: <body> is only `min-h-full`, so its height is
        // auto and `min-h-full` here would resolve to nothing.
        "flex flex-1 flex-col justify-center px-3 py-24 md:px-4 md:py-32",
        className,
      )}
    >
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <h1 className="font-display text-h2 font-extrabold tracking-[-0.03em]">
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

/**
 * Cancels the header padding a layout put on its `<main>`, so the message
 * centres on the viewport rather than on the strip below the fixed bar — which
 * reads as half a header too low on a page with nothing else in it. The `py`
 * above still keeps the text clear of the bar when it needs the room.
 *
 * Only for layouts whose `<main>` carries that padding and has no footer under
 * it — checkout. Under the site layout the footer already ends the column
 * above the fold, so there is nothing to cancel.
 */
export const routeMessageBleedHeader = cn(
  "-mt-[calc(var(--header-height)+env(safe-area-inset-top))]",
);

export const routeMessageAction = cn(
  "rounded-full bg-brand px-6 py-3.5 text-base font-medium text-white",
  "hover:bg-brand-soft active:bg-brand-soft",
);

export const routeMessageActionQuiet = cn(
  "rounded-full border border-hairline bg-surface px-6 py-3.5",
  "text-base font-medium text-ink",
  "hover:border-ink/25 hover:bg-surface-soft active:bg-surface-soft",
);
