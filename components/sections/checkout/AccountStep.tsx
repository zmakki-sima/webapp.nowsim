"use client";

import { useState, useTransition } from "react";
import { MdPerson } from "react-icons/md";

import { signOut } from "@/app/actions/auth";
import { EmailSignIn, lightTone } from "@/components/auth/EmailSignIn";
import { useSetAccount } from "@/components/layout/SessionProvider";
import { Step } from "@/components/sections/checkout/Step";
import { Pressable } from "@/components/ui/Pressable";
import { useRouter } from "next/navigation";
import type { Account } from "@/lib/auth/account";
import { authProviders, legalLinks } from "@/lib/auth/providers";
import type { ProviderId } from "@/lib/auth/providers";
import { cn } from "@/lib/cn";

const tones: Record<ProviderId, string> = {
  google:
    "border border-hairline hover:border-ink/25 hover:bg-surface-soft active:bg-surface-soft",
  email:
    "border border-hairline hover:border-ink/25 hover:bg-surface-soft active:bg-surface-soft",
};

const providerButton = cn(
  "w-full gap-3 rounded-full px-5 py-3.5",
  "text-base font-bold tracking-[-0.01em]",
);

function Legal() {
  return (
    <p className="mt-5 text-center text-xs leading-relaxed text-muted">
      By continuing, you agree to our{" "}
      {legalLinks.map((item, index) => (
        <span key={item.label}>
          <Pressable
            href={item.href}
            press={false}
            className={cn(
              "inline font-bold text-ink underline underline-offset-2",
              "transition-colors duration-300 ease-hover hover:text-brand",
              "motion-reduce:transition-none",
            )}
          >
            {item.label}
          </Pressable>
          {index === legalLinks.length - 2
            ? " and "
            : index < legalLinks.length - 1
              ? ", "
              : ""}
        </span>
      ))}
      .
    </p>
  );
}

function SignedIn({ account }: { account: Account }) {
  const setAccount = useSetAccount();
  const router = useRouter();
  const [leaving, startLeaving] = useTransition();

  function leave() {
    startLeaving(async () => {
      await signOut();

      setAccount(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-card border border-hairline bg-surface-soft p-4">
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white"
        >
          <MdPerson className="h-6 w-6" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold tracking-[-0.01em]">
            {account.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Pressable
            onClick={leave}
            disabled={leaving}
            className={cn(
              "rounded-full border border-brand px-4 py-2",
              "text-sm font-bold text-brand",
              "hover:bg-brand/8 active:bg-brand/8",
            )}
          >
            {leaving ? "Signing out…" : "Sign out"}
          </Pressable>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        Your eSIM, QR code and receipt go to this address the moment payment
        clears.
      </p>
    </>
  );
}

function SignedOut() {
  const [email, setEmail] = useState(false);

  if (email) {
    return (
      <div className="mt-6">
        <EmailSignIn
          tone={lightTone}
          cancelLabel="Back"
          onCancel={() => setEmail(false)}
        />

        <Legal />
      </div>
    );
  }

  return (
    <>
      <p className="mt-4 max-w-[46ch] text-base text-muted">
        Your eSIM and receipts live in your nowsim account. Sign in, or create
        one as you go. Either takes a tap.
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {authProviders.map((provider) => (
          <li key={provider.id}>
            <Pressable
              onClick={provider.ready ? () => setEmail(true) : undefined}
              disabled={!provider.ready}
              className={cn(providerButton, tones[provider.id])}
            >
              <provider.Icon aria-hidden className="h-5 w-5 shrink-0" />
              {provider.label}
            </Pressable>
          </li>
        ))}
      </ul>

      <Legal />
    </>
  );
}

export function AccountStep({ account }: { account: Account | null }) {
  return (
    <Step index={1} title="Your account">
      {account ? <SignedIn account={account} /> : <SignedOut />}
    </Step>
  );
}
