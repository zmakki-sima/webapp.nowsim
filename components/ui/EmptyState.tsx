import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * The "nothing here yet" panel. `brand` is for a list the customer can still
 * fill (eSIMs); `neutral` is for a record of what already happened (purchases),
 * where a brand tint would read as a call to action it cannot answer.
 */
const tones = {
  brand: { panel: "bg-surface-soft", badge: "bg-brand/12" },
  neutral: { panel: "bg-ink/5", badge: "bg-ink/8" },
} as const;

export function EmptyState({
  icon,
  title,
  description,
  tone = "brand",
}: {
  /** Already carries its own size and colour classes. */
  icon: ReactNode;
  title: string;
  description: string;
  tone?: keyof typeof tones;
}) {
  const skin = tones[tone];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-sheet",
        skin.panel,
        "px-6 py-24 text-center",
      )}
    >
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-card",
          skin.badge,
        )}
      >
        {icon}
      </span>

      <h2 className="mt-5 text-lg font-bold tracking-[-0.02em]">{title}</h2>

      <p className="mt-1 text-base text-muted">{description}</p>
    </div>
  );
}
