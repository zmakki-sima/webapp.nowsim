import "server-only";

import Stripe from "stripe";

import { stripeSecretKey } from "@/lib/payments/env";

/**
 * Pinned rather than left to the account default: the SDK's types describe this
 * version only, so an account set to an older version would type-check against
 * a shape the API does not actually send.
 */
const API_VERSION = "2026-07-29.dahlia";

let client: Stripe | null = null;

export function stripe(): Stripe {
  client ??= new Stripe(stripeSecretKey(), {
    apiVersion: API_VERSION,
    typescript: true,
    appInfo: { name: "nowsim" },
  });

  return client;
}