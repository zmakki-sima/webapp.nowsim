"use client";

import { useSyncExternalStore } from "react";
import { MdInfoOutline } from "react-icons/md";

const ACTIVATION_WINDOW_DAYS = 30;

const subscribe = () => () => {};

function deadlineFromToday() {
  const date = new Date();
  date.setDate(date.getDate() + ACTIVATION_WINDOW_DAYS);

  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function ActivationNote() {
  const onClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const deadline = onClient ? deadlineFromToday() : null;

  return (
    <div className="mt-8 flex items-center gap-4 rounded-card bg-surface-soft px-5 py-5">
      <MdInfoOutline aria-hidden className="h-5 w-5 shrink-0 text-ink/40" />

      <div className="text-sm text-muted">
        <p className="font-bold text-ink">Can I activate my plan later?</p>

        <p className="mt-1">
          Every plan has a {ACTIVATION_WINDOW_DAYS}-day activation window.
          {deadline
            ? ` Leave it untouched and it activates itself on ${deadline}.`
            : " Leave it untouched and it activates itself at the end of it."}
        </p>
      </div>
    </div>
  );
}
