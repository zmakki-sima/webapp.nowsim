import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section className="px-3 pb-20 pt-40 md:px-4 md:pt-48">
      <div className="mx-auto max-w-7xl">
        <span className="sr-only">Loading</span>

        <Skeleton className="h-14 w-full max-w-[18ch] md:h-20" />
        <Skeleton className="mt-4 h-14 w-full max-w-[14ch] md:h-20" />

        <Skeleton className="mt-8 h-6 w-full max-w-[46ch]" />

        <Skeleton className="mt-10 h-16 w-full max-w-xl rounded-full" />

        <div className="mt-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {Array.from({ length: 9 }, (_, index) => (
            <Skeleton key={index} className="h-[5.5rem]" />
          ))}
        </div>
      </div>
    </section>
  );
}
