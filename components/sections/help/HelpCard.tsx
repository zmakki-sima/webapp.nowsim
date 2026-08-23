import Image from "next/image";
import { MdImage } from "react-icons/md";

import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";
import type { HelpArticle } from "@/lib/help";

export function HelpCard({ article }: { article: HelpArticle }) {
  return (
    <Pressable
      href={article.href}
      press={false}
      className="group h-full w-full flex-col items-start justify-start gap-4 rounded-card text-left"
    >
      <span
        className={cn(
          "relative flex aspect-[16/10] w-full shrink-0 items-center justify-center",
          "overflow-hidden rounded-card bg-surface-soft",
        )}
      >
        {article.image ? (
          <Image
            src={article.image}
            alt=""
            fill
            quality={90}
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
            className={cn(
              "object-cover transition-transform duration-300 ease-hover",
              "group-hover:scale-105 motion-reduce:transition-none",
            )}
          />
        ) : (
          <MdImage aria-hidden className="h-10 w-10 text-ink/20" />
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "text-lg font-bold tracking-[-0.02em]",
            "transition-colors duration-300 ease-hover group-hover:text-brand",
            "motion-reduce:transition-none",
          )}
        >
          {article.title}
        </span>

        <span className="mt-1 text-base text-muted">{article.blurb}</span>
      </span>
    </Pressable>
  );
}
