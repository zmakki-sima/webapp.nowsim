"use server";

import { verifyFreshSession } from "@/lib/auth/dal";
import { digest, redis } from "@/lib/auth/redis";
import { getEsims } from "@/lib/data/esims";
import { sendEsimEmail } from "@/lib/mail/esim";

export type MailState = {
  ok: boolean;
  email?: string;
  error?: string;
  locked?: boolean;
  throttled?: boolean;
};

const COOLDOWN_SECONDS = 60;

export async function emailEsim(esimId: string): Promise<MailState> {
  const session = await verifyFreshSession();

  if (!session) {
    return {
      ok: false,
      locked: true,
      error: "Confirm it is you before we email the code.",
    };
  }

  try {
    const esims = await getEsims();
    const esim = esims?.find((entry) => entry.id === esimId);

    if (!esim) return { ok: false, error: "That eSIM is not on your account." };

    if (!esim.activationCode && !esim.qrImage) {
      return { ok: false, error: "This eSIM has no installation code left." };
    }

    const claimed = await redis().set(
      `mail:esim:${digest(`${session.email}:${esim.id}`)}`,
      1,
      { nx: true, ex: COOLDOWN_SECONDS },
    );

    if (claimed !== "OK") {
      return { ok: true, email: session.email, throttled: true };
    }

    await sendEsimEmail(session.email, esim);

    return { ok: true, email: session.email };
  } catch (cause) {
    console.error("emailEsim failed:", cause);

    return { ok: false, error: "We could not send it. Try again in a moment." };
  }
}
