import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section className="px-3 pb-20 pt-28 md:px-4 md:py-28">
      <div className="mx-auto max-w-3xl">
        <span className="sr-only">Loading your purchase history</span>

        <Skeleton className="h-11 w-full max-w-[16ch] md:h-14" />

        <div className="mt-8 flex flex-col gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-44 rounded-sheet" />
          ))}
        </div>
      </div>
    </section>
  );
}
