import type { MetadataRoute } from "next";

import { getDestinationParams } from "@/lib/data/catalog";
import { env } from "@/lib/env";
import { installPlatforms, installSlugs } from "@/lib/install";

const SITE = env.NEXT_PUBLIC_SITE_URL;

type Frequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

/**
 * Pages worth indexing, and nothing else.
 *
 * Left out on purpose: `/checkout` and its `success`/`failed` children (a URL
 * that means nothing without an order), `/esims` and `/purchases` (sign-in
 * gated, empty to a crawler), and `/destinations/[kind]` (a redirect into
 * `/destinations?kind=…`, so listing it would point crawlers at a 307).
 * `robots.ts` disallows the same set.
 */
const STATIC: [path: string, priority: number, freq: Frequency][] = [
  ["/", 1, "weekly"],
  ["/destinations", 0.9, "daily"],
  ["/help", 0.6, "monthly"],
  ["/help/esim-compatible-devices", 0.6, "monthly"],
  ["/terms-of-service", 0.3, "yearly"],
  ["/privacy-policy", 0.3, "yearly"],
  ["/refund-policy", 0.3, "yearly"],
];

/**
 * One `lastModified` for the whole build. Per-page dates would be a guess —
 * nothing in the catalog carries a modified timestamp — and a guessed date is
 * worse than an honest build date, which is at least true of the deployment.
 */
const built = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const destinations = await getDestinationParams();

  return [
    ...STATIC.map(([path, priority, changeFrequency]) => ({
      url: `${SITE}${path}`,
      lastModified: built,
      changeFrequency,
      priority,
    })),

    // The install guides — two today, but read from the same list the routes
    // are generated from so a third would appear here without an edit.
    ...installPlatforms.map((platform) => ({
      url: `${SITE}/help/${installSlugs[platform]}`,
      lastModified: built,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

    // The long tail, and the reason this file is generated rather than static:
    // roughly 150 destination pages, straight from the catalog that builds
    // their routes. They cannot drift apart.
    ...destinations.map(({ kind, slug }) => ({
      url: `${SITE}/destinations/${kind}/${slug}`,
      lastModified: built,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
