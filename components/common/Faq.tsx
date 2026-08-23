"use client";

import { useId, useState } from "react";
import { MdExpandMore } from "react-icons/md";

import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

type Entry = {
  question: string;
  answer: string;
};

const entries: Entry[] = [
  {
    question: "What is a nowsim eSIM?",
    answer:
      "It's a data plan that lives on your phone instead of a plastic SIM. Pick a destination, pay once, and the plan installs itself. No tray, no kiosk, no swapping cards at the airport.",
  },
  {
    question: "Will my phone work with it?",
    answer:
      "Almost every phone sold in the last few years is eSIM capable. iPhone XS and newer, recent Pixels, and most flagship Androids. We check compatibility at checkout, so you'll know before you pay.",
  },
  {
    question: "When does my plan start?",
    answer:
      "The clock starts when the eSIM first connects to a network at your destination, not when you buy it. Install before you fly, land, and you're already online.",
  },
  {
    question: "Do I keep my own number?",
    answer:
      "Yes. Your nowsim plan runs alongside your normal SIM, so calls and texts on your regular number keep working. Data just moves to the local network instead of roaming.",
  },
  {
    question: "What happens if I run out of data?",
    answer:
      "Top up from the app in a few taps. No new eSIM, no reinstall. The extra data lands on the plan you're already using.",
  },
  {
    question: "Can I use one plan across several countries?",
    answer:
      "Regional and global plans cover whole groups of countries on a single balance. Cross a border and the eSIM switches networks on its own.",
  },
  {
    question: "How do I get help while travelling?",
    answer:
      "Support is in the app, every day of the year, and answers in minutes rather than days. If a plan never connects, we refund it.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  return (
    <section
      aria-labelledby="faq-heading"
      className="mt-28 px-3 py-20 md:mt-40 md:px-4 md:py-28"
    >
      <div
        className={cn(
          "mx-auto grid max-w-7xl gap-10",
          "md:grid-cols-[minmax(0,6fr)_minmax(0,6.5fr)] md:gap-16",
        )}
      >
        <div className="md:pt-2">
          <h2
            id="faq-heading"
            className="max-w-[18ch] font-display text-h1 font-extrabold uppercase tracking-[-0.045em]"
          >
            Questions about{" "}
            <span className="text-brand">the local plans?</span>
          </h2>

          <p className="mt-5 max-w-[40ch] text-lg text-muted">
            We know, it sounds too good to be true. But it&rsquo;s real.
            Here&rsquo;s how.
          </p>
        </div>

        <ul className="border-t border-hairline">
          {entries.map((entry, index) => {
            const expanded = open === index;
            const panelId = `${baseId}-panel-${index}`;
            const triggerId = `${baseId}-trigger-${index}`;

            return (
              <li key={entry.question} className="border-b border-hairline">
                <Pressable
                  press={false}
                  id={triggerId}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setOpen(expanded ? null : index)}
                  className={cn(
                    "w-full gap-6 py-6 text-left",
                    "text-lg font-bold tracking-[-0.02em]",
                    "transition-colors duration-300 ease-hover hover:text-brand",
                    expanded && "text-brand",
                    "motion-reduce:transition-none",
                  )}
                >
                  <span className="flex-1">{entry.question}</span>

                  <MdExpandMore
                    aria-hidden
                    className={cn(
                      "h-5 w-5 shrink-0 text-brand",
                      "transition-transform duration-300 ease-ios",
                      expanded && "-rotate-180",
                      "motion-reduce:transition-none",
                    )}
                  />
                </Pressable>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className={cn(
                    "grid duration-300 ease-ios",
                    "transition-[grid-template-rows,opacity,visibility]",
                    expanded
                      ? "visible grid-rows-[1fr] opacity-100"
                      : "invisible grid-rows-[0fr] opacity-0",
                    "motion-reduce:transition-none",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[60ch] pb-6 text-base text-muted">
                      {entry.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
