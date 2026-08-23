"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { MdLockOutline } from "react-icons/md";

import { confirmReauth, requestReauth, type ReauthState } from "@/app/actions/auth";
import { darkTone } from "@/components/auth/EmailSignIn";
import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

const field = cn(
  "w-full rounded-control border px-5 py-3.5",
  "text-base font-medium",
  "focus:outline-none",
  "transition-colors duration-300 ease-hover motion-reduce:transition-none",
);

const button = cn(
  "w-full justify-center rounded-control px-5 py-3.5 text-base font-bold",
);

export function ConfirmIdentity() {
  const router = useRouter();
  const [state, action, pending] = useActionState<ReauthState, FormData>(
    confirmReauth,
    { ok: false },
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<ReauthState | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  async function send() {
    setSending(true);
    setSent(await requestReauth());
    setSending(false);
  }

  const error = state.error ?? sent?.error;

  if (!sent?.sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <MdLockOutline aria-hidden className="h-8 w-8 text-white/70" />

        <p className="text-sm text-white/70">
          Anyone with the activation code can install this eSIM, so we check it
          is you before showing it. We will email you a code.
        </p>

        <Pressable
          onClick={send}
          disabled={sending}
          className={cn(
            button,
            sending ? "bg-white/10 text-white/40" : "bg-white text-ink hover:bg-white/85",
          )}
        >
          {sending ? "Sending…" : "Email me a code"}
        </Pressable>

        {error ? (
          <p role="alert" className={cn("text-sm font-medium", darkTone.error)}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2 py-2">
      <input
        name="code"
        autoFocus
        required
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="Authorization code"
        aria-label="Authorization code"
        aria-invalid={error ? true : undefined}
        value={code}
        onChange={(event) =>
          setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
        }
        className={cn(field, error ? darkTone.fieldError : darkTone.fieldIdle)}
      />

      <p
        role={error ? "alert" : undefined}
        className={cn(
          "text-sm",
          error ? cn("font-medium", darkTone.error) : darkTone.helper,
        )}
      >
        {error ?? "Your authorization code has been sent to your email"}
      </p>

      {code !== "" ? (
        <Pressable
          type="submit"
          disabled={pending}
          className={cn(
            button,
            "mt-1",
            pending ? "bg-white/10 text-white/40" : "bg-white text-ink hover:bg-white/85",
          )}
        >
          {pending ? "Checking…" : "Show install details"}
        </Pressable>
      ) : null}
    </form>
  );
}
