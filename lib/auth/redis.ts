import "server-only";

import { Redis } from "@upstash/redis";
import { createHmac } from "node:crypto";

import { authEnv } from "@/lib/auth/env";

let client: Redis | null = null;

export function redis(): Redis {
  const env = authEnv();

  client ??= new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  return client;
}

export function digest(value: string): string {
  return createHmac("sha256", authEnv().SESSION_SECRET).update(value).digest("hex");
}
