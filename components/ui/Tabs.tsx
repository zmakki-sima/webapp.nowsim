"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

const list = cn(
  "inline-flex items-center gap-1 rounded-full p-1",
  "border border-hairline bg-surface",
);

const tab =
  "gap-2 rounded-full px-5 py-2.5 text-base font-semibold md:px-6 md:py-3";

const tabActive = "bg-brand/12 text-brand";

const tabIdle = "text-ink hover:bg-surface-soft";

export type TabItem<Id extends string> = {
  id: Id;
  label: ReactNode;
  badge?: string;
};

export function Tabs<Id extends string>({
  items,
  value,
  onChange,
  label,
  tabId,
  panelId,
  fill = false,
  className,
}: {
  items: readonly TabItem<Id>[];
  value: Id;
  onChange: (id: Id) => void;
  /** Names the tablist for screen readers. */
  label: string;
  tabId: (id: Id) => string;
  /** The panel each tab controls. Pass a function when every tab owns one. */
  panelId: string | ((id: Id) => string);
  /** Stretch the tabs to share the full width of the list. */
  fill?: boolean;
  className?: string;
}) {
  const tabRefs = useRef<Partial<Record<Id, HTMLButtonElement | null>>>({});

  const controls = (id: Id) =>
    typeof panelId === "string" ? panelId : panelId(id);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;

    event.preventDefault();

    const index = items.findIndex((item) => item.id === value);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : event.key === "ArrowLeft"
            ? (index - 1 + items.length) % items.length
            : (index + 1) % items.length;

    const target = items[next];

    onChange(target.id);
    tabRefs.current[target.id]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(list, fill && "flex w-full", className)}
    >
      {items.map((item) => {
        const selected = item.id === value;

        return (
          <Pressable
            key={item.id}
            ref={(node) => {
              tabRefs.current[item.id] = node;
            }}
            id={tabId(item.id)}
            role="tab"
            aria-selected={selected}
            aria-controls={controls(item.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={cn(
              tab,
              fill && "flex-1",
              selected ? tabActive : tabIdle,
            )}
          >
            {item.label}

            {item.badge ? (
              <span
                className={cn(
                  "rounded-full bg-brand px-2 py-1 text-white",
                  "text-[0.625rem] font-bold uppercase tracking-[0.08em]",
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </Pressable>
        );
      })}
    </div>
  );
}
