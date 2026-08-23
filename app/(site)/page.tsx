import { Hero } from "@/components/sections/main/Hero";
import { Destinations } from "@/components/sections/main/Destinations";
import { About } from "@/components/sections/main/About";
import { HowItWorks } from "@/components/sections/main/HowItWorks";
import { NextTrip } from "@/components/sections/main/NextTrip";
import { Faq } from "@/components/common/Faq";
import {
  getDestinationSummaries,
  getFeaturedSummaries,
  getSpotlightSummaries,
} from "@/lib/data/catalog";
import type { DestinationKind, DestinationSummary } from "@/lib/types";

export default async function HomePage() {
  const [[country, region, global], destinations, spotlight] =
    await Promise.all([
      Promise.all(
        (["country", "region", "global"] as const).map(getFeaturedSummaries),
      ),
      getDestinationSummaries(),
      getSpotlightSummaries(),
    ]);

  const previews: Record<DestinationKind, DestinationSummary[]> = {
    country,
    region,
    global,
  };

  return (
    <>
      <Hero destinations={destinations} />
      <Destinations previews={previews} />
      <About />
      <HowItWorks />
      <Faq />
      <NextTrip destinations={destinations} spotlight={spotlight} />
    </>
  );
}
