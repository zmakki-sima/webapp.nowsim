"use client";

import Image from "next/image";
import { useState } from "react";
import { MdSimCard, MdWarningAmber } from "react-icons/md";

import type { InstallTarget } from "@/app/actions/checkout";
import { Dialog } from "@/components/ui/Dialog";
import { Pressable } from "@/components/ui/Pressable";
import type { InstallChoice } from "@/lib/checkout";
import { cn } from "@/lib/cn";
import { formatSlashDay } from "@/lib/units";

// Purple is reserved for what the customer can act on, so the panels behind the
// buttons stay neutral instead of tinting the whole dialog one shade.
const block = "rounded-card p-5";

const action = cn(
  "w-full rounded-control px-5 py-3.5",
  "text-base font-bold tracking-[-0.01em]",
);

function statusOf({ state, expiresAt }: InstallTarget): string {
  if (!expiresAt) return "No plan on this eSIM";

  const when = formatSlashDay(expiresAt);

  return state === "active" ? `Active until ${when}` : `Expired ${when}`;
}

function Art({ src, size }: { src?: string; size: string }) {
  return (
    <span
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-ink/8",
        size,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          quality={90}
          sizes="44px"
          unoptimized={src.endsWith(".svg")}
          className="object-cover"
        />
      ) : (
        <MdSimCard
          aria-hidden
          className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-muted"
        />
      )}
    </span>
  );
}

export function InstallChoiceDialog({
  open,
  onClose,
  targets,
  unknown = false,
  choice,
  onChoose,
}: {
  open: boolean;
  onClose: () => void;
  targets: InstallTarget[];
  /** The eSIM list could not be loaded, so `targets` being empty proves nothing. */
  unknown?: boolean;
  choice: InstallChoice | null;
  onChoose: (choice: InstallChoice) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  // Nothing picked in this pass falls back to the standing choice, so reopening
  // the dialog shows what the customer settled on rather than a blank list.
  const selected = picked ?? (choice?.kind === "existing" ? choice.iccid : null);
  const target = targets.find((entry) => entry.iccid === selected);

  function issueNew() {
    setPicked(null);
    onChoose({ kind: "new" });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Where should this plan go?"
      width="max-w-[30rem]"
    >
      <div className="mt-2 flex flex-col overflow-y-auto scroll-slim">
        <div className={cn(block, "mt-3 bg-ink/[0.04]")}>
          <h3 className="text-base font-bold tracking-[-0.01em]">
            Issue a new eSIM
          </h3>

          <p className="mt-1.5 text-sm text-muted">
            A new eSIM is created. It needs to be installed again.
          </p>

          <Pressable
            onClick={issueNew}
            className={cn(
              action,
              "mt-4 bg-brand text-white",
              "hover:bg-brand-soft active:bg-brand-soft",
            )}
          >
            Issue a new eSIM
          </Pressable>
        </div>

        {(targets.length > 0 || unknown) && (
          <>
            <p
              aria-hidden
              className="my-4 flex items-center gap-4 text-sm font-medium text-muted"
            >
              <span className="h-px flex-1 bg-hairline" />
              OR
              <span className="h-px flex-1 bg-hairline" />
            </p>

            <div className={cn(block, "bg-ink/[0.04]")}>
              <h3 className="text-base font-bold tracking-[-0.01em]">
                Add a new plan to an existing eSIM
              </h3>

              <p className="mt-1.5 flex items-center gap-2 text-sm text-danger">
                <MdWarningAmber aria-hidden className="h-4 w-4 shrink-0" />
                Old data will be replaced
              </p>

              {unknown && (
                <p className="mt-4 text-sm text-muted">
                  We could not load your eSIMs just now. Reload the page to try
                  again, or issue a new one above.
                </p>
              )}

              <fieldset className="mt-4 flex flex-col gap-2.5">
                <legend className="sr-only">Choose an eSIM</legend>

                {targets.map((entry) => {
                  const on = entry.iccid === selected;

                  return (
                    <label
                      key={entry.iccid}
                      className={cn(
                        "flex cursor-pointer items-center gap-3.5",
                        "rounded-control p-3",
                        "transition-colors duration-300 ease-hover",
                        "motion-reduce:transition-none",
                        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand",
                        on ? "bg-brand/15" : "bg-surface hover:bg-brand/8",
                      )}
                    >
                      <input
                        type="radio"
                        name="install-target"
                        value={entry.iccid}
                        checked={on}
                        onChange={() => setPicked(entry.iccid)}
                        className="sr-only"
                      />

                      <Art src={entry.art} size="mt-0.5 h-10 w-10 self-start" />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-bold tracking-[-0.01em]">
                          {entry.name}
                        </span>
                        <span className="mt-1 block truncate text-sm text-muted">
                          {statusOf(entry)}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted">
                          ICCID: {entry.iccid}
                        </span>
                      </span>

                      <span
                        aria-hidden
                        className={cn(
                          "mt-0.5 h-5 w-5 shrink-0 self-start rounded-full border-2",
                          on ? "border-brand bg-brand" : "border-ink/25 bg-transparent",
                        )}
                      />
                    </label>
                  );
                })}
              </fieldset>

              {targets.length > 0 && (
                <Pressable
                  disabled={!target}
                  onClick={() =>
                    target &&
                    onChoose({
                      kind: "existing",
                      iccid: target.iccid,
                      name: target.name,
                    })
                  }
                  className={cn(
                    action,
                    // Purple is the new-eSIM button above. Replacing a live plan
                    // is the heavier choice, so it reads as navy, not as a
                    // washed-out copy of the primary action.
                    "mt-4 bg-ink text-white",
                    "hover:bg-ink-soft active:bg-ink-soft",
                    "disabled:bg-ink/15 disabled:text-muted",
                  )}
                >
                  {target ? "Continue" : "Pick an eSIM"}
                </Pressable>
              )}
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
