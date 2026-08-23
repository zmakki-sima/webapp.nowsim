import { MdAdd, MdSignalCellularAlt } from "react-icons/md";

import { EsimCard } from "@/components/sections/esims/EsimCard";
import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";
import type { Esim } from "@/lib/types";

function Empty() {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-sheet",
        "bg-brand/6 px-6 py-24 text-center",
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-card bg-brand/12">
        <MdSignalCellularAlt aria-hidden className="h-7 w-7 text-brand" />
      </span>

      <h2 className="mt-5 text-lg font-bold tracking-[-0.02em]">
        You don’t have any active eSIMs yet
      </h2>

      <p className="mt-1 text-base text-muted">
        Buy a new eSIM to stay connected while traveling
      </p>
    </div>
  );
}

export function EsimList({ esims, title }: { esims: Esim[]; title: string }) {
  return (
    <>
      <h1 className="font-display text-h2 font-extrabold tracking-[-0.045em]">
        {title}
      </h1>

      <div className="mt-8">
        {esims.length === 0 ? (
          <Empty />
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
          "mt-8 w-full gap-2 rounded-full bg-brand px-8 py-4",
          "text-base font-bold text-white",
          "hover:bg-brand-soft active:bg-brand-soft",
        )}
      >
        <MdAdd aria-hidden className="h-5 w-5 shrink-0" />
        Buy new plan
      </Pressable>
    </>
  );
}
