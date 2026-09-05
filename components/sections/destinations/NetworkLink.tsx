"use client";

import { useState } from "react";
import { MdLanguage } from "react-icons/md";

import { NetworkDialog } from "@/components/sections/destinations/NetworkDialog";
import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

export function NetworkLink({ operators }: { operators: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          "gap-2 rounded-full bg-brand/12 px-5 py-2.5",
          "text-sm font-semibold text-brand",
          "hover:bg-brand/20 active:bg-brand/20",
        )}
      >
        <MdLanguage aria-hidden className="h-4 w-4 shrink-0" />
        View all {operators.length} networks
      </Pressable>

      <NetworkDialog
        open={open}
        onClose={() => setOpen(false)}
        operators={operators}
      />
    </>
  );
}
