"use client";

import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MdCancel } from "react-icons/md";

import {
  requestOtp,
  verifyOtp,
  type CodeState,
  type EmailState,
} from "@/app/actions/auth";
import { useSetAccount } from "@/components/layout/SessionProvider";
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
  clear: string;
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
  change:
    "border border-hairline text-ink hover:border-ink/25 hover:bg-surface-soft active:bg-surface-soft",
  clear: "text-muted hover:text-ink active:text-ink",
};

const button = cn(
  "w-full gap-3 rounded-control px-5 py-3.5",
  "text-base font-bold tracking-[-0.01em]",
);

const field = cn(
  "w-full rounded-control border px-5 py-3.5",
  "text-base font-medium",
  // Matches the authorization-code field on the eSIMs page: the brand tint on
  // the border replaces the UA focus ring, so `outline-none` is only safe
  // alongside it.
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
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = useCountdown(resendAt);

  const [failed, setFailed] = useState(false);
  const [seenState, setSeenState] = useState(state);

  if (seenState !== state) {
    setSeenState(state);
    setFailed(state.error !== undefined);
  }

  function clear() {
    setCode("");
    setFailed(false);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-base font-bold">{email}</p>

        <Pressable
          onClick={onChangeEmail}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-sm font-bold",
            tone.change,
          )}
        >
          Change
        </Pressable>
      </div>

      <form action={action} className="flex flex-col gap-2">
        <input type="hidden" name="email" value={email} />

        <div className="relative">
          <input
            ref={inputRef}
            name="code"
            autoFocus
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Authorization code"
            aria-label="Authorization code"
            aria-invalid={failed ? true : undefined}
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
              setFailed(false);
            }}
            className={cn(
              field,
              failed ? cn(tone.fieldError, "pr-14") : tone.fieldIdle,
            )}
          />

          {failed && code !== "" ? (
            <Pressable
              onClick={clear}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2",
                tone.clear,
              )}
            >
              <MdCancel aria-hidden className="h-5 w-5" />
              <span className="sr-only">Clear the code</span>
            </Pressable>
          ) : null}
        </div>

        <p
          role={failed ? "alert" : undefined}
          className={cn(
            "text-sm",
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
            disabled={pending}
            className={cn(button, "mt-1", pending ? tone.inert : tone.primary)}
          >
            {pending ? "Checking…" : "Continue"}
          </Pressable>
        ) : null}
      </form>

      {code === "" ? (
        <form action={resend} className="mt-1">
          <input type="hidden" name="email" value={email} />

          <Pressable
            type="submit"
            disabled={resending || remaining > 0}
            className={cn(
              button,
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
