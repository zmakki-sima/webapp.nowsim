import "server-only";

import type { z } from "zod";
import { z as zod } from "zod";

import { env } from "@/lib/env";

const TIMEOUT_MS = 10_000;
const ATTEMPTS = 2;

export type YesimOptions = {
  params?: Record<string, string>;
  /** Total budget per attempt, covering the body stream as well as the headers. */
  timeoutMs?: number;
  attempts?: number;
};

/**
 * `plans` sends ~750KB uncompressed (the upstream ignores accept-encoding) and
 * has been measured between 16s and 35s. The abort signal spans the body, so
 * the budget has to cover the whole download, and a single attempt has to fit
 * inside the 50s cap Next puts on filling a `use cache` entry during prerender
 * — a second attempt would overrun the cap and surface as USE_CACHE_TIMEOUT
 * instead of our own message.
 */
export const SLOW_OPTIONS = { timeoutMs: 45_000, attempts: 1 } as const;

export function redactToken(value: string): string {
  return value.replace(/((?:token|api_key)=)[^&\s"']+/gi, "$1[redacted]");
}

function urlFor(path: string, params?: Record<string, string>): URL {
  const url = new URL(path.replace(/^\/+/, ""), `${env.YESIM_API_BASE}/`);

  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }

  // Written last so a caller param named `token` can never replace the credentials.
  url.searchParams.set("token", env.YESIM_API_TOKEN);

  return url;
}

async function request(
  url: URL,
  path: string,
  method: "GET" | "POST",
  { timeoutMs = TIMEOUT_MS, attempts = ATTEMPTS }: YesimOptions,
): Promise<unknown> {
  let last = "no attempt was made";

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    let response: Response;

    try {
      response = await fetch(url, {
        method,
        headers: { accept: "application/json" },
        ...(method === "POST" ? { cache: "no-store" as const } : {}),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (cause) {
      last = redactToken(String(cause));
      continue;
    }

    if (response.status >= 500) {
      last = `upstream returned ${response.status}`;
      continue;
    }

    if (!response.ok) {
      throw new Error(`Yesim ${path} returned ${response.status}`);
    }

    // Reading the body is part of the attempt: the abort signal spans the
    // stream, so a mid-download timeout has to retry rather than escape.
    try {
      return await response.json();
    } catch (cause) {
      last = `invalid JSON: ${redactToken(String(cause))}`;
    }
  }

  throw new Error(`Yesim ${path} failed after ${attempts} attempts: ${last}`);
}

function parse<T>(payload: unknown, path: string, schema: z.ZodType<T>): T {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new Error(
      `Yesim ${path} did not match the expected shape:\n${zod.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}

export async function fetchYesim<T>(
  path: string,
  schema: z.ZodType<T>,
  options: YesimOptions = {},
): Promise<T> {
  const url = urlFor(path, options.params);

  return parse(await request(url, path, "GET", options), path, schema);
}

export async function postYesim<T>(
  path: string,
  schema: z.ZodType<T>,
  options: YesimOptions = {},
): Promise<T> {
  const url = urlFor(path, options.params);

  return parse(await request(url, path, "POST", options), path, schema);
}
