import { NextTripFinder } from "@/components/sections/main/NextTripFinder";
import type { DestinationSummary } from "@/lib/types";
import { cn } from "@/lib/cn";

export function NextTrip({
  destinations,
  spotlight,
}: {
  destinations: DestinationSummary[];
  spotlight: DestinationSummary[];
}) {
  return (
    <section
      aria-labelledby="next-trip-heading"
      className="px-3 py-16 md:px-4 md:py-24"
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl flex-col items-center rounded-sheet bg-brand/6 text-center",
          "px-6 pt-14 pb-9 md:px-10 md:pt-20 md:pb-14",
        )}
      >
        <h2
          id="next-trip-heading"
          className={cn(
            "font-display font-extrabold uppercase tracking-[-0.03em]",
            "whitespace-nowrap text-[clamp(1.125rem,5.2vw,3.5rem)] leading-[1.03]",
          )}
        >
          Where&rsquo;s life taking you{" "}
          <span className="text-brand">next?</span>
        </h2>

        <p className="mt-4 max-w-[42ch] text-lg text-muted md:text-xl">
          Get connected on the nowsim network.
        </p>

        <NextTripFinder destinations={destinations} spotlight={spotlight} />
      </div>
    </section>
  );
}
