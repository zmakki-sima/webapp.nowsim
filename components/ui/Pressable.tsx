import Link from "next/link";
import type { ComponentProps, ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

const chrome = cn(
  "inline-flex items-center justify-center",
  "select-none touch-manipulation cursor-pointer",
  "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  "aria-disabled:pointer-events-none aria-disabled:opacity-50",
);

const feedback = "press";

const hitArea = cn(
  "relative",
  "after:absolute after:left-1/2 after:top-1/2 after:content-['']",
  "after:h-[max(100%,44px)] after:w-[max(100%,44px)]",
  "after:-translate-x-1/2 after:-translate-y-1/2",
);

type PressableOwnProps = {
  hit?: boolean;
  press?: boolean;
};

type PressableButtonProps = PressableOwnProps &
  ComponentProps<"button"> & { href?: undefined };

type PressableLinkProps = PressableOwnProps &
  ComponentPropsWithoutRef<typeof Link> & { href: string };

export type PressableProps = PressableButtonProps | PressableLinkProps;

export function Pressable({
  hit = false,
  press = true,
  className,
  ...props
}: PressableProps) {
  const classes = cn(chrome, press && feedback, hit && hitArea, className);

  if (props.href !== undefined) {
    return <Link {...props} className={classes} />;
  }

  const { type = "button", ...buttonProps } = props;
  return <button {...buttonProps} type={type} className={classes} />;
}
