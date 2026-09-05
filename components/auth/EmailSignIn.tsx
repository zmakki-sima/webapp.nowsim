"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import {
  requestOtp,
  verifyOtp,
  type CodeState,
  type EmailState,
} from "@/app/actions/auth";
import { useSetAccount } from "@/components/layout/SessionProvider";
import { OtpInput } from "@/components/ui/OtpInput";
import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

export type SignInTone = {
  fieldIdle: string;
  fieldError: string;
  primary: string;
  secondary: string;
  inert: string;
  helper: string;
  error: string;
  change: string;
};

export const lightTone: SignInTone = {
  fieldIdle: "border-hairline bg-surface text-ink placeholder:text-muted",
  fieldError: "border-danger bg-danger/5 text-ink placeholder:text-muted",
  primary: "bg-brand text-white hover:bg-brand-soft active:bg-brand-soft",
  secondary:
    "border border-hairline text-ink hover:border-ink/25 hover:bg-surface-soft active:bg-surface-soft",
  inert: "bg-surface-soft text-muted",
  helper: "text-muted",
  error: "text-danger",
  /* A tint rather than a solid fill: solid brand would put two identical
     purple buttons on the code step, and this one is not the primary action. */
  change: "bg-brand/10 text-brand hover:bg-brand/16 active:bg-brand/16",
};

const button = cn(
  "w-full gap-3 rounded-control px-5 py-3.5",
  "text-base font-bold tracking-[-0.01em]",
);

/**
 * The email field. Authorization codes use `OtpInput` instead — six boxes, not
 * one line. The brand tint on the border replaces the UA focus ring here, so
 * `outline-none` is only safe alongside it.
 */
const field = cn(
  "w-full rounded-control border px-5 py-3.5",
  "text-base font-medium",
  "focus:border-brand/30 focus:outline-none",
  "transition-colors duration-300 ease-hover motion-reduce:transition-none",
);

const EMAIL_STATE: EmailState = { ok: false, email: "" };
const CODE_STATE: CodeState = { ok: false };

function clock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function useCountdown(until: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (until <= Date.now()) return;

    const id = setInterval(() => setNow(Date.now()), 500);

    return () => clearInterval(id);
  }, [until]);

  return Math.max(0, Math.ceil((until - now) / 1000));
}

function EmailStep({
  tone,
  state,
  action,
  pending,
  cancelLabel,
  legal,
  onCancel,
}: {
  tone: SignInTone;
  state: EmailState;
  action: (formData: FormData) => void;
  pending: boolean;
  cancelLabel?: string;
  legal?: ReactNode;
  onCancel?: () => void;
}) {
  const [email, setEmail] = useState(state.email);
  const empty = email.trim() === "";

  return (
    <form action={action} className="flex flex-col gap-3">
      <input
        type="email"
        name="email"
        autoFocus
        required
        autoComplete="email"
        placeholder="Enter email"
        aria-label="Email address"
        aria-invalid={state.error ? true : undefined}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={cn(field, state.error ? tone.fieldError : tone.fieldIdle)}
      />

      {state.error ? (
        <p role="alert" className={cn("text-sm font-medium", tone.error)}>
          {state.error}
        </p>
      ) : null}

      <Pressable
        type="submit"
        disabled={pending || empty}
        className={cn(button, pending || empty ? tone.inert : tone.primary)}
      >
        {pending ? "Sending…" : "Continue"}
      </Pressable>

      {onCancel ? (
        <Pressable onClick={onCancel} className={cn(button, tone.secondary)}>
          {cancelLabel ?? "Cancel"}
        </Pressable>
      ) : null}

      {legal}
    </form>
  );
}

