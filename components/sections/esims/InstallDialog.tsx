"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MdCheck, MdContentCopy } from "react-icons/md";

import { ConfirmIdentity } from "@/components/sections/esims/ConfirmIdentity";
import { Dialog } from "@/components/ui/Dialog";
import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";
import type { Esim } from "@/lib/types";

const row = "w-full rounded-control bg-brand/6 px-4 py-3.5 text-base";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), 2000);

    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Pressable
      onClick={copy}
      className={cn(row, "gap-3 hover:bg-brand/12 active:bg-brand/12")}
    >
      <span className="shrink-0 font-semibold">{label}</span>

      <span className="min-w-0 flex-1 truncate text-right text-muted">
        {value}
      </span>

      {copied ? (
        <MdCheck aria-hidden className="h-5 w-5 shrink-0" />
      ) : (
        <MdContentCopy aria-hidden className="h-5 w-5 shrink-0 text-muted" />
      )}

      <span className="sr-only">
        {copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
      </span>
    </Pressable>
  );
}

export function InstallDialog({
  esim,
  open,
  onClose,
  confirm,
}: {
  esim: Esim;
  open: boolean;
  onClose: () => void;
  /**
   * Set when the dialog was opened by something other than "Install details" —
   * a resend that needed a fresh session. Without it a confirmed code drops the
   * customer into install details, which is not what they asked for.
   */
  confirm?: {
    reason: string;
    submitLabel: string;
    onConfirmed: () => void;
  };
}) {
  const title = esim.plan ? `${esim.plan.destination} eSIM` : "Your eSIM";

  if (esim.installLocked || confirm) {
    return (
      <Dialog open={open} onClose={onClose} title={title}>
        <ConfirmIdentity {...confirm} />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="mt-6 flex flex-col gap-4 overflow-y-auto scroll-slim">
        {esim.qrImage ? (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-card bg-white p-3">
              <Image
                src={esim.qrImage}
                alt={`Installation QR code for eSIM ${esim.iccid}`}
                width={200}
                height={200}
                unoptimized
                className="h-[12.5rem] w-[12.5rem]"
              />
            </div>

            <p className="text-center text-sm text-muted">
              Scan this from the phone that will use the eSIM.
              <br />
              It can only be installed once.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            This eSIM has no installation code left. Buy a new plan to get
            another one.
          </p>
        )}

        {esim.iosTapLink && (
          <Pressable
            href={esim.iosTapLink}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "w-full gap-2 rounded-control bg-brand px-5 py-3.5",
              "text-base font-bold text-white",
              "hover:bg-brand-soft active:bg-brand-soft",
            )}
          >
            Install on this iPhone
          </Pressable>
        )}

        {esim.activationCode && (
          <CopyRow label="Activation code" value={esim.activationCode} />
        )}

        <CopyRow label="ICCID" value={esim.iccid} />
      </div>
    </Dialog>
  );
}
