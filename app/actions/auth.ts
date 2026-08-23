"use server";

import { headers } from "next/headers";
import { z } from "zod";

import type { Account } from "@/lib/auth/account";
import { requestCode, verifyCode } from "@/lib/auth/otp";
import { sendOtpEmail } from "@/lib/auth/mailer";
import { verifySession } from "@/lib/auth/dal";
import {
  createSession,
  destroySession,
  markReauthenticated,
} from "@/lib/auth/session";
import { yesimUserId } from "@/lib/auth/user";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"))
  .pipe(z.string().max(254));

const codeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Invalid authentication code, please check and try again");

export type EmailState = {
  ok: boolean;
  email: string;
  error?: string;
  at?: number;
  cooldown?: number;
};

export type CodeState = {
  ok: boolean;
  error?: string;
  account?: Account;
};

async function callerIp(): Promise<string> {
  const forwarded = (await headers()).get("x-forwarded-for");

  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function requestOtp(
  _previous: EmailState,
  formData: FormData,
): Promise<EmailState> {
  const parsed = emailSchema.safeParse(formData.get("email"));

  if (!parsed.success) {
    return {
      ok: false,
      email: String(formData.get("email") ?? ""),
      error: parsed.error.issues[0]?.message ?? "Enter a valid email address",
    };
  }

  const email = parsed.data;

  try {
    const result = await requestCode(email, await callerIp());

    if (result.status === "rate-limited") {
      return {
        ok: false,
        email,
        error: "Too many codes requested. Try again in an hour.",
      };
    }

    if (result.status === "cooldown") {
      return { ok: true, email, at: Date.now(), cooldown: result.retryIn };
    }

    await sendOtpEmail(email, result.code, result.expiresIn);

    return { ok: true, email, at: Date.now(), cooldown: 60 };
  } catch (cause) {
    console.error("requestOtp failed:", cause);

    return {
      ok: false,
      email,
      error: "We could not send the code. Try again in a moment.",
    };
  }
}

export async function verifyOtp(
  _previous: CodeState,
  formData: FormData,
): Promise<CodeState> {
  const email = emailSchema.safeParse(formData.get("email"));
  const code = codeSchema.safeParse(formData.get("code"));

  if (!email.success) {
    return { ok: false, error: "Start again. That email is not valid." };
  }

  if (!code.success) {
    return {
      ok: false,
      error: "Invalid authentication code, please check and try again",
    };
  }

  try {
    const result = await verifyCode(email.data, code.data);

    if (result === "invalid") {
      return {
        ok: false,
        error: "Invalid authentication code, please check and try again",
      };
    }

    if (result === "locked") {
      return {
        ok: false,
        error: "Too many wrong codes. Request a new one.",
      };
    }

    if (result === "expired") {
      return {
        ok: false,
        error: "That code has expired. Request a new one.",
      };
    }

    const userId = await yesimUserId(email.data);

    await createSession({
      email: email.data,
      yesimUserId: userId,
      provider: "email",
    });

    return {
      ok: true,
      account: {
        userId,
        email: email.data,
        provider: "email",
      },
    };
  } catch (cause) {
    console.error("verifyOtp failed:", cause);

    return { ok: false, error: "Something went wrong. Try again in a moment." };
  }
}

export async function signOut(): Promise<void> {
  await destroySession();
}

export type ReauthState = {
  ok: boolean;
  sent?: boolean;
  error?: string;
};

export async function requestReauth(): Promise<ReauthState> {
  const session = await verifySession();

  if (!session) return { ok: false, error: "Sign in again to continue." };

  try {
    const result = await requestCode(session.email, await callerIp());

    if (result.status === "rate-limited") {
      return { ok: false, error: "Too many codes requested. Try again in an hour." };
    }

    if (result.status === "cooldown") return { ok: true, sent: true };

    await sendOtpEmail(session.email, result.code, result.expiresIn);

    return { ok: true, sent: true };
  } catch (cause) {
    console.error("requestReauth failed:", cause);

    return { ok: false, error: "We could not send the code. Try again in a moment." };
  }
}

export async function confirmReauth(
  _previous: ReauthState,
  formData: FormData,
): Promise<ReauthState> {
  const session = await verifySession();

  if (!session) return { ok: false, error: "Sign in again to continue." };

  const code = codeSchema.safeParse(formData.get("code"));

  if (!code.success) {
    return {
      ok: false,
      sent: true,
      error: "Invalid authentication code, please check and try again",
    };
  }

  try {
    const result = await verifyCode(session.email, code.data);

    if (result !== "ok") {
      return {
        ok: false,
        sent: true,
        error:
          result === "invalid"
            ? "Invalid authentication code, please check and try again"
            : result === "locked"
              ? "Too many wrong codes. Request a new one."
              : "That code has expired. Request a new one.",
      };
    }

    await markReauthenticated();

    return { ok: true };
  } catch (cause) {
    console.error("confirmReauth failed:", cause);

    return { ok: false, sent: true, error: "Something went wrong. Try again in a moment." };
  }
}
