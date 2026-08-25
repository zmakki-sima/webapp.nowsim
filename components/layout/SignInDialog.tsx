"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { EmailSignIn, lightTone } from "@/components/auth/EmailSignIn";
import { Dialog } from "@/components/ui/Dialog";
import { Pressable } from "@/components/ui/Pressable";
import { authProviders, legalLinks } from "@/lib/auth/providers";
import { cn } from "@/lib/cn";

const providers = authProviders;

const tone = cn(
  "border border-hairline text-ink",
  "hover:border-brand/35 hover:bg-brand/6 active:bg-brand/10",
);

function Legal() {
  return (
    <p className="mt-6 text-center text-xs leading-relaxed text-muted">
      By clicking &ldquo;Continue&rdquo;, you agree to our{" "}
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

export function SignInDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(false);
  const [seenOpen, setSeenOpen] = useState(open);

  if (seenOpen !== open) {
    setSeenOpen(open);
    if (open) setEmail(false);
  }

  const done = useCallback(() => {
    onClose();
    router.push("/esims");
  }, [onClose, router]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={email ? "Sign in with email" : "Sign in to continue"}
    >
      {email ? (
        <div className="mt-6">
          <EmailSignIn
            tone={lightTone}
            onCancel={onClose}
            onSignedIn={done}
          />

          <Legal />
        </div>
      ) : (
        <>
          <ul className="mt-6 flex flex-col gap-3">
            {providers.map((provider) => (
              <li key={provider.id}>
                <Pressable
                  onClick={provider.ready ? () => setEmail(true) : undefined}
                  disabled={!provider.ready}
                  className={cn(
                    "w-full gap-3 rounded-full px-5 py-3.5",
                    "text-base font-bold tracking-[-0.01em]",
                    tone,
                  )}
                >
                  <provider.Icon aria-hidden className="h-5 w-5 shrink-0" />
                  {provider.label}
                </Pressable>
              </li>
            ))}
          </ul>

          <Legal />
        </>
      )}
    </Dialog>
  );
}
