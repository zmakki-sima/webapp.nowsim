import "server-only";

import { z } from "zod";

import { isLive } from "@/lib/stage";

/**
 * Test and live keys are interchangeable in shape but not in consequence, so
 * the mode is checked rather than assumed: a `sk_test_` key on the live site
 * takes payments that never settle, and a `sk_live_` key anywhere else charges
 * real cards during a test run.
 *
 * The question is `isLive`, not "was this built for production". A staging
 * deployment is built exactly like the live one and must still take test cards,
 * so `NODE_ENV` cannot be what decides this.
 */
const secretKey = z
  .string({ error: "STRIPE_SECRET_KEY is required to take payments" })
  .startsWith("sk_", "STRIPE_SECRET_KEY must be a secret key, starting `sk_`")
  .refine(
    (value) => value.startsWith(isLive ? "sk_live_" : "sk_test_"),
    isLive
      ? "The live site needs a live key (`sk_live_`)"
      : "Use a test key (`sk_test_`) outside the live site. A live key charges real cards. If this deployment is meant to be live, set NOWSIM_STAGE=live",
  );

/**
 * Signing secret for the webhook. Without it every incoming call is
 * unverifiable, and an unverified webhook is a stranger telling us an order was
 * paid. There is no safe default.
 */
const webhookSecret = z
  .string({ error: "STRIPE_WEBHOOK_SECRET is required to verify webhooks" })
  .startsWith(
    "whsec_",
    "STRIPE_WEBHOOK_SECRET must be the signing secret, starting `whsec_`",
  );

/**
 * Each secret is read where it is used rather than as one block, so a missing
 * webhook secret does not stop a payment from being taken and a missing API key
 * does not stop a webhook from being verified. Both still fail loudly — just at
 * the point that actually needs them, in the same lazy shape as `authEnv`.
 */
function reader(name: string, schema: z.ZodType<string>): () => string {
  let cached: string | null = null;

  return () => {
    if (cached !== null) return cached;

    const parsed = schema.safeParse(process.env[name]);

    if (!parsed.success) {
      throw new Error(
        [
          "Payments are not configured.",
          z.prettifyError(parsed.error),
          "Copy the Stripe block from .env.example into .env.local and fill it in.",
        ].join("\n"),
      );
    }

    cached = parsed.data;

    return cached;
  };
}

export const stripeSecretKey = reader("STRIPE_SECRET_KEY", secretKey);

export const stripeWebhookSecret = reader(
  "STRIPE_WEBHOOK_SECRET",
  webhookSecret,
);