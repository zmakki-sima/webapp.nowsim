import { MdAdd, MdSignalCellularAlt } from "react-icons/md";

import { EsimCard } from "@/components/sections/esims/EsimCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";
import type { Esim } from "@/lib/types";

export function EsimList({ esims, title }: { esims: Esim[]; title: string }) {
  return (
    <>
      <h1 className="font-display text-h2 font-extrabold tracking-[-0.045em]">
        {title}
      </h1>

      <div className="mt-8">
        {esims.length === 0 ? (
          <EmptyState
            icon={
              <MdSignalCellularAlt aria-hidden className="h-7 w-7 text-brand" />
            }
            title="You don’t have any active eSIMs yet"
            description="Buy a new eSIM to stay connected while traveling"
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {esims.map((esim) => (
              <EsimCard key={esim.id} esim={esim} />
            ))}
          </ul>
        )}
      </div>

      <Pressable
        href="/destinations"
        className={cn(
          "mt-8 w-full gap-2 rounded-full bg-ink px-8 py-4",
          "text-base font-bold text-white",
          "hover:bg-ink-soft active:bg-ink-soft",
        )}
      >
        <MdAdd aria-hidden className="h-5 w-5 shrink-0" />
        Buy new plan
      </Pressable>
    </>
  );
}
