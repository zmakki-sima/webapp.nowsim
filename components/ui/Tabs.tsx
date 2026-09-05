"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

/*
 * The strip is a single unwrapped row, so on a narrow screen its intrinsic
 * width can exceed the viewport. Left to itself that widens the document and
 * drags every `fixed` element (the header, the menu overlay) out with it, so
 * the whole page scrolls sideways. `max-w-full` + `overflow-x-auto` keeps the
 * row inside its column and lets the tabs scroll on their own instead.
 *
 * `flex` rather than `inline-flex`: an inline-flex box is sized from its
 * content and would ignore the cap. `w-fit` restores the hug once there is
 * room, so the pill border still wraps the tabs on desktop.
 */
const list = cn(
  "relative flex w-fit max-w-full items-center gap-1 rounded-full p-1",
  "overflow-x-auto overscroll-x-contain scroll-none",
  "border border-hairline bg-surface",
);

/*
 * The scrollbar is hidden, so an overflowing strip looked like a row that
 * simply ran out of tabs — on a 320px phone "Global" was sliced in half with
 * nothing to say the rest could be reached. Fading whichever edge still has
 * tabs behind it restores the cue. Driven from scroll position rather than a
 * `mask-image` on a timeline, which Safari does not yet animate.
 */
const edgeFade =
  "[mask-image:linear-gradient(to_right,transparent,#000_1.25rem,#000_calc(100%-1.25rem),transparent)]";

const fadeStart =
  "[mask-image:linear-gradient(to_right,transparent,#000_1.25rem)]";

const fadeEnd =
  "[mask-image:linear-gradient(to_right,#000_calc(100%-1.25rem),transparent)]";

const tab = cn(
  "shrink-0 gap-2 rounded-full px-5 py-2.5 text-base font-semibold",
  "md:px-6 md:py-3",
);

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

  const listRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const measure = useCallback(() => {
    const node = listRef.current;
    if (!node) return;

    const max = node.scrollWidth - node.clientWidth;

    setEdges({
      start: node.scrollLeft > 1,
      // A sub-pixel remainder is normal at the far end; 1px of slack keeps the
      // fade from hanging around once the strip is scrolled out.
      end: max > 1 && node.scrollLeft < max - 1,
    });
  }, []);

  // A selected tab that starts out beyond the end of the strip — "Global"
  // arrived at from `?kind=global` — should be the one on screen, not the one
  // off it.
  //
  // The strip is nudged by hand rather than with `scrollIntoView`: that call
  // walks *every* scrollable ancestor up to the document, so on mount it
  // scrolled the whole page down to wherever the tablist sat. On the home page
  // that dropped the visitor past the hero before they had seen it.
  useEffect(() => {
    const node = listRef.current;
    const target = tabRefs.current[value];
    if (!node || !target) return;

    const strip = node.getBoundingClientRect();
    const selected = target.getBoundingClientRect();

    // The same "nearest" rule: move only far enough to uncover the tab.
    const delta =
      selected.left < strip.left
        ? selected.left - strip.left
        : selected.right > strip.right
          ? selected.right - strip.right
          : 0;

    if (delta) node.scrollBy({ left: delta });
  }, [value]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);

    node.addEventListener("scroll", measure, { passive: true });

    return () => {
      observer.disconnect();
      node.removeEventListener("scroll", measure);
    };
  }, [measure, items]);

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
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        list,
        fill && "w-full",
        edges.start && edges.end && edgeFade,
        edges.start && !edges.end && fadeStart,
        !edges.start && edges.end && fadeEnd,
        className,
      )}
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
              // Filled tabs share the row, so they must be allowed to shrink.
              fill && "min-w-0 flex-1 shrink",
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
