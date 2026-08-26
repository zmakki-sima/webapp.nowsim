"use client";

import { Suspense } from "react";

import { AccountStep } from "@/components/sections/checkout/AccountStep";
import { PaymentStep } from "@/components/sections/checkout/PaymentStep";
import { useAccount } from "@/components/layout/SessionProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import { Step } from "@/components/sections/checkout/Step";
import type { OrderParams } from "@/lib/checkout";
import type { Money } from "@/lib/money";

type Props = {
  /** In euros. The display currency is applied in the browser. */
  unitPrice: Money;
  quantity: number;
  params: OrderParams;
};

/**
 * Identifies the exact thing being bought. Changing plan, destination or
 * quantity keeps the customer on `/checkout`, so React would otherwise reuse the
 * payment step and carry the old order's state into the new one — including
 * which eSIM the install dialog was told to write to. Keying on the order makes
 * every distinct order a fresh step.
 */
const orderKey = ({ kind, destination, plan, qty }: OrderParams) =>
  `${kind}/${destination}/${plan}/${qty}`;

function Flow(props: Props) {
  const account = useAccount();

  return (
    <>
      <AccountStep account={account} />
      <PaymentStep
        key={orderKey(props.params)}
        {...props}
        accountId={account?.userId ?? null}
      />
    </>
  );
}

function Pending(props: Props) {
  return (
    <>
      <Step index={1} title="Your account">
        <div className="mt-6 flex flex-col gap-3">
          <Skeleton className="h-14 w-full rounded-full" />
          <Skeleton className="h-14 w-full rounded-full" />
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </Step>

      <PaymentStep key={orderKey(props.params)} {...props} accountId={null} />
    </>
  );
}

export function CheckoutFlow(props: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<Pending {...props} />}>
        <Flow {...props} />
      </Suspense>
    </div>
  );
}