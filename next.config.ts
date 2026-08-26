import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    // Every prerender worker fills the catalog cache in its own process, so
    // splitting these pages across many workers means many concurrent copies
    // of the same slow ~750KB `plans` download, each slowing the others down
    // until they overrun the 50s `use cache` fill cap. Keep them together.
    staticGenerationMinPagesPerWorker: 1000,
  },
  redirects() {
    return Promise.resolve([
      { source: "/how-to-install", destination: "/help", permanent: true },
      {
        source: "/how-to-install/ios",
        destination: "/help/install-ios",
        permanent: true,
      },
      {
        source: "/how-to-install/android",
        destination: "/help/install-android",
        permanent: true,
      },
    ]);
  },
  outputFileTracingIncludes: {
    "/*": [
      "public/images/countries/**/*",
      "public/images/flags/**/*",
      "public/images/global/**/*",
      "public/images/regions/**/*",
    ],
  },
  images: {
    // Every `<Image>` in the app asks for 90. Allowing 75 and 100 only widens
    // the set of variants the optimizer can be made to produce.
    qualities: [90],

    // WebP only. AVIF is ~20% smaller but doubles the variants — each format is
    // cached separately — and Vercel bills per transformation. The hero photos
    // sit behind a 70% scrim, so the extra 20% buys nothing visible.
    formats: ["image/webp"],

    // The source photographs are 1440x1080, so the 2048 and 3840 defaults ask
    // the optimizer to render a country hero wider than the file it came from.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],

    // 31 days, up from the 4-hour default. Most of the 95 country pages are
    // long-tail: at 4 hours the cached variant usually expires before the next
    // visitor arrives, so nearly every visit paid for a fresh transformation of
    // a photo that never changes.
    //
    // There is no cache-invalidation mechanism. Adding a new image is safe — a
    // new path is a new cache entry — but overwriting a file while keeping its
    // name can serve the old version for up to 31 days. `united-states.jpg` is
    // still due for recompression; rename it or accept the delay.
    minimumCacheTTL: 2678400,

    remotePatterns: [{ protocol: "https", hostname: "cdn.yesim.app" }],
  },
};

export default nextConfig;