function CodeStep({
  tone,
  email,
  state,
  action,
  pending,
  resend,
  resending,
  resendAt,
  resendError,
  cancelLabel,
  onChangeEmail,
  onCancel,
}: {
  tone: SignInTone;
  email: string;
  state: CodeState;
  action: (formData: FormData) => void;
  pending: boolean;
  resend: (formData: FormData) => void;
  resending: boolean;
  resendAt: number;
  resendError?: string;
  cancelLabel?: string;
  onChangeEmail: () => void;
  onCancel?: () => void;
}) {
  const [code, setCode] = useState("");
  const remaining = useCountdown(resendAt);

  const [failed, setFailed] = useState(false);
  const [seenState, setSeenState] = useState(state);

  if (seenState !== state) {
    setSeenState(state);
    setFailed(state.error !== undefined);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* The address is what the code was sent to, not the heading — it reads
          one step down from the dialog title so the two do not compete. */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-base font-medium text-muted">
          {email}
        </p>

        <Pressable
          onClick={onChangeEmail}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-sm font-bold",
            "transition-colors duration-300 ease-hover motion-reduce:transition-none",
            tone.change,
          )}
        >
          Change
        </Pressable>
      </div>

      <form action={action} className="flex flex-col gap-2">
        <input type="hidden" name="email" value={email} />

        <OtpInput
          name="code"
          autoFocus
          value={code}
          onChange={(next) => {
            setCode(next);
            setFailed(false);
          }}
          error={failed}
        />

        <p
          role={failed ? "alert" : undefined}
          className={cn(
            "text-center text-sm",
            failed ? cn("font-medium", tone.error) : tone.helper,
          )}
        >
          {failed
            ? state.error
            : "Your authorization code has been sent to your email"}
        </p>

        {code !== "" ? (
          <Pressable
            type="submit"
            disabled={pending || code.length < 6}
            className={cn(
              button,
              "mt-4 disabled:opacity-100",
              pending || code.length < 6 ? tone.inert : tone.primary,
            )}
          >
            {pending ? "Checking…" : "Continue"}
          </Pressable>
        ) : null}
      </form>

      {code === "" ? (
        <form action={resend} className="mt-3">
          <input type="hidden" name="email" value={email} />

          {/* The inert tone already reads as unavailable during the cooldown,
              so the button keeps its own colour rather than fading out on top
              of it — the same call the eSIM dialog makes. */}
          <Pressable
            type="submit"
            disabled={resending || remaining > 0}
            className={cn(
              button,
              "disabled:opacity-100",
              remaining > 0 || resending ? tone.inert : tone.primary,
            )}
          >
            {remaining > 0 ? `Resend: ${clock(remaining)}` : "Resend"}
          </Pressable>

          {resendError ? (
            <p
              role="alert"
              className={cn("mt-2 text-sm font-medium", tone.error)}
            >
              {resendError}
            </p>
          ) : null}
        </form>
      ) : null}

      {onCancel ? (
        <Pressable onClick={onCancel} className={cn(button, tone.secondary)}>
          {cancelLabel ?? "Cancel"}
        </Pressable>
      ) : null}
    </div>
  );
}

export function EmailSignIn({
  tone,
  cancelLabel,
  legal,
  onCancel,
  onSignedIn,
}: {
  tone: SignInTone;
  cancelLabel?: string;
  /*
    Consent copy for the &ldquo;Continue&rdquo; button that sends the code. It
    only belongs on the email step: by the code step that click has already
    happened, so repeating it there says nothing new.
  */
  legal?: ReactNode;
  onCancel?: () => void;
  onSignedIn?: () => void;
}) {
  const router = useRouter();
  const setAccount = useSetAccount();

  const [emailState, sendCode, sending] = useActionState(requestOtp, EMAIL_STATE);
  const [codeState, checkCode, checking] = useActionState(verifyOtp, CODE_STATE);

  const [onCode, setOnCode] = useState(false);
  const [seenSend, setSeenSend] = useState(emailState.at);

  if (seenSend !== emailState.at) {
    setSeenSend(emailState.at);
    if (emailState.ok && emailState.at) setOnCode(true);
  }

  useEffect(() => {
    if (!codeState.ok || !codeState.account) return;

    setAccount(codeState.account);
    router.refresh();
    onSignedIn?.();
  }, [codeState, setAccount, router, onSignedIn]);

  if (onCode) {
    return (
      <CodeStep
        tone={tone}
        email={emailState.email}
        state={codeState}
        action={checkCode}
        pending={checking}
        resend={sendCode}
        resending={sending}
        resendAt={(emailState.at ?? 0) + (emailState.cooldown ?? 0) * 1000}
        resendError={emailState.ok ? undefined : emailState.error}
        cancelLabel={cancelLabel}
        onChangeEmail={() => setOnCode(false)}
        onCancel={onCancel}
      />
    );
  }

  return (
    <EmailStep
      tone={tone}
      state={emailState}
      action={sendCode}
      pending={sending}
      cancelLabel={cancelLabel}
      legal={legal}
      onCancel={onCancel}
    />
  );
}
