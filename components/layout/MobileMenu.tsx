"use client";

import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

type NavLink = {
  label: string;
  href: string;
};

const belowBar =
  "top-[calc(var(--header-height)+env(safe-area-inset-top))]";

function ToggleIcon({ open }: { open: boolean }) {
  const line = cn(
    "absolute left-0 h-0.5 w-full rounded-full bg-current",
    "transition-transform duration-300 ease-ios motion-reduce:transition-none",
  );

  return (
    <span aria-hidden className="relative block h-4 w-5">
      <span className={cn(line, "top-0.5", open && "translate-y-1.5 rotate-45")} />
      <span
        className={cn(line, "bottom-0.5", open && "-translate-y-1.5 -rotate-45")}
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
    <Pressable
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
      hit
      className="-m-2 rounded-full p-2 hover:bg-brand/6 active:bg-brand/10 lg:hidden"
    >
      <ToggleIcon open={open} />
      <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
    </Pressable>
  );
}

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
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[56] cursor-default lg:hidden",
          belowBar,
          open ? "visible" : "invisible",
        )}
      />

      <div
        id={panelId}
        inert={!open}
        className={cn(
          "fixed inset-x-0 z-[57] px-3 pb-3 lg:hidden",
          belowBar,
          "transition-[transform,opacity,visibility]",
          "[transition-duration:300ms,150ms,300ms]",
          open
            ? "visible translate-y-0 opacity-100 ease-pop"
            : "invisible -translate-y-3 opacity-0 ease-ios",
          "motion-reduce:translate-y-0",
        )}
      >
        <div
          className={cn(
            "rounded-sheet p-2 text-ink",
            // In landscape the panel starts 72px down a 390px-tall viewport,
            // so the list has to be allowed to scroll rather than run off the
            // bottom of the screen.
            "max-h-[calc(100dvh-var(--header-height)-env(safe-area-inset-top)-1.5rem)]",
            "overflow-y-auto overscroll-contain scroll-slim",
            "border border-white/60 bg-white/85 backdrop-blur-xl backdrop-saturate-150",
            "shadow-lg shadow-ink/10",
          )}
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.label}>
                <Pressable
                  href={link.href}
                  onClick={onClose}
                  className="w-full justify-start rounded-full px-5 py-3 text-base hover:bg-brand/6 active:bg-brand/10"
                >
                  {link.label}
                </Pressable>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
