"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { MdLockOutline } from "react-icons/md";

import { confirmReauth, requestReauth, type ReauthState } from "@/app/actions/auth";
import { lightTone } from "@/components/auth/EmailSignIn";
import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

const field = cn(
  "w-full rounded-control border px-5 py-3.5",
  "text-base font-medium",
  "focus:border-brand/30 focus:outline-none",
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
        <span
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/12 text-brand"
        >
          <MdLockOutline className="h-7 w-7" />
        </span>

        <p className="text-sm text-muted">
          Anyone with the activation code can install this eSIM, so we check it
          is you before showing it.
        </p>

        <Pressable
          onClick={send}
          disabled={sending}
          className={cn(
            button,
            sending ? lightTone.inert : lightTone.primary,
          )}
        >
          {sending ? "Sending…" : "Email me a code"}
        </Pressable>

        {error ? (
          <p role="alert" className={cn("text-sm font-medium", lightTone.error)}>
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
        className={cn(field, error ? lightTone.fieldError : lightTone.fieldIdle)}
      />

      <p
        role={error ? "alert" : undefined}
        className={cn(
          "text-sm",
          error ? cn("font-medium", lightTone.error) : lightTone.helper,
        )}
      >
        {error ?? "Your authorization code has been sent to your email"}
      </p>

      {code.length === 6 ? (
        <Pressable
          type="submit"
          disabled={pending}
          className={cn(
            button,
            "mt-1",
            pending ? lightTone.inert : lightTone.primary,
          )}
        >
          {pending ? "Checking…" : "Show install details"}
        </Pressable>
      ) : null}
    </form>
  );
}
