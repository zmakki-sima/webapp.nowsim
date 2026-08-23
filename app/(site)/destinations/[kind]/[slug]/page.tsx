import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { CoverageBlurb } from "@/components/sections/destinations/CoverageBlurb";
import { NetworkFacts } from "@/components/sections/destinations/NetworkFacts";
import { PlanPicker } from "@/components/sections/destinations/PlanPicker";
import { Faq } from "@/components/common/Faq";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { TrustBar } from "@/components/common/TrustBar";
import { blurbText } from "@/lib/copy";
import { getDestination, getDestinationParams } from "@/lib/data/catalog";
import { getDeviceGroups } from "@/lib/data/devices";
import { isDestinationKind, kindLabels } from "@/lib/types";
import { cn } from "@/lib/cn";

type PageProps = {
  params: Promise<{ kind: string; slug: string }>;
};

export async function generateStaticParams() {
  return getDestinationParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { kind, slug } = await params;

  if (!isDestinationKind(kind)) return {};

  const destination = await getDestination(kind, slug);

  if (!destination) return {};

  return {
    title: `${destination.name} eSIM | nowsim`,
    description: blurbText(destination.blurb),
  };
}

export default async function DestinationPage({ params }: PageProps) {
  const { kind: kindParam, slug } = await params;

  if (!isDestinationKind(kindParam)) notFound();

  const destination = await getDestination(kindParam, slug);

  if (!destination) notFound();

  const deviceGroups = await getDeviceGroups();

  const { name, art, hero, blurb, kind, coversList, plans, operators } =
    destination;

  return (
    <>
      <section className="px-3 pt-28 md:px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-16">
            <div className="lg:sticky lg:top-28">
              <Breadcrumb
                className="mb-10"
                items={[
                  { label: "Home", href: "/" },
                  {
                    label: kindLabels[kind],
                    href: `/destinations/${kind}`,
                  },
                  { label: name },
                ]}
              />

              <div className="relative aspect-[4/3] overflow-hidden rounded-sheet bg-surface-soft">
                <Image
                  src={hero}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  quality={90}
                  preload
                  className="object-cover"
                />
              </div>

              <NetworkFacts operators={operators} className="mt-8" />
            </div>

            <div className="lg:pt-[4.5rem]">
              <h1
                className={cn(
                  "flex items-center gap-5 font-extrabold tracking-[-0.045em]",
                  "text-[clamp(2rem,1.4rem+2.6vw,3rem)] leading-[1.03]",
                )}
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-brand/12">
                  <Image
                    src={art}
                    alt=""
                    fill
                    quality={90}
                    sizes="48px"
                    unoptimized={art.endsWith(".svg")}
                    className="object-cover"
                  />
                </span>
                {name} eSIM
              </h1>

              <CoverageBlurb
                blurb={blurb}
                destinationName={name}
                countries={coversList}
                className="mt-5 max-w-[52ch] text-base font-medium text-muted md:text-lg"
              />

              <PlanPicker
                plans={plans}
                heading={`Get an eSIM data plan for ${name}`}
                destinationName={name}
                destinationKind={kind}
                destinationSlug={destination.slug}
                deviceGroups={deviceGroups}
              />
            </div>
          </div>

          <TrustBar
            tone="light"
            className="mt-28 border-y border-hairline py-10 lg:mt-36"
          />
        </div>
      </section>

      <Faq />
    </>
  );
}
