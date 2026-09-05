"use client";

import {
  RouteMessage,
  routeMessageAction,
  routeMessageActionQuiet,
} from "@/components/common/RouteMessage";
import { useReportError } from "@/components/common/useReportError";
import { Pressable } from "@/components/ui/Pressable";

export default function DestinationsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useReportError(error, "destinations");

  return (
    <RouteMessage
      className="pt-header"
      title="We couldn't load the destinations"
      body="The catalog didn't come back this time. Try again. Your plans are still there."
    >
      <Pressable onClick={() => unstable_retry()} className={routeMessageAction}>
        Try again
      </Pressable>

      <Pressable href="/" className={routeMessageActionQuiet}>
        Back to home
      </Pressable>
    </RouteMessage>
  );
}
