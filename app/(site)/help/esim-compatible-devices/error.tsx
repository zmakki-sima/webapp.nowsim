"use client";

import {
  RouteMessage,
  routeMessageAction,
  routeMessageActionQuiet,
} from "@/components/common/RouteMessage";
import { Pressable } from "@/components/ui/Pressable";

export default function CompatibleDevicesError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <RouteMessage
      className="pt-40 md:pt-48"
      eyebrow="Something broke"
      title="We couldn't load the device list"
      body="The list didn't come back this time. Try again. Most phones made since 2018 support eSIM."
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
  );
}
