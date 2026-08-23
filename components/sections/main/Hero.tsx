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
        "h-[calc(100dvh-var(--header-height)-env(safe-area-inset-top))]",
        "px-3 pb-3 md:px-4 md:pb-4",
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-screen bg-ink md:rounded-screen-lg">
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

        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center px-6 text-center",
          )}
        >
          <h1 className="max-w-4xl font-display text-display font-black tracking-[-0.01em] text-white">
            STAY <span className="text-volt">CONNECTED</span>{" "}
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
