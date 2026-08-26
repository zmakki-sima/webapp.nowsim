import "server-only";

import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Absolute origin, used where no request is in scope: links inside emails and
 * the URLs Stripe returns a customer to. A wrong value is invisible — the mail
 * still sends, the redirect still happens, both just point at the wrong host —
 * so production has to state it rather than inherit a guess.
 */
const siteUrl = z
  .url("NEXT_PUBLIC_SITE_URL must be an absolute origin, e.g. https://nowsim.com")
  .refine(
    (value) => !isProduction || !value.includes("localhost"),
    "NEXT_PUBLIC_SITE_URL must not point at localhost in production",
  )
  .transform((value) => value.replace(/\/+$/, ""));

const schema = z.object({
  YESIM_API_TOKEN: z
    .string()
    .min(1, "YESIM_API_TOKEN is required. The catalog cannot load without it"),
  YESIM_API_BASE: z.url().default("https://partners-api.yesim.biz"),
  REVALIDATE_SECRET: z.string().min(16).optional(),
  NEXT_PUBLIC_SITE_URL: isProduction
    ? siteUrl
    : siteUrl.or(z.undefined().transform(() => "http://localhost:3000")),
});

const parsed = schema.safeParse({
  YESIM_API_TOKEN: process.env.YESIM_API_TOKEN,
  YESIM_API_BASE: process.env.YESIM_API_BASE,
  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
});

if (!parsed.success) {
  throw new Error(
    [
      "Invalid environment.",
      z.prettifyError(parsed.error),
      "Copy .env.example to .env.local and fill it in.",
    ].join("\n"),
  );
}

export const env = parsed.data;
