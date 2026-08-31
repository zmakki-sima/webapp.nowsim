import type { MetadataRoute } from "next";

import { env } from "@/lib/env";
import { isLive } from "@/lib/stage";

/**
 * Crawling rules.
 *
 * The important line is the staging one. `nowsim.vercel.app` serves the same
 * pages as the real site, so if it were indexed it would compete with
 * nowsim.com for the same terms — and a customer could land on the test deploy
 * and pay with a card that never charges. Only `live` invites crawlers; every
 * other stage refuses everything.
 *
 * `isLive`, not `isDeployed`, is the right test: staging is a real deployment
 * and must still be excluded.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isLive) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /**
       * Nothing here is secret — it is all sign-in gated or useless to a
       * crawler. Keeping it out of the index avoids spending crawl budget on
       * pages that render empty to a signed-out visitor, and stops a stale
       * "Checkout" or "My eSIMs" ever surfacing as a search result.
       */
      disallow: ["/api/", "/checkout", "/esims", "/purchases"],
    },
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
    host: env.NEXT_PUBLIC_SITE_URL,
  };
}
