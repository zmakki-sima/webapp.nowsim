import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section className="px-3 pb-20 pt-28 md:px-4 md:py-28">
      <div className="mx-auto max-w-7xl">
        <span className="sr-only">Loading destinations</span>

        <Skeleton className="mb-10 h-5 w-full max-w-[28ch]" />

        <Skeleton className="h-11 w-full max-w-[14ch] md:h-14" />
        <Skeleton className="mt-5 h-6 w-full max-w-[52ch]" />

        <div className="mt-10 flex flex-col-reverse gap-4 md:mt-12 md:flex-row md:gap-5">
          <Skeleton className="h-14 min-w-0 flex-1 rounded-full" />
          <Skeleton className="h-14 w-full rounded-full md:w-[22rem]" />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 md:mt-10">
          {Array.from({ length: 12 }, (_, index) => (
            <Skeleton key={index} className="h-[5.5rem]" />
          ))}
        </div>
      </div>
    </section>
  );
}
