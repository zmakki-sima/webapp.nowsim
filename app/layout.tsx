import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import localFont from "next/font/local";

import { SessionProvider } from "@/components/layout/SessionProvider";
import { getAccount } from "@/lib/auth/dal";
import { env } from "@/lib/env";

import "./globals.css";

const satoshi = localFont({
  src: [
    {
      path: "../fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "../fonts/Satoshi-VariableItalic.woff2",
      weight: "300 900",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const figtree = localFont({
  src: [
    {
      path: "../fonts/Figtree-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  variable: "--font-figtree",
  display: "swap",
});

const TITLE = "nowsim: Stay connected, wherever's next";
const DESCRIPTION =
  "Travel eSIMs for every destination. Pick a country, buy a data plan, and connect the moment you land.";

export const metadata: Metadata = {
  /**
   * Every relative URL in metadata — the share image included — is resolved
   * against this. Without it Next falls back to localhost, so a link shared
   * from production would point a crawler at a machine that isn't there.
   * `env` already refuses a localhost value once deployed.
   */
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  /**
   * No `template` here on purpose: every page already spells out its own
   * "… - nowsim" title, so a template would suffix them twice.
   */
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "nowsim",
  openGraph: {
    type: "website",
    siteName: "nowsim",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    locale: "en",
    // The image itself comes from `opengraph-image.tsx` next to this file —
    // Next appends it, along with its dimensions and type.
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider account={getAccount()}>{children}</SessionProvider>
        {/*
         * Injects the Web Analytics and Speed Insights scripts. Both only
         * report from Vercel deployments — locally they no-op rather than
         * sending fake page views or Core Web Vitals samples.
         */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
