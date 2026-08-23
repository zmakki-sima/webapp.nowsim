import type { Metadata } from "next";

import {
  RouteMessage,
  routeMessageAction,
  routeMessageActionQuiet,
} from "@/components/common/RouteMessage";
import { Pressable } from "@/components/ui/Pressable";

export const metadata: Metadata = {
  title: "Page not found | nowsim",
};

export default function NotFound() {
  return (
    <main className="flex-1">
      <RouteMessage
        eyebrow="404"
        title="This page went off-grid"
        body="The page you asked for doesn't exist. Check the address, or start from a destination."
      >
        <Pressable href="/" className={routeMessageAction}>
          Back to home
        </Pressable>

        <Pressable href="/destinations" className={routeMessageActionQuiet}>
          Browse destinations
        </Pressable>
      </RouteMessage>
    </main>
  );
}
