"use client";

import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

type NavLink = {
  label: string;
  href: string;
};

function ToggleIcon({ open }: { open: boolean }) {
  const line = cn(
    "absolute left-0 h-0.5 w-full rounded-full bg-current",
    "transition-transform duration-300 ease-ios motion-reduce:transition-none",
  );

  /* 3px in from each end of a 16px box puts the bars 8px apart, so 4px of
     travel each lands both strokes on the centre line — an X that crosses at a
     point rather than one that overshoots it. */
  return (
    <span aria-hidden className="relative block h-4 w-5">
      <span className={cn(line, "top-[3px]", open && "translate-y-1 rotate-45")} />
      <span
        className={cn(line, "bottom-[3px]", open && "-translate-y-1 -rotate-45")}
      />
    </span>
  );
}

export function MenuToggle({
  open,
  onToggle,
  panelId,
}: {
  open: boolean;
  onToggle: () => void;
  panelId: string;
}) {
  return (
    /* Same 40px circle as the account button beside it. `-m-2 p-2` drew the
       hover ring outside the layout box, which ate 8px of the flex gap and left
       the two controls touching. `hit` already carries the 44px touch target. */
    <Pressable
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
      hit
      className={cn(
        "h-10 w-10 shrink-0 rounded-full",
        "hover:bg-brand/12 active:bg-brand/20",
        "lg:hidden",
      )}
    >
      <ToggleIcon open={open} />
      <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
    </Pressable>
  );
}

/**
 * A tap anywhere off the bar closes the menu.
 *
 * Must render as a sibling of the header, never inside it: the header opens a
 * stacking context at `z-50`, so a scrim nested in it would sit above the bar
 * whatever its own z-index, swallowing the toggle's hover and clicks.
 */
export function MenuScrim({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden
      onClick={onClose}
      className={cn(
        "fixed inset-0 z-40 cursor-default lg:hidden",
        open ? "visible" : "invisible",
      )}
    />
  );
}

/**
 * Renders inside the header, below its row, so the links share the bar's own
 * surface and border instead of floating over the page as a second sheet.
 *
 * The reveal is a `0fr` → `1fr` grid row: the list keeps its natural height, so
 * nothing has to guess a max-height that a fifth link would outgrow.
 */
export function MenuPanel({
  links,
  open,
  onClose,
  panelId,
}: {
  links: NavLink[];
  open: boolean;
  onClose: () => void;
  panelId: string;
}) {
  return (
    <>
      <div
        id={panelId}
        inert={!open}
        className={cn(
          "relative grid lg:hidden",
          "transition-[grid-template-rows,opacity] duration-300 ease-ios",
          "motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          {/* In landscape the row leaves ~318px of a 390px-tall viewport, so
              the list scrolls rather than running off the bottom. */}
          <nav
            aria-label="Menu"
            className={cn(
              "max-h-[calc(100dvh-var(--header-height)-env(safe-area-inset-top)-1rem)]",
              "overflow-y-auto overscroll-contain scroll-slim",
              "px-4 pb-3 sm:px-6 md:px-12",
            )}
          >
            <ul className="mx-auto flex max-w-7xl flex-col gap-0.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Pressable
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "w-full justify-start rounded-full px-4 py-3",
                      "text-base font-medium",
                      "hover:bg-brand/6 active:bg-brand/10",
                    )}
                  >
                    {link.label}
                  </Pressable>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
