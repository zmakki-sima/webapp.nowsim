"use client";

import {
  RouteMessage,
  routeMessageAction,
  routeMessageActionQuiet,
} from "@/components/common/RouteMessage";
import { Pressable } from "@/components/ui/Pressable";

export default function RootError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main className="flex-1">
      <RouteMessage
        eyebrow="Something broke"
        title="We lost the signal"
        body="An unexpected error stopped this page from loading. Try again. If it keeps happening, come back in a moment."
      >
        <Pressable
          onClick={() => unstable_retry()}
          className={routeMessageAction}
        >
          Try again
        </Pressable>

        <Pressable href="/" className={routeMessageActionQuiet}>
          Back to home
        </Pressable>
      </RouteMessage>
    </main>
  );
}
