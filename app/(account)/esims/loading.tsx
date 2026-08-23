import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section className="px-3 pb-20 pt-28 md:px-4 md:py-28">
      <div className="mx-auto max-w-3xl">
        <span className="sr-only">Loading your eSIMs</span>

        <Skeleton className="h-11 w-full max-w-[10ch] md:h-14" />

        <Skeleton className="mt-8 h-11 w-full max-w-[18ch] rounded-full" />

        <div className="mt-5 flex flex-col gap-4">
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton key={index} className="h-56 rounded-sheet" />
          ))}
        </div>
      </div>
    </section>
  );
}
