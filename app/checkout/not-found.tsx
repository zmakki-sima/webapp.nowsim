import type { Metadata } from "next";

import {
  RouteMessage,
  routeMessageAction,
  routeMessageActionQuiet,
  routeMessageBleedHeader,
} from "@/components/common/RouteMessage";
import { Pressable } from "@/components/ui/Pressable";

export const metadata: Metadata = {
  title: "Order not found - nowsim",
  robots: { index: false, follow: false },
};

export default function CheckoutNotFound() {
  return (
    <RouteMessage
      className={routeMessageBleedHeader}
      title="We couldn't find that order"
      body="The plan, destination or quantity in this link isn't one we can sell. Pick a plan again and we'll take you straight back to checkout."
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
