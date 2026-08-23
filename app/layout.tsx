import type { Metadata } from "next";
import localFont from "next/font/local";

import { SessionProvider } from "@/components/layout/SessionProvider";
import { getAccount } from "@/lib/auth/dal";

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

export const metadata: Metadata = {
  title: "nowsim: Stay connected, wherever's next",
  description:
    "Travel eSIMs for every destination. Pick a country, buy a data plan, and connect the moment you land.",
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
        {}
        <SessionProvider account={getAccount()}>{children}</SessionProvider>
      </body>
    </html>
  );
}
