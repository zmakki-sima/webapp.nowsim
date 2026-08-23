import type { IconType } from "react-icons";
import {
  MdPublic,
  MdSignalCellularAlt,
  MdSmartphone,
  MdStar,
} from "react-icons/md";

import { cn } from "@/lib/cn";

type TrustPoint = {
  icon: IconType;
  label: string;
  iconClassName?: string;
};

const trustPoints: TrustPoint[] = [
  {
    icon: MdStar,
    label: "Trustpilot score 4.8 out of 5!",
    iconClassName: "text-trustpilot",
  },
  { icon: MdPublic, label: "One price, everywhere" },
  { icon: MdSignalCellularAlt, label: "Highest available speed" },
  { icon: MdSmartphone, label: "Pause the plan any time" },
];

export function TrustBar({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const onVideo = tone === "dark";

  return (
    <ul
      className={cn(
        "mx-auto grid w-full max-w-xl grid-cols-2",
        "lg:flex lg:max-w-none lg:justify-center",
        onVideo
          ? "gap-x-6 gap-y-4 lg:gap-x-10"
          : "gap-x-8 gap-y-8 lg:gap-x-16",
        className,
      )}
    >
      {trustPoints.map(({ icon: Icon, label, iconClassName }) => (
        <li key={label} className="flex items-center gap-3 text-left">
          <span
            className={cn(
              "flex h-10 shrink-0 items-center justify-center rounded-full px-5",
              onVideo
                ? "border border-white/25 bg-white/10 backdrop-blur-sm"
                : "border border-hairline bg-surface-soft",
            )}
          >
            <Icon
              aria-hidden
              className={cn(
                "h-5 w-5",
                onVideo ? "text-white" : "text-ink",
                iconClassName,
              )}
            />
          </span>

          <span
            className={cn(
              "text-base font-semibold",
              onVideo ? "text-white" : "text-ink",
            )}
          >
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
