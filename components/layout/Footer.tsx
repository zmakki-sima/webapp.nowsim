import Image from "next/image";
import { cacheLife } from "next/cache";
import { FaCcStripe } from "react-icons/fa6";

import { NowsimLogo } from "@/components/ui/NowsimLogo";
import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";
import { destinationHref } from "@/lib/types";

type LinkGroup = {
  title: string;
  links: { label: string; href: string }[];
};

const groups: LinkGroup[] = [
  {
    title: "Popular",
    links: [
      { label: "Thailand eSIM", href: destinationHref("country", "thailand") },
      {
        label: "UAE eSIM",
        href: destinationHref("country", "united-arab-emirates"),
      },
      { label: "China eSIM", href: destinationHref("country", "china") },
      {
        label: "USA eSIM",
        href: destinationHref("country", "united-states"),
      },
      { label: "Japan eSIM", href: destinationHref("country", "japan") },
    ],
  },
  {
    title: "Plans",
    links: [
      { label: "Countries", href: "/destinations?kind=country" },
      { label: "Regions", href: "/destinations?kind=region" },
      { label: "Global", href: "/destinations?kind=global" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help", href: "/help" },
      { label: "eSIM compatible devices", href: "/esim-compatible-devices" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
    ],
  },
];

const badgeSize = { width: 120, height: 40 };

/** Shown as artwork only — the apps are not published yet. */
const storeBadges = [
  { label: "Download on the App Store", src: "/buttons/app-store.svg" },
  { label: "Get it on Google Play", src: "/buttons/google-play.svg" },
];

const bottomPadding =
  "pb-[max(3.5rem,calc(env(safe-area-inset-bottom)+2.5rem))]";

async function currentYear(): Promise<number> {
  "use cache";

  cacheLife("days");

  return new Date().getFullYear();
}

export async function Footer() {
  const year = await currentYear();

  return (
    <footer>
      <div
        className={cn(
          "overflow-hidden rounded-t-screen bg-ink text-white md:rounded-t-screen-lg",
          "px-6 pt-14 md:px-12 md:pt-20",
          bottomPadding,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div
            className={cn(
              "flex flex-col gap-8 border-b border-white/10 pb-12",
              "md:flex-row md:items-center md:justify-between md:gap-12 md:pb-14",
            )}
          >
            <div>
              <h2 className="text-h3">
                Download nowsim for your{" "}
                <span className="text-volt">next journey</span>
              </h2>

              <p className="mt-3 max-w-[52ch] text-base text-muted-invert">
                Buy a plan, install the eSIM, and land connected. Free on iOS
                and Android.
              </p>
            </div>

            <ul
              aria-hidden
              className="flex flex-wrap items-center gap-3 opacity-45 md:shrink-0"
            >
              {storeBadges.map((badge) => (
                <li key={badge.label}>
                  <Image
                    src={badge.src}
                    alt=""
                    width={badgeSize.width}
                    height={badgeSize.height}
                    unoptimized
                    className="h-[3.25rem] w-auto select-none"
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-12 pt-14 pb-14 md:flex-row md:items-start md:justify-between md:gap-16 md:pt-16 md:pb-16">
            <div>
              <NowsimLogo
                id="nowsim-logo-footer"
                className="h-7 w-auto text-white"
              />

              <p className="mt-5 max-w-[34ch] text-base text-muted-invert">
                One eSIM, one account, 200+ destinations. Stay connected
                wherever&rsquo;s next.
              </p>

            </div>

            <div className="flex flex-wrap gap-x-12 gap-y-8 md:shrink-0">
              {groups.map((group) => (
                <div key={group.title} className="min-w-36">
                  <h3 className="text-eyebrow uppercase text-volt">
                    {group.title}
                  </h3>

                  <ul className="mt-3 flex flex-col">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Pressable
                          href={link.href}
                          className={cn(
                            "-mx-1 px-1 py-1.5",
                            "text-base font-medium text-muted-invert hover:text-white",
                          )}
                        >
                          {link.label}
                        </Pressable>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
            <p>&copy; {year} nowsim. All rights reserved.</p>

            <div className="flex items-center text-white/70">
              <FaCcStripe aria-hidden className="h-7 w-auto" />
              <span className="sr-only">Payments powered by Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
