"use client";

import { useState } from "react";
import { MdArrowForward } from "react-icons/md";

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
        View all {operators.length} networks
        <MdArrowForward aria-hidden className="h-4 w-4 shrink-0" />
      </Pressable>

      <NetworkDialog
        open={open}
        onClose={() => setOpen(false)}
        operators={operators}
      />
    </>
  );
}
