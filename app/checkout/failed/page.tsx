import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MdOutlineCancel } from "react-icons/md";

import { Outcome } from "@/components/sections/checkout/Outcome";
import { verifySession } from "@/lib/auth/dal";
import { getOrder } from "@/lib/payments/orders";

export const metadata: Metadata = {
  title: "Payment not completed - nowsim",
  description: "Your nowsim order was not paid for.",
  robots: { index: false, follow: false },
};

/**
 * Where Stripe returns a customer who left the payment page. Nothing was
 * charged and the order is still pending, so the one thing to offer is the
 * checkout they came from, with the same plan and quantity still filled in.
 */
export default async function CheckoutFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await verifySession();

  if (!session) redirect("/");

  const raw = (await searchParams).order;
  const id = Array.isArray(raw) ? raw[0] : raw;
  const order = id ? await getOrder(id) : null;

  // Somebody else's order id is not found, not forbidden — it reveals nothing.
  if (!order || order.accountId !== session.yesimUserId) notFound();

  // A stale link to this page for an order that did get paid must not invite a
  // second payment. The success page is the truth for anything past pending.
  if (order.status !== "pending") redirect(`/checkout/success?order=${order.id}`);

  return (
    <Outcome
      Icon={MdOutlineCancel}
      tone="text-danger"
      title="Payment not completed"
      body={`Your ${order.destination} eSIM was not paid for, and your card was not charged. The order is still here.`}
      action={{
        href: order.back ? `/checkout?${order.back}` : "/destinations",
        label: "Continue",
      }}
    />
  );
}
