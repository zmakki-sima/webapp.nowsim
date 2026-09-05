"use client";

import {
  RouteMessage,
  routeMessageAction,
} from "@/components/common/RouteMessage";
import { useReportError } from "@/components/common/useReportError";
import { Pressable } from "@/components/ui/Pressable";

/**
 * Almost nothing reaches this boundary. Every page sits under `(site)`,
 * `(account)` or `checkout`, and the first two groups plus checkout each catch
 * their own errors first. What is left is the narrow gap `error.tsx` cannot
 * cover for itself: a layout that fails with no error boundary in its own
 * segment — today that means `(account)/layout.tsx`, since the account group
 * has no `error.tsx` of its own.
 *
 * So this renders its own `<main>`: whatever broke, the layout that would
 * normally supply one is exactly the thing that didn't render. And it offers no
 * "try again" — the retry would re-render the same failing layout. Home is a
 * different layout, which is the only move that can actually work.
 */
export default function RootError({
  error,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useReportError(error, "root");

  return (
    <main className="flex flex-1 flex-col">
      <RouteMessage
        title="We lost the signal"
        body="An unexpected error stopped this page from loading. Head back home and try from there."
      >
        <Pressable href="/" className={routeMessageAction}>
          Back to home
        </Pressable>
      </RouteMessage>
    </main>
  );
}
