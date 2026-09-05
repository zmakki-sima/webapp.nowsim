"use client";

import { useEffect, useId, useState, useTransition } from "react";
import {
  FaCcAmex,
  FaCcApplePay,
  FaCcMastercard,
  FaCcVisa,
} from "react-icons/fa6";
import { MdLock } from "react-icons/md";

import {
  listInstallTargets,
  startCheckout,
  type InstallTarget,
} from "@/app/actions/checkout";
import { usePrice } from "@/components/common/Price";
import { useCurrency } from "@/components/layout/CurrencyStore";
import { InstallChoiceDialog } from "@/components/sections/checkout/InstallChoiceDialog";
import { Step } from "@/components/sections/checkout/Step";
import { Pressable } from "@/components/ui/Pressable";
import type { InstallChoice, OrderParams } from "@/lib/checkout";
import type { Money } from "@/lib/money";
import { cn } from "@/lib/cn";

const cards = [
  { label: "Visa", Icon: FaCcVisa },
  { label: "Mastercard", Icon: FaCcMastercard },
  { label: "American Express", Icon: FaCcAmex },
  { label: "Apple Pay", Icon: FaCcApplePay },
];

/** `list: null` records that the lookup failed, not that the account is empty. */
type Loaded = { owner: string; list: InstallTarget[] | null };

type Picked = { owner: string; choice: InstallChoice };

export function PaymentStep({
  unitPrice,
  quantity,
  params,
  accountId,
}: {
  unitPrice: Money;
  quantity: number;
  params: OrderParams;
  accountId: string | null;
}) {
  const hintId = useId();
  const currency = useCurrency();
  const total = usePrice(unitPrice, quantity);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leaving, startLeaving] = useTransition();

  const locked = accountId === null;

  /**
   * Only one plan can replace the one on an existing eSIM, so a multi-eSIM
   * order has nothing to choose and skips the dialog entirely.
   */
  const choosable = !locked && quantity === 1;

  // Both are stamped with the account they belong to and read back through that
  // stamp, so signing out — or in as somebody else — cannot surface the
  // previous customer's eSIMs while the new list is still in flight.
  const mine = loaded?.owner === accountId ? loaded.list : [];
  const targets = mine ?? [];

  /** The account may well own eSIMs; we could not find out. */
  const unknown = mine === null;

  /**
   * The lookup has not answered for this account yet. Distinct from an answer of
   * "none": both leave `targets` empty, and paying on the strength of that would
   * skip the dialog for an account that does own eSIMs.
   */
  const pending = choosable && loaded?.owner !== accountId;

  const choice = picked?.owner === accountId ? picked.choice : null;

  useEffect(() => {
    if (accountId === null || quantity !== 1) return;

    let live = true;

    listInstallTargets()
      .then((list) => live && setLoaded({ owner: accountId, list }))
      .catch(() => live && setLoaded({ owner: accountId, list: null }));

    return () => {
      live = false;
    };
  }, [accountId, quantity]);

  function go(install: InstallChoice) {
    setError(null);

    startLeaving(async () => {
      // Only the code travels. The server converts the euro price itself, so a
      // tampered currency can change which currency is charged, never how much.
      const result = await startCheckout({ ...params, install, currency });

      if (!result.ok) {
        setError(result.error);

        return;
      }

      // A full navigation, not a router push: the destination is Stripe's site.
      window.location.assign(result.url);
    });
  }

  function pay() {
    // Still waiting on the eSIM list: an empty `targets` here means "not yet",
    // not "none", so there is nothing to decide from.
    if (pending) return;

    // A failed lookup still opens the dialog, which says so, rather than
    // quietly deciding on the customer's behalf that a new eSIM is the only way.
    if ((targets.length > 0 || unknown) && !choice) {
      setChoosing(true);

      return;
    }

    go(choice ?? { kind: "new" });
  }

  function choose(made: InstallChoice) {
    if (accountId !== null) setPicked({ owner: accountId, choice: made });

    setChoosing(false);
    go(made);
  }

  return (
    <Step index={2} title="Payment">
      <p className="mt-4 max-w-[46ch] text-base text-muted">
        Card details are entered on Stripe&rsquo;s secure page. nowsim never
        sees or stores your card number.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 rounded-card border border-hairline bg-surface-soft p-4 sm:justify-between">
        <p className="flex items-center justify-center gap-2.5 text-sm font-bold">
          <MdLock aria-hidden className="h-4 w-4 text-success" />
          Secure payment powered by Stripe
        </p>

        <ul className="flex items-center justify-center gap-2">
          {cards.map((card) => (
            <li key={card.label}>
              <card.Icon aria-hidden className="h-6 w-6 text-ink/45" />
              <span className="sr-only">{card.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <Pressable
        onClick={pay}
        disabled={locked || leaving || pending}
        aria-haspopup={targets.length > 0 || unknown ? "dialog" : undefined}
        aria-expanded={targets.length > 0 || unknown ? choosing : undefined}
        aria-describedby={locked ? hintId : undefined}
        className={cn(
          "mt-6 w-full rounded-full bg-brand px-8 py-4",
          "text-base font-bold text-white",
          "hover:bg-brand-soft active:bg-brand-soft",
        )}
      >
        {leaving ? "Taking you to Stripe…" : `Pay ${total}`}
      </Pressable>

      {error ? (
        <p role="alert" className="mt-3 text-center text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      {locked ? (
        <p id={hintId} className="mt-3 text-center text-sm text-muted">
          Sign in above to complete your order.
        </p>
      ) : (
        <p className="mt-3 text-center text-sm text-muted">
          You&rsquo;ll be charged {total} once. No subscription, no auto-renew.
        </p>
      )}

      {choosable && (
        <InstallChoiceDialog
          open={choosing}
          onClose={() => setChoosing(false)}
          targets={targets}
          unknown={unknown}
          choice={choice}
          onChoose={choose}
        />
      )}
    </Step>
  );
}