import "server-only";

import { toEsims } from "@/lib/api/mappers";
import { userResponseSchema } from "@/lib/api/schemas";
import { fetchYesim } from "@/lib/api/yesim";
import { verifyFreshSession, verifySession } from "@/lib/auth/dal";
import { getPlanIndex } from "@/lib/data/catalog";
import type { Esim } from "@/lib/types";

function withoutCredentials(esim: Esim): Esim {
  const { activationCode, qrImage, iosTapLink, ...rest } = esim;
  const had = Boolean(activationCode || qrImage || iosTapLink);

  return had ? { ...rest, installLocked: true } : rest;
}

export async function getEsims(): Promise<Esim[] | null> {
  const session = await verifySession();

  if (!session) return null;

  const [user, plans, fresh] = await Promise.all([
    fetchYesim("user", userResponseSchema, {
      params: { user_id: session.yesimUserId },
    }),
    getPlanIndex(),
    verifyFreshSession(),
  ]);

  const esims = toEsims(user.esims, plans);

  return fresh ? esims : esims.map(withoutCredentials);
}
