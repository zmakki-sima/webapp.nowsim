import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InstallSteps } from "@/components/sections/install/InstallSteps";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { readInstallShots } from "@/lib/install-shots";
import {
  getInstallGuide,
  installPlatformFromSlug,
  installPlatforms,
  installSlugs,
} from "@/lib/install";

type PageProps = {
  params: Promise<{ guide: string }>;
};

export function generateStaticParams() {
  return installPlatforms.map((platform) => ({
    guide: installSlugs[platform],
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { guide: slug } = await params;
  const platform = installPlatformFromSlug(slug);

  if (!platform) return {};

  const guide = getInstallGuide(platform);

  return {
    title: `Installation for ${guide.label} - nowsim`,
    description: `Install your nowsim eSIM on ${guide.devices}, step by step.`,
  };
}

export default async function InstallGuidePage({ params }: PageProps) {
  const { guide: slug } = await params;
  const platform = installPlatformFromSlug(slug);

  if (!platform) notFound();

  const guide = getInstallGuide(platform);

  return (
    <section className="px-3 pb-20 pt-28 md:px-4 md:py-28">
      <div className="mx-auto max-w-3xl">
        <Breadcrumb
          className="mb-8"
          items={[
            { label: "Home", href: "/" },
            { label: "Help", href: "/help" },
            { label: `Installation for ${guide.label}` },
          ]}
        />

        <h1 className="font-display text-h2 font-extrabold tracking-[-0.045em]">
          Installation for {guide.label}
        </h1>

        <p className="mt-2 text-base text-muted">{guide.blurb}</p>

        <InstallSteps
          methods={guide.methods}
          shots={readInstallShots(platform)}
        />
      </div>
    </section>
  );
}
