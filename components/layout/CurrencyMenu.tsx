"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { MdCheck, MdExpandMore } from "react-icons/md";

import { setCurrency, useCurrency } from "@/components/layout/CurrencyStore";
import { Pressable } from "@/components/ui/Pressable";
import { currencies, currencyCodes, type Currency } from "@/lib/money";
import { cn } from "@/lib/cn";

const trigger = cn(
  "gap-1.5 rounded-full px-3 py-2 md:px-3.5 md:py-2.5",
  "text-base font-medium",
  "bg-brand/6 hover:bg-brand/12 active:bg-brand/12",
);

const option = cn(
  "w-full justify-start gap-3 rounded-control px-3 py-2.5",
  "text-left text-base",
  "hover:bg-brand/8 active:bg-brand/12",
);

/**
 * The flags are square rather than the usual 3:2 so that the circular crop
 * takes the middle of the design instead of shaving the hoist off, which is
 * where Bahrain's serration and the UAE's red bar live.
 */
function Flag({ currency, className }: { currency: Currency; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full",
        "ring-1 ring-inset ring-ink/10",
        className,
      )}
    >
      <Image
        src={`/images/flags/${currency.toLowerCase()}.svg`}
        alt=""
        fill
        sizes="24px"
        // As everywhere else in the app: `dangerouslyAllowSVG` is off, so the
        // optimizer refuses an SVG source and the image has to be served as-is.
        unoptimized
        className="object-cover"
      />
    </span>
  );
}

export function CurrencyMenu() {
  const active = useCurrency();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setOpen(false);
      button.current?.focus();
    }

    // Pointer, not click: a press that starts outside should dismiss even if it
    // is released over the panel that is on its way out.
    function onPointerDown(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function choose(currency: Currency) {
    setCurrency(currency);
    setOpen(false);
    button.current?.focus();
  }

  return (
    <div ref={root} className="relative">
      <Pressable
        ref={button}
        hit
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={trigger}
      >
        <Flag currency={active} className="h-5 w-5" />
        <span className="font-semibold">{active}</span>
        <MdExpandMore
          aria-hidden
          className={cn(
            "h-4 w-4 text-muted",
            "transition-transform duration-200 ease-hover motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
        <span className="sr-only">
          Currency: {currencies[active].label}. Change currency
        </span>
      </Pressable>

      <div
        id={panelId}
        role="menu"
        aria-label="Currency"
        inert={!open}
        className={cn(
          "absolute right-0 top-full z-[58] mt-2 w-40 p-2",
          "rounded-card text-ink",
          "border border-white/60 bg-white/90 backdrop-blur-xl backdrop-saturate-150",
          "shadow-lg shadow-ink/10",
          "origin-top-right transition-[transform,opacity,visibility]",
          "[transition-duration:200ms,150ms,200ms]",
          open
            ? "visible scale-100 opacity-100 ease-pop"
            : "invisible scale-95 opacity-0 ease-ios",
          "motion-reduce:scale-100",
        )}
      >
        <ul className="flex flex-col gap-0.5">
          {currencyCodes.map((code) => (
            <li key={code}>
              <Pressable
                role="menuitemradio"
                aria-checked={code === active}
                onClick={() => choose(code)}
                className={cn(option, code === active && "bg-brand/8")}
              >
                <Flag currency={code} className="h-6 w-6" />
                <span className="min-w-0 flex-1 font-semibold">{code}</span>

                {code === active ? (
                  <MdCheck aria-hidden className="h-5 w-5 shrink-0 text-brand" />
                ) : null}
              </Pressable>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
