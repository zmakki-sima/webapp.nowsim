"use client";

import {
  RouteMessage,
  routeMessageAction,
  routeMessageActionQuiet,
} from "@/components/common/RouteMessage";
import { Pressable } from "@/components/ui/Pressable";

export default function DestinationError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <RouteMessage
      className="pt-40 md:pt-48"
      eyebrow="Something broke"
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
