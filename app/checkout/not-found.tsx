import type { Metadata } from "next";

import {
  RouteMessage,
  routeMessageAction,
  routeMessageActionQuiet,
} from "@/components/common/RouteMessage";
import { Pressable } from "@/components/ui/Pressable";

export const metadata: Metadata = {
  title: "Order not found - nowsim",
  robots: { index: false, follow: false },
};

export default function CheckoutNotFound() {
  return (
    <RouteMessage
      eyebrow="404"
      title="We couldn't find that order"
      body="The plan or destination in this link no longer exists. Pick a plan again and we'll take you straight back to checkout."
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
