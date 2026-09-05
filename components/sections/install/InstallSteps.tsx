"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

import { Pressable } from "@/components/ui/Pressable";
import { Tabs } from "@/components/ui/Tabs";
import { cn } from "@/lib/cn";
import type {
  InstallMethod,
  InstallMethodId,
  InstallShots,
  InstallStep,
} from "@/lib/install";
import { installShotName, SHOT_HEIGHT, SHOT_WIDTH } from "@/lib/install";

const frame = "w-60 shrink-0 snap-start sm:w-72";

/*
 * `max-md:hidden` rather than a bare `hidden`: `cn` concatenates, it does not
 * resolve conflicts, so a plain `hidden` sat in the same layer as the
 * `inline-flex` every Pressable carries and lost to it — these mouse-only
 * arrows were showing up on phones, on top of the screenshots. A variant puts
 * the rule in a media query, which outranks the base utility.
 */
const arrow = cn(
  "absolute top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full",
  "max-md:hidden",
  "border border-hairline bg-surface text-ink shadow-sm",
  "hover:bg-surface-soft md:flex",
);

function Placeholder({ name }: { name: string }) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center rounded-sheet",
        "border border-dashed border-hairline bg-surface px-3 text-center",
      )}
      style={{ aspectRatio: `${SHOT_WIDTH} / ${SHOT_HEIGHT}` }}
    >
      <span className="break-all text-xs text-muted">{name}</span>
    </div>
  );
}

function Shots({
  shots,
  step,
  stepNumber,
}: {
  shots: string[];
  step: InstallStep;
  stepNumber: number;
}) {
  const rail = useRef<HTMLUListElement>(null);

  const count = shots.length || step.shots;

  const slide = (direction: 1 | -1) => {
    const node = rail.current;

    if (!node) return;

    node.scrollBy({ left: direction * node.clientWidth * 0.8 });
  };

  return (
    <div className="relative mt-6">
      <ul
        ref={rail}
        className={cn(
          "-mx-6 flex snap-x snap-mandatory justify-center-safe gap-3",
          "overflow-x-auto px-6",
          // `scroll-subtle` is the white-on-dark thumb; this rail sits on a
          // near-white card, where it was invisible — and on a phone the
          // scrollbar is the only thing saying the row goes on.
          "scroll-smooth scroll-slim md:-mx-8 md:px-8",
        )}
      >
        {Array.from({ length: count }, (_, index) => {
          const src = shots[index];
          const name = installShotName(stepNumber, index + 1);

          return (
            <li key={name} className={frame}>
              {src ? (
                <Image
                  src={src}
                  alt={
                    count > 1
                      ? `${step.title}, screen ${index + 1} of ${count}`
                      : step.title
                  }
                  width={SHOT_WIDTH}
                  height={SHOT_HEIGHT}
                  sizes="18rem"
                  className="block h-auto w-full rounded-sheet"
                />
              ) : (
                <Placeholder name={name} />
              )}
            </li>
          );
        })}
      </ul>

      {count > 2 && (
        <>
          <Pressable
            aria-label="Previous screenshot"
            onClick={() => slide(-1)}
            className={cn(arrow, "-left-3")}
          >
            <MdChevronLeft aria-hidden className="h-6 w-6" />
          </Pressable>

          <Pressable
            aria-label="Next screenshot"
            onClick={() => slide(1)}
            className={cn(arrow, "-right-3")}
          >
            <MdChevronRight aria-hidden className="h-6 w-6" />
          </Pressable>
        </>
      )}
    </div>
  );
}

function StepCard({
  step,
  index,
  total,
  shots,
}: {
  step: InstallStep;
  index: number;
  total: number;
  shots: string[];
}) {
  const count = shots.length || step.shots;

  return (
    <li
      className={cn(
        "rounded-sheet border border-hairline bg-surface-soft p-6 md:p-8",
        count > 0 && "pb-0 md:pb-0",
      )}
    >
      <p
        className={cn(
          "inline-flex rounded-full bg-brand/10 px-3.5 py-1.5",
          "text-eyebrow uppercase text-brand",
        )}
      >
        Step {index + 1} of {total}
      </p>

      <h2 className="mt-3 max-w-[26ch] text-h3">{step.title}</h2>

      {step.note && (
        <p className="mt-3 max-w-[48ch] text-sm text-muted">{step.note}</p>
      )}

      {step.path && (
        <p className="mt-3 text-sm text-muted">{step.path.join(" → ")}</p>
      )}

      {count > 0 && (
        <Shots shots={shots} step={step} stepNumber={index + 1} />
      )}
    </li>
  );
}

export function InstallSteps({
  methods,
  shots,
}: {
  methods: InstallMethod[];
  /** Screenshots found on disk. Anything missing renders as a placeholder. */
  shots: InstallShots;
}) {
  const groupId = useId();

  const [activeId, setActiveId] = useState<InstallMethodId>(methods[0].id);

  const active = methods.find(({ id }) => id === activeId) ?? methods[0];

  return (
    <>
      <Tabs
        items={methods.map(({ id, label }) => ({ id, label }))}
        value={activeId}
        onChange={setActiveId}
        label="Installation method"
        tabId={(id) => `${groupId}-tab-${id}`}
        panelId={`${groupId}-panel`}
        fill
        className="mt-8"
      />

      <div
        id={`${groupId}-panel`}
        role="tabpanel"
        aria-labelledby={`${groupId}-tab-${active.id}`}
      >
        <ol className="mt-6 flex flex-col gap-6">
          {active.steps.map((step, index) => (
            <StepCard
              key={step.title}
              step={step}
              index={index}
              total={active.steps.length}
              shots={shots[active.id]?.[index] ?? []}
            />
          ))}
        </ol>
      </div>
    </>
  );
}
