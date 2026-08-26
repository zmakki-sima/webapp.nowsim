import Image from "next/image";

import { MdChevronRight } from "react-icons/md";

import { Price } from "@/components/common/Price";
import { Pressable } from "@/components/ui/Pressable";
import { destinationHref, type DestinationSummary } from "@/lib/types";
import { cn } from "@/lib/cn";

export function DestinationCard({
  destination,
  note,
}: {
  destination: DestinationSummary;
  note?: string;
}) {
  return (
    <Pressable
      href={destinationHref(destination.kind, destination.slug)}
      className={cn(
        "group w-full justify-start gap-4 rounded-card px-5 text-left",
        note ? "py-4 md:py-4" : "py-5 md:py-6",
        "bg-brand/4 hover:bg-brand/10 active:bg-brand/10",
      )}
    >
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-brand/12">
        <Image
          src={destination.art}
          alt=""
          fill
          quality={90}
          sizes="48px"
          unoptimized={destination.art.endsWith(".svg")}
          className="object-cover"
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-lg font-bold tracking-[-0.02em]">
          {destination.name}
        </span>
        <span className="block text-sm font-medium text-muted">
          From <Price money={destination.from} />
          {destination.covers ? ` • ${destination.covers} countries` : ""}
        </span>

        {note ? (
          <span
            className={cn(
              "mt-2 inline-block max-w-full truncate rounded-full bg-brand/10 px-2.5 py-1",
              "text-xs font-bold text-brand",
            )}
          >
            {note}
          </span>
        ) : null}
      </span>

      <MdChevronRight
        aria-hidden
        className="h-5 w-5 shrink-0 text-ink/60 transition-[color,translate] duration-300 ease-hover group-hover:translate-x-0.5 group-hover:text-ink motion-reduce:transition-none"
      />
    </Pressable>
  );
}
