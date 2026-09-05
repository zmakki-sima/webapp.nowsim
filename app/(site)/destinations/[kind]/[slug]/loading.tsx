import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section className="px-3 pt-header md:px-4">
      <div className="mx-auto max-w-7xl">
        <span className="sr-only">Loading destination</span>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-16">
          <div>
            <Skeleton className="mb-10 h-5 w-full max-w-[32ch]" />
            <Skeleton className="aspect-square w-full rounded-sheet" />
          </div>

          <div className="lg:pt-[4.5rem]">
            <div className="flex items-center gap-5">
              <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
              <Skeleton className="h-10 w-full max-w-[16ch] md:h-12" />
            </div>

            <Skeleton className="mt-5 h-6 w-full max-w-[52ch]" />
            <Skeleton className="mt-12 h-7 w-full max-w-[34ch]" />

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 8 }, (_, index) => (
                <Skeleton key={index} className="h-[8.5rem]" />
              ))}
            </div>

            <Skeleton className="mt-8 h-14 w-full rounded-full" />
            <Skeleton className="mt-3 h-14 w-full rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
