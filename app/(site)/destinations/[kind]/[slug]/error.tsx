"use client";

import {
  RouteMessage,
  routeMessageAction,
  routeMessageActionQuiet,
} from "@/components/common/RouteMessage";
import { useReportError } from "@/components/common/useReportError";
import { Pressable } from "@/components/ui/Pressable";

export default function DestinationError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useReportError(error, "destination");

  return (
    <RouteMessage
      className="pt-header"
      title="We couldn't load this destination"
      body="The plans for this destination didn't come back this time. Try again, or pick another destination."
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
