"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { MdSimCard, MdWarningAmber } from "react-icons/md";

import type { InstallTarget } from "@/app/actions/checkout";
import { cardPillTone } from "@/components/common/CardFact";
import { Dialog } from "@/components/ui/Dialog";
import { Pressable } from "@/components/ui/Pressable";
import type { InstallChoice } from "@/lib/checkout";
import { cn } from "@/lib/cn";
import { esimStateLabels, type EsimState } from "@/lib/types";

// Purple is reserved for what the customer can act on, so the panels behind the
// buttons stay neutral instead of tinting the whole dialog one shade.
const block = "rounded-card p-5";

const action = cn(
  "w-full rounded-control px-5 py-3.5",
  "text-base font-bold tracking-[-0.01em]",
);

// Purple is the new-eSIM button. Replacing a live plan is the heavier choice, so
// it reads as navy rather than as a washed-out copy of the primary action.
const heavy = cn(
  action,
  "bg-ink text-white",
  "hover:bg-ink-soft active:bg-ink-soft",
  "disabled:bg-ink/15 disabled:text-muted",
);

// The same state pill the eSIM list uses — `cardPillTone` supplies the fill, so
// a card reads the same colour in both places. Sized down a step: this list is
// denser than the cards on /esims.
const pill = cn(
  "shrink-0 rounded-full px-2 py-0.5",
  "text-[0.75rem]/[1rem] font-bold",
);

const note = "text-sm font-medium";

/**
 * Cheapest card to overwrite first. An expired plan costs the customer nothing,
 * an uninstalled one costs an install, and a running plan is the only choice
 * that throws away data they have paid for — so it sits at the bottom, where it
 * cannot be picked by reflex.
 */
const overwriteOrder: Record<EsimState, number> = {
  expired: 0,
  issued: 1,
  ready: 2,
  installed: 3,
  // Never listed: a removed profile cannot be written to.
  removed: 4,
};

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

/**
 * One muted line under the name, in place of a rack of pills on every row.
 *
 * Nothing about time is here on purpose. What the card has left is about to be
 * overwritten, so quoting it invites the customer to weigh a number this choice
 * throws away.
 */
