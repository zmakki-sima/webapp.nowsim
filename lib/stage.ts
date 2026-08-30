import "server-only";

/**
 * `NODE_ENV` answers "was this built by `next build`", which every deployment
 * is — a staging deploy on `nowsim.vercel.app` and the live site are identical
 * by that measure. But they are not identical in consequence: staging takes
 * test cards, live takes real money. Anything that guards real money has to ask
 * a question `NODE_ENV` cannot answer.
 *
 * So the mode is stated, not inferred. `NOWSIM_STAGE` is the one switch that
 * decides whether this deployment is allowed to charge a real card:
 *
 *   development — a laptop. `next dev`.
 *   staging     — a real deployment, test keys, fake cards. Safe to break.
 *   live        — the real site. Real cards, real customers.
 *
 * Unset, a deployment is `staging`, never `live`. Getting that default backwards
 * would let a half-configured deploy demand live keys, and the failure mode of
 * guessing "live" is worse than the failure mode of guessing "staging".
 */
export type Stage = "development" | "staging" | "live";

const stages = new Set<Stage>(["development", "staging", "live"]);

function read(): Stage {
  // `next dev` is a laptop regardless of what the variable says.
  if (process.env.NODE_ENV !== "production") return "development";

  const declared = process.env.NOWSIM_STAGE?.trim().toLowerCase();

  if (!declared) return "staging";

  if (!stages.has(declared as Stage)) {
    throw new Error(
      `NOWSIM_STAGE is "${declared}". It must be one of: development, staging, live.`,
    );
  }

  return declared as Stage;
}

export const stage: Stage = read();

/**
 * The real site, serving real customers. The only mode where a live Stripe key
 * is required and a test one is refused.
 */
export const isLive = stage === "live";

/**
 * Any real deployment, staging or live — as opposed to a laptop. This is the
 * right test for things that are about being reachable over the internet rather
 * than about money: secure cookies, a stated site URL, a verified mail sender.
 */
export const isDeployed = stage !== "development";
