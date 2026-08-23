import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-card bg-brand/10 motion-reduce:animate-none",
        className,
      )}
    />
  );
}
