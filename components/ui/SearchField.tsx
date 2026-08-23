"use client";

import { useId, useRef } from "react";
import { MdClose, MdSearch } from "react-icons/md";

import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

/**
 * Two surfaces carry a search field: the pages, which are light, and the
 * dialogs, which sit on the dark sheet. Both share the shape and the focus
 * behaviour; only the palette and the density differ.
 */
const tones = {
  light: {
    icon: cn(
      "h-5 w-5 text-ink/40 transition-colors duration-300 ease-hover",
      "group-focus-within:text-brand motion-reduce:transition-none",
    ),
    iconSide: { left: "left-5", right: "right-5" },
    input: cn(
      "rounded-full border border-hairline bg-surface py-4",
      "text-base font-medium text-ink placeholder:text-ink/40",
      "transition-[border-color,box-shadow] duration-300 ease-hover",
      "hover:border-ink/25",
      "focus-visible:border-brand/55 focus-visible:outline-none",
      "focus-visible:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-brand)_14%,transparent)]",
    ),
    padIcon: { left: "pl-13", right: "pr-13" },
    padPlain: { left: "pl-6", right: "pr-5" },
    padClear: "pr-14",
    clear: "hover:bg-brand/8 hover:text-brand active:bg-brand/8",
    glow: true,
  },
  dark: {
    icon: cn(
      "h-4 w-4 text-white/45 transition-colors duration-300 ease-hover",
      "group-focus-within:text-volt motion-reduce:transition-none",
    ),
    iconSide: { left: "left-4", right: "right-4" },
    input: cn(
      "rounded-control bg-white/10 py-3.5",
      "text-base text-white placeholder:text-white/45",
      "outline-none transition-colors duration-300 ease-hover",
      "hover:bg-white/[0.14] focus:bg-white/[0.14]",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt",
    ),
    padIcon: { left: "pl-11", right: "pr-11" },
    padPlain: { left: "pl-4", right: "pr-4" },
    padClear: "pr-12",
    clear: "hover:bg-white/10 hover:text-volt active:bg-white/10",
    glow: false,
  },
} as const;

export function SearchField({
  value,
  onChange,
  label,
  placeholder,
  name = "q",
  clearable = false,
  tone = "light",
  iconSide = "left",
  className,
  inputClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Names the field for screen readers. Rendered as a visually hidden label. */
  label: string;
  placeholder: string;
  name?: string;
  /** Show a clear button once there is something to clear. */
  clearable?: boolean;
  /** Which surface the field sits on. */
  tone?: keyof typeof tones;
  iconSide?: "left" | "right";
  className?: string;
  inputClassName?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const skin = tones[tone];
  const clearing = clearable && value.length > 0;

  // The clear button takes the right edge, so the icon yields it the room.
  const padLeft =
    iconSide === "left" ? skin.padIcon.left : skin.padPlain.left;

  const padRight = clearing
    ? skin.padClear
    : iconSide === "right"
      ? skin.padIcon.right
      : skin.padPlain.right;

  return (
    <div className={cn("group relative min-w-0", className)}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>

      <MdSearch
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 z-10 -translate-y-1/2",
          skin.iconSide[iconSide],
          skin.icon,
        )}
      />

      {skin.glow ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-1 rounded-full bg-brand/15 blur-md",
            "scale-95 opacity-0 transition-[opacity,transform] duration-500 ease-hover",
            "group-focus-within:scale-100 group-focus-within:opacity-100",
            "motion-reduce:transition-none motion-reduce:scale-100",
          )}
        />
      ) : null}

      <input
        id={inputId}
        ref={inputRef}
        name={name}
        type="search"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "relative w-full",
          skin.input,
          padLeft,
          padRight,
          "[&::-webkit-search-cancel-button]:appearance-none",
          "motion-reduce:transition-none",
          inputClassName,
        )}
      />

      {clearing ? (
        <Pressable
          type="button"
          press={false}
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className={cn(
            "absolute right-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full text-muted",
            "transition-colors duration-300 ease-hover motion-reduce:transition-none",
            skin.clear,
          )}
        >
          <MdClose aria-hidden className="h-5 w-5" />
          <span className="sr-only">Clear search</span>
        </Pressable>
      ) : null}
    </div>
  );
}
