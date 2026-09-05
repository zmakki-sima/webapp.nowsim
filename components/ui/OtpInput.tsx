"use client";

import { useRef, useState, type FocusEvent } from "react";

import { cn } from "@/lib/cn";

/**
 * One transparent input laid over the boxes, rather than one input per digit.
 * The boxes are only a drawing of its value, so paste, iOS code autofill and
 * backspace all keep working the way they do in a plain text field — the
 * per-digit version has to re-implement each of them, usually badly.
 */
const slot = cn(
  "relative flex h-14 min-w-0 flex-1 items-center justify-center",
  "rounded-control border text-lg font-bold",
  "transition-[color,background-color,border-color,box-shadow]",
  "duration-300 ease-hover motion-reduce:transition-none",
);

function tone(error: boolean, active: boolean): string {
  if (error) {
    return active
      ? "border-danger bg-danger/5 text-ink ring-[3px] ring-danger/12"
      : "border-danger bg-danger/5 text-ink";
  }

  return active
    ? "border-brand bg-surface text-ink ring-[3px] ring-brand/10"
    : "border-hairline bg-surface text-ink";
}

export function OtpInput({
  value,
  onChange,
  name,
  length = 6,
  error = false,
  autoFocus = false,
  label = "Authorization code",
}: {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  length?: number;
  error?: boolean;
  autoFocus?: boolean;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  // The caret is never shown, so a click in the middle of the row would leave
  // typing to land somewhere invisible. Everything edits from the end instead.
  function toEnd() {
    const el = input.current;
    if (el) el.setSelectionRange(el.value.length, el.value.length);
  }

  const digits = Array.from({ length }, (_, index) => value[index] ?? "");
  const cursor = Math.min(value.length, length - 1);

  return (
    <div className="relative">
      <div aria-hidden className="flex gap-2">
        {digits.map((digit, index) => {
          const active = focused && index === cursor;

          return (
            <div
              key={index}
              /* One class per property, never two: `cn` only joins strings, so
                 a later `border-brand` does not beat an earlier
                 `border-hairline` — CSS order picks the winner instead. */
              className={cn(slot, tone(error, active))}
            >
              {digit ||
                (active ? (
                  <span
                    className={cn(
                      "h-6 w-px animate-caret-blink",
                      error ? "bg-ink/70" : "bg-brand",
                    )}
                  />
                ) : null)}
            </div>
          );
        })}
      </div>

      <input
        ref={input}
        name={name}
        autoFocus={autoFocus}
        required
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        aria-label={label}
        aria-invalid={error ? true : undefined}
        value={value}
        onChange={(event) =>
          onChange(event.target.value.replace(/\D/g, "").slice(0, length))
        }
        onFocus={(event: FocusEvent<HTMLInputElement>) => {
          setFocused(true);
          event.target.setSelectionRange(value.length, value.length);
        }}
        onBlur={() => setFocused(false)}
        onSelect={toEnd}
        onPointerUp={toEnd}
        className={cn(
          "absolute inset-0 h-full w-full opacity-0 outline-none",
          "text-transparent caret-transparent",
        )}
      />
    </div>
  );
}
