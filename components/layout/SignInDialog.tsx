"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { EmailSignIn, lightTone } from "@/components/auth/EmailSignIn";
import { Dialog } from "@/components/ui/Dialog";
import { Pressable } from "@/components/ui/Pressable";
import { legalLinks } from "@/lib/auth/providers";
import { cn } from "@/lib/cn";
import { MdOutlineMail } from "react-icons/md";

const tone = lightTone.primary;

// Spacing is left to the caller: the sign-in button needs a full gap above
// this, while inside the email form it rides the form's own `gap-3`.
function Legal({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-center text-xs leading-relaxed text-muted",
        className,
      )}
    >
      {/*
        Broken deliberately after &ldquo;to&rdquo; so the sentence does not wrap
        mid-phrase: &ldquo;our&rdquo; stays on the second line with the two
        policy links it introduces.
      */}
      <span className="block">By clicking &ldquo;Continue&rdquo;, you agree to</span>
      our{" "}
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
        /* Same clearance under the title the eSIM dialog uses, so the gap does
           not change as the dialog moves between its steps. */
        <div className="mt-8">
          {/*
            No `onCancel`: the dialog's own close button already dismisses it,
            so a Cancel button underneath would be a second control for the
            same thing. Checkout still passes one, relabelled &ldquo;Back&rdquo;.
          */}
          {/*
            `<Legal />` goes to `EmailSignIn` rather than sitting here, so it
            follows the &ldquo;Continue&rdquo; button it describes and drops
            away on the code step, where that click has already happened.
          */}
          <EmailSignIn
            tone={lightTone}
            legal={<Legal className="mt-1" />}
            onSignedIn={done}
          />
        </div>
      ) : (
        <>
          <div className="mt-8">
            <Pressable
              onClick={() => setEmail(true)}
              className={cn(
                "w-full gap-3 rounded-full px-5 py-3.5",
                "text-base font-bold tracking-[-0.01em]",
                tone,
              )}
            >
              <MdOutlineMail aria-hidden className="h-5 w-5 shrink-0" />
              Continue with Email
            </Pressable>
          </div>

          <Legal className="mt-6" />
        </>
      )}
    </Dialog>
  );
}
