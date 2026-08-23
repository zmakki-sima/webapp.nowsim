import "server-only";

import { redis } from "@/lib/auth/redis";
import { ABSOLUTE_MS } from "@/lib/auth/token";

const TTL_SECONDS = Math.ceil(ABSOLUTE_MS / 1000);

function key(sid: string): string {
  return `session:revoked:${sid}`;
}

export async function revokeSession(sid: string): Promise<void> {
  await redis().set(key(sid), 1, { ex: TTL_SECONDS });
}

export async function isRevoked(sid: string): Promise<boolean> {
  return (await redis().exists(key(sid))) === 1;
}
