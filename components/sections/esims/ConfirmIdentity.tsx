"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { MdLockOutline } from "react-icons/md";

import { confirmReauth, requestReauth, type ReauthState } from "@/app/actions/auth";
import { lightTone } from "@/components/auth/EmailSignIn";
import { OtpInput } from "@/components/ui/OtpInput";
import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

// Not the sign-in button: that one is a `gap-3` row with tighter tracking,
// because it carries an icon. This one is text only.
const button = cn(
  "w-full justify-center rounded-control px-5 py-3.5 text-base font-bold",
);

export function ConfirmIdentity({
  reason = "before showing it",
  submitLabel = "Show install details",
  onConfirmed,
}: {
  /** What the confirmation unlocks — the caller asked for it, not this dialog. */
  reason?: string;
  submitLabel?: string;
  onConfirmed?: () => void;
} = {}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ReauthState, FormData>(
    confirmReauth,
    { ok: false },
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<ReauthState | null>(null);
  const [code, setCode] = useState("");

  // Held in a ref so a caller passing an inline closure does not re-run the
  // effect below — that fires once, on the transition to confirmed.
  const confirmed = useRef(onConfirmed);

  useEffect(() => {
    confirmed.current = onConfirmed;
  }, [onConfirmed]);

  useEffect(() => {
    if (!state.ok) return;

    router.refresh();
    confirmed.current?.();
  }, [state.ok, router]);

  async function send() {
    setSending(true);
    setSent(await requestReauth());
    setSending(false);
  }

  const error = state.error ?? sent?.error;

  if (!sent?.sent) {
    return (
      <div className="flex flex-col items-center gap-4 pt-8 pb-2 text-center">
        <span
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/12 text-brand"
        >
          <MdLockOutline className="h-7 w-7" />
        </span>

        <p className="text-sm text-muted">
          Anyone with the activation code can install this eSIM, so we check it
          is you {reason}.
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
    <form action={action} className="flex flex-col gap-2 pt-8 pb-2">
      <OtpInput
        name="code"
        autoFocus
        value={code}
        onChange={setCode}
        error={error !== undefined}
      />

      <p
        role={error ? "alert" : undefined}
        className={cn(
          "text-center text-sm",
          error ? cn("font-medium", lightTone.error) : lightTone.helper,
        )}
      >
        {error ?? "Your authorization code has been sent to your email"}
      </p>

      {/* Shown from the start so the dialog says what finishing the code does.
          The inert tone already reads as unavailable, so it keeps its own
          colour rather than fading out on top of it. */}
      <Pressable
        type="submit"
        disabled={pending || code.length < 6}
        className={cn(
          button,
          "mt-4 disabled:opacity-100",
          pending || code.length < 6 ? lightTone.inert : lightTone.primary,
        )}
      >
        {pending ? "Checking…" : submitLabel}
      </Pressable>
    </form>
  );
}
