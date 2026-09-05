"use client";

import {
  RouteMessage,
  routeMessageAction,
  routeMessageActionQuiet,
} from "@/components/common/RouteMessage";
import { useReportError } from "@/components/common/useReportError";
import { Pressable } from "@/components/ui/Pressable";

export default function SiteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useReportError(error, "site");

  return (
    <RouteMessage
      className="pt-header"
      title="We lost the signal"
      body="An unexpected error stopped this page from loading. Try again. If it keeps happening, come back in a moment."
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
