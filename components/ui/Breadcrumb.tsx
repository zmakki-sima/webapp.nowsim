import { MdChevronRight } from "react-icons/md";

import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumb({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      {/*
        The crumbs carry their own `px-3` for a comfortable tap target, which
        has to be cancelled at the start of the row so the text lines up with
        the page grid. Dropping the leading padding from the first crumb did
        that, but its hover pill then had no room on the left and the label sat
        flush against the rounded edge. Shifting the whole row by one padding
        step instead keeps every line — wrapped ones included — on the grid
        with the padding intact. The step matches the narrowest page gutter, so
        the pill never reaches past the viewport, and the widened `w-` cancels
        the overhang so nothing can scroll sideways.
      */}
      <ol className="-ml-3 flex w-[calc(100%_+_0.75rem)] flex-wrap items-center text-sm font-medium md:text-base">
        {items.map((item, index) => {
          const last = index === items.length - 1;

          return (
            <li key={item.label} className="flex items-center">
              {index > 0 ? (
                <MdChevronRight
                  aria-hidden
                  className="mx-0.5 h-4 w-4 shrink-0 text-ink/30"
                />
              ) : null}

              {last || !item.href ? (
                <span
                  aria-current={last ? "page" : undefined}
                  className="px-3 py-2 text-ink"
                >
                  {item.label}
                </span>
              ) : (
                <Pressable
                  href={item.href}
                  hit
                  className={cn(
                    "rounded-full px-3 py-2 text-muted",
                    "hover:bg-surface-soft hover:text-ink",
                    "active:bg-surface-soft active:text-ink",
                  )}
                >
                  {item.label}
                </Pressable>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
