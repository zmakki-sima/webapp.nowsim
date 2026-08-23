"use client";

import {
  RouteMessage,
  routeMessageAction,
  routeMessageActionQuiet,
} from "@/components/common/RouteMessage";
import { Pressable } from "@/components/ui/Pressable";

export default function EsimsError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <RouteMessage
      className="pt-40 md:pt-48"
      eyebrow="Something broke"
      title="We couldn't load your eSIMs"
      body="Your eSIMs and their data are safe. This page just failed to fetch them. Try again."
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
