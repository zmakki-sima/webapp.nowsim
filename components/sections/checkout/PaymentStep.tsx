"use client";

import { useId } from "react";
import {
  FaCcAmex,
  FaCcApplePay,
  FaCcMastercard,
  FaCcVisa,
  FaStripe,
} from "react-icons/fa6";
import { MdLock } from "react-icons/md";

import { Step } from "@/components/sections/checkout/Step";
import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

const cards = [
  { label: "Visa", Icon: FaCcVisa },
  { label: "Mastercard", Icon: FaCcMastercard },
  { label: "American Express", Icon: FaCcAmex },
  { label: "Apple Pay", Icon: FaCcApplePay },
];

export function PaymentStep({
  total,
  locked,
}: {
  total: string;
  locked: boolean;
}) {
  const hintId = useId();

  return (
    <Step index={2} title="Payment">
      <p className="mt-4 max-w-[46ch] text-base text-muted">
        Card details are entered on Stripe&rsquo;s secure page. nowsim never
        sees or stores your card number.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-card border border-hairline bg-surface-soft p-4">
        <p className="flex items-center gap-2.5 text-sm font-bold">
          <MdLock aria-hidden className="h-4 w-4 text-success" />
          Secure payment powered by
          <FaStripe aria-hidden className="h-6 w-auto" />
          <span className="sr-only">Stripe</span>
        </p>

        <ul className="flex items-center gap-2">
          {cards.map((card) => (
            <li key={card.label}>
              <card.Icon aria-hidden className="h-6 w-6 text-ink/45" />
              <span className="sr-only">{card.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <Pressable
        disabled={locked}
        aria-describedby={locked ? hintId : undefined}
        className={cn(
          "mt-6 w-full rounded-full bg-brand px-8 py-4",
          "text-base font-bold text-white",
          "hover:bg-brand-soft active:bg-brand-soft",
        )}
      >
        Pay {total}
      </Pressable>

      {locked ? (
        <p id={hintId} className="mt-3 text-center text-sm text-muted">
          Sign in above to complete your order.
        </p>
      ) : (
        <p className="mt-3 text-center text-sm text-muted">
          You&rsquo;ll be charged {total} once. No subscription, no auto-renew.
        </p>
      )}
    </Step>
  );
}
