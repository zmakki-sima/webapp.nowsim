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
        The crumbs carry their own `px-4` for a comfortable tap target, which
        has to be cancelled at the start of the row so the text lines up with
        the page grid. A negative margin did that but made the box wider than
        its container — tipping narrow screens into horizontal scroll — and
        also pulled every *wrapped* line out of alignment. Removing the leading
        padding from the first item does the same job with neither side effect.
      */}
      <ol className="flex w-full flex-wrap items-center text-sm font-medium md:text-base [&>li:first-child>*]:pl-0">
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
                  className="px-4 py-2 text-ink"
                >
                  {item.label}
                </span>
              ) : (
                <Pressable
                  href={item.href}
                  hit
                  className={cn(
                    "rounded-full px-4 py-2 text-muted",
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
