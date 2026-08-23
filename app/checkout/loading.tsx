import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section className="px-3 py-12 md:px-4 md:py-16">
      <div className="mx-auto max-w-6xl">
        <span className="sr-only">Loading checkout</span>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-10">
          <div className="lg:col-start-2 lg:row-start-1">
            <Skeleton className="h-[26rem] rounded-sheet" />
          </div>

          <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1">
            <Skeleton className="h-56 rounded-sheet" />
            <Skeleton className="h-72 rounded-sheet" />
          </div>
        </div>
      </div>
    </section>
  );
}
