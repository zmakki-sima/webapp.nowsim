import "server-only";

import { cache } from "react";

import type { Account } from "@/lib/auth/account";
import { readSession, type Session } from "@/lib/auth/session";
import { isFresh } from "@/lib/auth/token";

export const verifySession = cache(async (): Promise<Session | null> => {
  return readSession();
});

export const verifyFreshSession = cache(async (): Promise<Session | null> => {
  const session = await verifySession();

  return session && isFresh(session) ? session : null;
});

export const getAccount = cache(async (): Promise<Account | null> => {
  const session = await verifySession();

  if (!session) return null;

  return {
    userId: session.yesimUserId,
    email: session.email,
  };
});
