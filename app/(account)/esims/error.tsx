"use client";

import {
  RouteMessage,
  routeMessageAction,
  routeMessageActionQuiet,
} from "@/components/common/RouteMessage";
import { useReportError } from "@/components/common/useReportError";
import { Pressable } from "@/components/ui/Pressable";

export default function EsimsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useReportError(error, "esims");

  return (
    <RouteMessage
      className="pt-header"
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
