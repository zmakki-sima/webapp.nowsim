import "server-only";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

import { isRevoked, revokeSession } from "@/lib/auth/revocation";
import {
  COOKIE,
  cookieOptions,
  decryptSession,
  encryptSession,
  IDLE_MS,
  type Session,
} from "@/lib/auth/token";

export type { Session };

export async function readSession(): Promise<Session | null> {
  const decoded = await decryptSession((await cookies()).get(COOKIE)?.value);

  if (!decoded) return null;

  if (await isRevoked(decoded.session.sid)) return null;

  return decoded.session;
}

export async function createSession(
  session: Omit<Session, "issuedAt" | "authAt" | "sid">,
): Promise<void> {
  const issuedAt = Date.now();

  await write({ ...session, issuedAt, authAt: issuedAt, sid: randomUUID() });
}

export async function markReauthenticated(): Promise<Session | null> {
  const session = await readSession();

  if (!session) return null;

  const stamped: Session = { ...session, authAt: Date.now() };

  await write(stamped);

  return stamped;
}

async function write(payload: Session): Promise<void> {
  (await cookies()).set(COOKIE, await encryptSession(payload), {
    ...cookieOptions,
    expires: new Date(Date.now() + IDLE_MS),
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const decoded = await decryptSession(store.get(COOKIE)?.value);

  if (decoded) await revokeSession(decoded.session.sid);

  store.delete(COOKIE);
}
