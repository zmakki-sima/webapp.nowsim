"use client";

import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { MdArrowBack, MdClose } from "react-icons/md";

import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

const focusable = cn(
  "a[href], button:not([disabled]), input:not([disabled]),",
  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
);

const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

export function Dialog({
  open,
  onClose,
  onBack,
  title,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  title: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const mounted = useSyncExternalStore(subscribe, onClient, onServer);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    panelRef.current?.querySelector<HTMLElement>(focusable)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const items = panelRef.current?.querySelectorAll<HTMLElement>(focusable);
      if (!items || items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (
        event.shiftKey &&
        (active === first || !panelRef.current?.contains(active))
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      inert={!open}
      className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center px-5",
        "transition-[visibility] duration-300",
        open ? "visible" : "invisible",
        "motion-reduce:transition-none",
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 cursor-default",
          "bg-ink/45 backdrop-blur-md backdrop-saturate-150",
          "transition-opacity duration-150 ease-out",
          open ? "opacity-100" : "opacity-0",
          "motion-reduce:transition-none",
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative w-full max-w-[27rem]",
          "transition-[transform,opacity] duration-300",
          open
            ? "scale-100 opacity-100 ease-pop"
            : "scale-95 opacity-0 ease-ios",
          "motion-reduce:scale-100 motion-reduce:transition-none",
          className,
        )}
      >
        <div
          className={cn(
            "relative flex max-h-[85dvh] flex-col rounded-sheet",
            "bg-ink p-7 text-white shadow-2xl shadow-ink/30 md:p-8",
          )}
        >
          <Pressable
            onClick={onBack ?? onClose}
            className={cn(
              "absolute right-4 top-4 h-9 w-9 rounded-full",
              "after:absolute after:left-1/2 after:top-1/2 after:content-['']",
              "after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2",
              "bg-white/10 text-white/70",
              "hover:bg-white/20 hover:text-white active:bg-white/20",
            )}
          >
            {onBack ? (
              <MdArrowBack aria-hidden className="h-5 w-5" />
            ) : (
              <MdClose aria-hidden className="h-5 w-5" />
            )}
            <span className="sr-only">{onBack ? "Back" : "Close"}</span>
          </Pressable>

          <h2 id={titleId} className="pr-12 text-h3 font-bold">
            {title}
          </h2>

          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
