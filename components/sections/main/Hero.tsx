import { DestinationSearch } from "@/components/sections/main/DestinationSearch";
import { TrustBar } from "@/components/common/TrustBar";
import type { DestinationSummary } from "@/lib/types";
import { cn } from "@/lib/cn";

export function Hero({ destinations }: { destinations: DestinationSummary[] }) {
  return (
    <section
      className={cn(
        "relative",
        "mt-[calc(var(--header-height)+env(safe-area-inset-top))]",
        // A viewport-height box, but only as a floor: on a short screen (a
        // phone in landscape, or a small handset) the copy, search field and
        // trust bar are taller than the viewport, and a fixed `h-` clipped
        // them against the `overflow-hidden` below. `min-h` lets the section
        // grow and the page scroll instead.
        "min-h-[calc(100dvh-var(--header-height)-env(safe-area-inset-top))]",
        "px-3 pb-3 md:px-4 md:pb-4",
      )}
    >
      <div
        className={cn(
          "relative flex w-full flex-1 overflow-hidden rounded-screen bg-ink md:rounded-screen-lg",
          "min-h-[calc(100dvh-var(--header-height)-env(safe-area-inset-top)-0.75rem)]",
          "md:min-h-[calc(100dvh-var(--header-height)-env(safe-area-inset-top)-1rem)]",
        )}
      >
        <video
          aria-hidden
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/videos/hero-poster.webp"
          className="absolute inset-0 h-full w-full rounded-screen object-cover md:rounded-screen-lg"
          src="/videos/hero.webm"
        />

        <div aria-hidden className="absolute inset-0 bg-ink/70" />

        {/*
          In normal flow rather than absolutely positioned, so the panel above
          grows to fit the content on short screens instead of clipping it.
          Vertical padding gives the copy room to breathe once it does.
        */}
        <div
          className={cn(
            "relative flex w-full flex-col items-center justify-center",
            "px-6 py-16 text-center md:py-20",
          )}
        >
          <h1 className="max-w-4xl font-display text-display font-black tracking-[-0.01em] text-balance break-words text-white">
            STAY <span className="text-signal">CONNECTED</span>{" "}
            {"WHENEVER’S NEXT"}
          </h1>

          <p className="mt-5 max-w-xl text-lg text-muted-invert md:text-2xl">
            One connection. Every destination.
          </p>

          <DestinationSearch destinations={destinations} className="mt-8" />

          <TrustBar className="mt-14" />
        </div>
      </div>
    </section>
  );
}
