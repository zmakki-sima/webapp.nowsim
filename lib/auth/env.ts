import "server-only";

import { z } from "zod";

import { isLive } from "@/lib/stage";

const required =
  "AUTH_EMAIL_FROM is required. Use an address on a domain verified in Resend";

/**
 * The sandbox sender only reaches the Resend account owner and fails SPF/DKIM
 * everywhere else, so the live site has to name a domain we actually verified.
 * Staging may keep the sandbox: its only recipient is us, which is exactly who
 * a staging sign-in should reach.
 */
const emailFrom = z
  .string({ error: required })
  .min(1, required)
  .refine(
    (value) => !isLive || !value.includes("@resend.dev"),
    "AUTH_EMAIL_FROM must not use the Resend sandbox domain on the live site",
  );

const schema = z.object({
  SESSION_SECRET: z
    .string()
    .min(1, "SESSION_SECRET is required. Generate one with `openssl rand -base64 32`")
    .refine(
      (value) => Buffer.from(value, "base64").length === 32,
      "SESSION_SECRET must decode to exactly 32 bytes (A256GCM). Use `openssl rand -base64 32`",
    ),
  UPSTASH_REDIS_REST_URL: z.url("UPSTASH_REDIS_REST_URL must be the REST URL, not the redis:// one"),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  RESEND_API_KEY: z.string().min(1).optional(),
  AUTH_EMAIL_FROM: isLive
    ? emailFrom
    : emailFrom.default("nowsim <onboarding@resend.dev>"),
});

type AuthEnv = z.infer<typeof schema>;

let cached: AuthEnv | null = null;

export function authEnv(): AuthEnv {
  if (cached) return cached;

  const parsed = schema.safeParse({
    SESSION_SECRET: process.env.SESSION_SECRET,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    AUTH_EMAIL_FROM: process.env.AUTH_EMAIL_FROM,
  });

  if (!parsed.success) {
    throw new Error(
      [
        "Sign-in is not configured.",
        z.prettifyError(parsed.error),
        "Copy the auth block from .env.example into .env.local and fill it in.",
      ].join("\n"),
    );
  }

  cached = parsed.data;

  return cached;
}

export function sessionKey(): Uint8Array {
  return new Uint8Array(Buffer.from(authEnv().SESSION_SECRET, "base64"));
}
