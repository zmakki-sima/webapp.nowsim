import type { IconType } from "react-icons";

import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

/**
 * The end of a checkout, whichever way it went. Both outcomes read the same:
 * one mark, one sentence, one thing to do next, centred in what is left of the
 * viewport under the header.
 */
const fillsViewport =
  "min-h-[calc(100svh-var(--header-height)-env(safe-area-inset-top))]";

export function Outcome({
  Icon,
  tone,
  title,
  body,
  action,
  children,
}: {
  Icon: IconType;
  tone: string;
  title: string;
  body: string;
  action: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <section
      className={cn("flex items-center px-3 py-12 md:px-4 md:py-16", fillsViewport)}
    >
      <div className="mx-auto w-full max-w-3xl text-center">
        <Icon aria-hidden className={cn("mx-auto h-16 w-16", tone)} />

        <h1 className="mt-6 font-display text-h2 font-extrabold tracking-[-0.045em]">
          {title}
        </h1>

        <p className="mx-auto mt-4 max-w-[46ch] text-base leading-relaxed text-muted">
          {body}
        </p>

        {children}

        <div className="mt-10 flex justify-center">
          <Pressable
            href={action.href}
            className={cn(
              "w-full max-w-sm rounded-full bg-brand px-8 py-4",
              "text-base font-bold text-white",
              "hover:bg-brand-soft active:bg-brand-soft",
            )}
          >
            {action.label}
          </Pressable>
        </div>
      </div>
    </section>
  );
}
