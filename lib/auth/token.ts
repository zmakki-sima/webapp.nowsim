import "server-only";

import { EncryptJWT, jwtDecrypt } from "jose";
import { z } from "zod";

import { sessionKey } from "@/lib/auth/env";

const payloadSchema = z.object({
  email: z.string().min(1),
  yesimUserId: z.string().min(1),
  provider: z.enum(["google", "email"]),
  issuedAt: z.number().int().positive(),
  authAt: z.number().int().positive(),
  sid: z.string().min(1),
});

export type Session = z.infer<typeof payloadSchema>;

export const IDLE_MS = 14 * 24 * 60 * 60 * 1000;

export const ABSOLUTE_MS = 90 * 24 * 60 * 60 * 1000;

const FRESH_MS = 10 * 60 * 1000;

export function isFresh(session: Session): boolean {
  return Date.now() - session.authAt < FRESH_MS;
}

const REFRESH_AFTER_MS = 60 * 60 * 1000;

const production = process.env.NODE_ENV === "production";

export const COOKIE = production ? "__Host-nowsim_session" : "nowsim_session";

export const cookieOptions = {
  httpOnly: true,
  secure: production,
  sameSite: "lax",
  path: "/",
} as const;

export async function encryptSession(session: Session): Promise<string> {
  return new EncryptJWT(session)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + IDLE_MS))
    .encrypt(sessionKey());
}

type Decoded = {
  session: Session;
  tokenIssuedAt: number;
};

export async function decryptSession(
  token: string | undefined,
): Promise<Decoded | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtDecrypt(token, sessionKey(), {
      contentEncryptionAlgorithms: ["A256GCM"],
      keyManagementAlgorithms: ["dir"],
    });

    const parsed = payloadSchema.safeParse(payload);

    if (!parsed.success) return null;

    if (Date.now() - parsed.data.issuedAt > ABSOLUTE_MS) return null;

    return {
      session: parsed.data,
      tokenIssuedAt: typeof payload.iat === "number" ? payload.iat * 1000 : 0,
    };
  } catch {
    return null;
  }
}

export function needsRefresh(tokenIssuedAt: number): boolean {
  return Date.now() - tokenIssuedAt >= REFRESH_AFTER_MS;
}
