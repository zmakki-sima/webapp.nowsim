"use client";

import { Suspense } from "react";

import { AccountStep } from "@/components/sections/checkout/AccountStep";
import { PaymentStep } from "@/components/sections/checkout/PaymentStep";
import { useAccount } from "@/components/layout/SessionProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import { Step } from "@/components/sections/checkout/Step";

function Flow({ total }: { total: string }) {
  const account = useAccount();

  return (
    <>
      <AccountStep account={account} />
      <PaymentStep total={total} locked={account === null} />
    </>
  );
}

function Pending({ total }: { total: string }) {
  return (
    <>
      <Step index={1} title="Your account">
        <div className="mt-6 flex flex-col gap-3">
          <Skeleton className="h-14 w-full rounded-full" />
          <Skeleton className="h-14 w-full rounded-full" />
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </Step>

      <PaymentStep total={total} locked />
    </>
  );
}

export function CheckoutFlow({ total }: { total: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<Pending total={total} />}>
        <Flow total={total} />
      </Suspense>
    </div>
  );
}
