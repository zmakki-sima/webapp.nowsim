import "server-only";

import { z } from "zod";

import { isDeployed } from "@/lib/stage";

/**
 * Absolute origin, used where no request is in scope: links inside emails and
 * the URLs Stripe returns a customer to. A wrong value is invisible — the mail
 * still sends, the redirect still happens, both just point at the wrong host —
 * so a deployment has to state it rather than inherit a guess.
 *
 * The one exception is a Vercel preview, whose URL is minted per deployment and
 * cannot be written into a variable ahead of time; `fallbackOrigin` covers it.
 */
const siteUrl = z
  .url("NEXT_PUBLIC_SITE_URL must be an absolute origin, e.g. https://nowsim.com")
  .refine(
    (value) => !isDeployed || !value.includes("localhost"),
    "NEXT_PUBLIC_SITE_URL must not point at localhost once deployed",
  )
  .transform((value) => value.replace(/\/+$/, ""));

/**
 * What to use when nothing was stated. A laptop is `localhost`; a deployment
 * that forgot to set the variable falls back to the host Vercel assigned it,
 * which is right for a preview and merely harmless for a staging deploy that
 * should have stated its own address.
 *
 * `VERCEL_URL` carries no scheme and is never `localhost`, so it is safe to
 * assume https. Returns `undefined` off Vercel, which lets the schema fail with
 * its own message instead of inventing an origin.
 */
function fallbackOrigin(): string | undefined {
  if (!isDeployed) return "http://localhost:3000";

  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

  return host ? `https://${host}` : undefined;
}

const schema = z.object({
  YESIM_API_TOKEN: z
    .string()
    .min(1, "YESIM_API_TOKEN is required. The catalog cannot load without it"),
  YESIM_API_BASE: z.url().default("https://partners-api.yesim.biz"),
  REVALIDATE_SECRET: z.string().min(16).optional(),
  NEXT_PUBLIC_SITE_URL: siteUrl.or(
    z.undefined().transform(fallbackOrigin).pipe(siteUrl),
  ),
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
