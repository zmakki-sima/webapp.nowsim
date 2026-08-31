"use client";

import {
  RouteMessage,
  routeMessageAction,
  routeMessageActionQuiet,
} from "@/components/common/RouteMessage";
import { useReportError } from "@/components/common/useReportError";
import { Pressable } from "@/components/ui/Pressable";

export default function CheckoutError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useReportError(error, "checkout");

  return (
    <RouteMessage
      eyebrow="Something broke"
      title="We couldn't load your order"
      body="Nothing has been charged. Try again, or go back and pick your plan once more."
    >
      <Pressable onClick={() => unstable_retry()} className={routeMessageAction}>
        Try again
      </Pressable>

      <Pressable href="/destinations" className={routeMessageActionQuiet}>
        All destinations
      </Pressable>
    </RouteMessage>
  );
}
