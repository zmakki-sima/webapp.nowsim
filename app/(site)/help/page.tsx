import type { Metadata } from "next";

import { Faq } from "@/components/common/Faq";
import { HelpCenter } from "@/components/sections/help/HelpCenter";
import { NextTrip } from "@/components/sections/main/NextTrip";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  getDestinationSummaries,
  getSpotlightSummaries,
} from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Help - nowsim",
  description:
    "Install your eSIM on iOS or Android, check device compatibility, find your activation details, and read our refund policy",
};

export default async function HelpPage() {
  const [destinations, spotlight] = await Promise.all([
    getDestinationSummaries(),
    getSpotlightSummaries(),
  ]);

  return (
    <>
      <section className="px-6 pb-16 pt-header md:px-12 md:pb-24">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            className="mb-10"
            items={[{ label: "Home", href: "/" }, { label: "Help" }]}
          />

          <HelpCenter title="How can we help?" />
        </div>
      </section>

      <Faq />

      <NextTrip destinations={destinations} spotlight={spotlight} />
    </>
  );
}
