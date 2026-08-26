import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  MdCheckCircle,
  MdErrorOutline,
  MdHourglassTop,
  MdReplay,
} from "react-icons/md";

import { OrderWatch } from "@/components/sections/checkout/OrderWatch";
import { Outcome } from "@/components/sections/checkout/Outcome";
import { verifySession } from "@/lib/auth/dal";
import { getOrder, type OrderStatus } from "@/lib/payments/orders";

export const metadata: Metadata = {
  title: "Order | nowsim",
  description: "Your nowsim order.",
  robots: { index: false, follow: false },
};

type View = {
  Icon: typeof MdCheckCircle;
  tone: string;
  title: string;
  body: (email: string) => string;
};

/**
 * Wording per state. The page reports what the order record says and grants
 * nothing — a customer can reach this URL by typing it, by refreshing, or by
 * closing the tab before Stripe finished, so it is never proof of payment.
 */
const views: Record<OrderStatus, View> = {
  pending: {
    Icon: MdHourglassTop,
    tone: "text-brand",
    title: "Confirming your payment",
    body: () =>
      "Your bank is still confirming this one. Stay on this page — we will email your eSIM the second it clears.",
  },
  paid: {
    Icon: MdCheckCircle,
    tone: "text-success",
    title: "Thank you for your purchase!",
    body: (email) =>
      `We are issuing your eSIM now. Your receipt and installation instructions are on their way to ${email}.`,
  },
  fulfilled: {
    Icon: MdCheckCircle,
    tone: "text-success",
    title: "Thank you for your purchase!",
    body: (email) =>
      `We have sent your receipt and installation instructions to ${email}.`,
  },
  failed: {
    Icon: MdErrorOutline,
    tone: "text-danger",
    title: "We could not issue your eSIM",
    body: () =>
      "Your payment went through but the eSIM did not. We have been alerted and will either deliver it or refund you in full. No action needed from you.",
  },
  refunded: {
    Icon: MdReplay,
    tone: "text-muted",
    title: "This order was refunded",
    body: () =>
      "The money is on its way back to your card. Banks usually take five to ten days to show it.",
  },
};

export default async function CheckoutSuccessPage({
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

  const view = views[order.status];

  return (
    <>
      <OrderWatch id={order.id} status={order.status} />

      <Outcome
        Icon={view.Icon}
        tone={view.tone}
        title={view.title}
        body={view.body(order.email)}
        action={{ href: "/esims", label: "Continue" }}
      />
    </>
  );
}
