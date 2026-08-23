import type { Metadata } from "next";

import {
  RouteMessage,
  routeMessageAction,
  routeMessageActionQuiet,
} from "@/components/common/RouteMessage";
import { Pressable } from "@/components/ui/Pressable";

export const metadata: Metadata = {
  title: "Destination not found | nowsim",
};

export default function DestinationNotFound() {
  return (
    <RouteMessage
      className="pt-40 md:pt-48"
      eyebrow="404"
      title="We don't cover that one yet"
      body="This destination isn't in the catalog. Browse everywhere we do cover. There are over 200 to choose from."
    >
      <Pressable href="/destinations" className={routeMessageAction}>
        All destinations
      </Pressable>

      <Pressable href="/" className={routeMessageActionQuiet}>
        Back to home
      </Pressable>
    </RouteMessage>
  );
}
