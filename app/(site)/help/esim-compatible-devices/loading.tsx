import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section className="px-3 pb-20 pt-header md:px-4 md:py-28">
      <div className="mx-auto max-w-7xl">
        <span className="sr-only">Loading compatible devices</span>

        <Skeleton className="mb-10 h-5 w-full max-w-[28ch]" />

        <Skeleton className="h-11 w-full max-w-[18ch] md:h-14" />
        <Skeleton className="mt-5 h-6 w-full max-w-[62ch]" />

        <Skeleton className="mt-10 h-14 w-full max-w-xl rounded-full md:mt-12" />

        <div className="mt-12 flex flex-col gap-12 md:mt-14 md:gap-14">
          {Array.from({ length: 3 }, (_, group) => (
            <div key={group}>
              <Skeleton className="h-7 w-40" />

              <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 12 }, (_, index) => (
                  <Skeleton key={index} className="h-6" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