function Meta({ entry }: { entry: InstallTarget }) {
  const facts = [
    entry.data,
    entry.days === undefined
      ? null
      : `${entry.days} day${entry.days === 1 ? "" : "s"}`,
  ].filter((fact): fact is string => Boolean(fact));

  if (facts.length === 0) return null;

  return (
    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted">
      {facts.map((fact, index) => (
        <span key={fact} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden className="text-ink/25">
              ·
            </span>
          )}
          {fact}
        </span>
      ))}
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
  /**
   * Picking a card is its own step rather than a list folded into the first
   * one. Four rows plus two panels and a heading do not fit a phone in
   * landscape, and cramming them cost the rows the room to say anything useful
   * about each card — which is the whole basis for the choice.
   */
  const [listing, setListing] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  // Sorted here rather than in the action: the account page lists the same
  // eSIMs newest-first, and only this screen cares what they cost to replace.
  const ordered = useMemo(
    () =>
      [...targets].sort(
        (a, b) => overwriteOrder[a.state] - overwriteOrder[b.state],
      ),
    [targets],
  );

  // Nothing picked in this pass falls back to the standing choice, so reopening
  // the dialog shows what the customer settled on rather than a blank list.
  const selected = picked ?? (choice?.kind === "existing" ? choice.iccid : null);
  const target = targets.find((entry) => entry.iccid === selected);

  function issueNew() {
    setPicked(null);
    onChoose({ kind: "new" });
  }

  // Both steps live in one dialog, so closing it anywhere puts the customer back
  // at the start rather than reopening onto a half-finished choice.
  function close() {
    setListing(false);
    onClose();
  }

  if (listing) {
    return (
      <Dialog
        open={open}
        onClose={close}
        onBack={() => setListing(false)}
        title="Which eSIM?"
        width="max-w-[30rem]"
      >
        {/* Grey, not red: the customer has already read the red warning that
            got them here, and every row on this step carries the same cost. */}
        <p className={cn(note, "mt-6 text-muted")}>
          The plan on the eSIM you pick will be replaced
        </p>

        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          {/*
            294px is what is left over when this step is asked to stand the same
            height as the one before it: that step's two panels, rule and gaps
            come to 422px, and everything here but the list accounts for 128px
            of it. Stepping forward then reveals the list without the sheet
            growing under the cursor, and the row cut off at the bottom says it
            keeps going. `flex-1` still governs on a short screen, where even
            this will not fit — the cap only binds when there is room to spare.
            `-mr-1 pr-1` keeps the focus ring clear of the scrollbar without
            indenting the rows away from the dialog's own padding.
          */}
          <fieldset className="-mr-1 flex max-h-[294px] min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1 scroll-slim">
            <legend className="sr-only">Choose an eSIM</legend>

            {ordered.map((entry) => {
              const on = entry.iccid === selected;

              return (
                <label
                  key={entry.iccid}
                  className={cn(
                    "flex cursor-pointer items-center gap-3.5",
                    "rounded-card border p-4",
                    "transition-colors duration-300 ease-hover",
                    "motion-reduce:transition-none",
                    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink",
                    on
                      // One hairline, not a ring on top of it: the two sit flush
                      // and read as a single heavy 2px edge. The fill carries
                      // the rest of the weight now that the radio is gone.
                      ? "border-brand bg-brand/12"
                      : "border-hairline bg-surface hover:bg-brand/6",
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

                  {/* A spent card reads as spent from the flag alone, which
                      saves the row a word for saying so twice. */}
                  <Art
                    src={entry.art}
                    size={cn(
                      "h-11 w-11",
                      entry.state === "expired" && "opacity-50 grayscale",
                    )}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-bold tracking-[-0.01em]">
                      {entry.name}
                    </span>

                    <Meta entry={entry} />

                    {/* Two cards of the same country and plan differ only by
                        this, so it stays for anyone listening to the row rather
                        than looking at it. */}
                    <span className="sr-only">ICCID {entry.iccid}</span>
                  </span>

                  {/* The row's own outline carries the selection, so the pill
                      takes the corner the radio used to hold. */}
                  <span
                    className={cn(pill, cardPillTone[entry.state], "ml-1")}
                  >
                    {esimStateLabels[entry.state]}
                  </span>
                </label>
              );
            })}
          </fieldset>

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
            className={cn(heavy, "mt-4 shrink-0")}
          >
            {target ? `Use ${target.name}` : "Pick an eSIM"}
          </Pressable>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Where should this plan go?"
      width="max-w-[30rem]"
    >
      {/* Two panels and a heading still outgrow a phone held sideways, so the
          step scrolls rather than running past the bottom of the sheet. */}
      <div className="-mr-1 mt-6 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1 scroll-slim">
        <div className={cn(block, "shrink-0 bg-ink/[0.04]")}>
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
              className="flex shrink-0 items-center gap-4 text-sm font-medium text-muted"
            >
              <span className="h-px flex-1 bg-hairline" />
              OR
              <span className="h-px flex-1 bg-hairline" />
            </p>

            <div className={cn(block, "shrink-0 bg-ink/[0.04]")}>
              <h3 className="text-base font-bold tracking-[-0.01em]">
                Add a new plan to an existing eSIM
              </h3>

              <p className="mt-1.5 text-sm text-muted">
                The plan is written to an eSIM you already have.
              </p>

              {unknown ? (
                <p className="mt-4 text-sm text-muted">
                  We could not load your eSIMs just now. Reload the page to try
                  again, or issue a new one above.
                </p>
              ) : (
                <>
                  <Pressable
                    onClick={() => setListing(true)}
                    className={cn(heavy, "mt-4")}
                  >
                    {/* Naming the count up front says how much of a choice this
                        is before the customer commits to a second step. */}
                    Choose from {targets.length} eSIM
                    {targets.length === 1 ? "" : "s"}
                  </Pressable>

                  {/* Under the button, not above it: read on the way past, the
                      panel says what the choice does before what it costs. */}
                  {/* Same size and rhythm as the legal line under the sign-in
                      button: a footnote to the action above it. */}
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs leading-relaxed font-medium text-danger">
                    <MdWarningAmber aria-hidden className="h-4 w-4 shrink-0" />
                    Old data will be replaced
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
