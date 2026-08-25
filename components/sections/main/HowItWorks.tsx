import Image from "next/image";

import { cn } from "@/lib/cn";

type Step = {
  label: string;
  title: string;
  body: string;
  image: { src: string; alt: string; width: number; height: number };
  surface: string;
  chrome: string;
  copy: string;
  heading?: string;
};

const steps: Step[] = [
  {
    label: "Pick a destination",
    title: "200+ countries, one account",
    body: "Search where you're going and choose a country, a region, or a global plan. Prices are the same wherever you activate. No local surcharge, no dynamic pricing.",
    image: {
      src: "/images/main/phone-1.png",
      alt: "App dialler showing a Dutch number with the per-minute rate and remaining balance",
      width: 1179,
      height: 1558,
    },
    surface: "bg-brand text-white",
    chrome: "border-white/35",
    copy: "text-muted-invert",
    heading: "text-white",
  },
  {
    label: "Install in seconds",
    title: "No SIM tray, no kiosk",
    body: "The eSIM installs straight from the app. Scan once, and the plan sits alongside your normal SIM. Your own number keeps ringing while data moves to the local network.",
    image: {
      src: "/images/main/phone-2.png",
      alt: "App plan screen with a 20 GB worldwide plan ready to activate",
      width: 1179,
      height: 1558,
    },
    surface: "bg-volt text-ink",
    chrome: "border-ink/30",
    copy: "text-ink/70",
  },
  {
    label: "Land connected",
    title: "Highest speed, no commitment",
    body: "We connect to the top networks in each country, so you land on the fastest connection on offer. Run out? Top up in seconds. No new eSIM, no reinstall, no contract.",
    image: {
      src: "/images/main/phone-3.png",
      alt: "Free, Classic and Unlimited plan tiers stacked as a choice",
      width: 1200,
      height: 1558,
    },
    surface: "bg-ink text-white",
    chrome: "border-white/30",
    copy: "text-muted-invert",
    heading: "text-volt",
  },
];

const stackStep = 6;

const stackOffset = (index: number) => ({
  transform: `translateY(${index * stackStep}rem)`,
  marginTop: index === 0 ? undefined : `-${stackStep}rem`,
});

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="px-3 py-20 md:px-4 md:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="how-it-works-heading"
          className={cn(
            "mx-auto max-w-[16ch] text-center uppercase",
            "font-display text-h1 font-extrabold tracking-[-0.045em]",
          )}
        >
          How nowsim <span className="text-brand">works</span>
        </h2>

        <p
          className={cn(
            "mx-auto mt-5 max-w-[46ch] text-center",
            "text-lg text-muted md:text-xl",
          )}
        >
          Three steps from picking a plan to landing connected.
        </p>

        <ol className="mt-10 md:mt-16">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={cn(
                "sticky mb-4 md:mb-5",
                "top-[calc(env(safe-area-inset-top)+var(--header-height)+3rem)]",
              )}
              style={stackOffset(index)}
            >
              <article
                className={cn(
                  "overflow-hidden rounded-sheet shadow-lg shadow-ink/10",
                  step.surface,
                )}
              >
                <div className="flex h-24 items-center gap-4 px-6 md:px-10">
                  <span
                    className={cn(
                      "flex h-10 shrink-0 items-center justify-center rounded-full border px-5.5",
                      "text-base font-bold italic leading-none",
                      step.chrome,
                    )}
                  >
                    {index + 1}
                  </span>

                  <span className="text-xl font-semibold tracking-[-0.01em]">
                    {step.label}
                  </span>
                </div>

                <div
                  className={cn(
                    "grid gap-8 px-6 pb-10 md:px-10",
                    "md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:items-center md:gap-12",
                  )}
                >
                  <div>
                    <h3
                      className={cn(
                        "max-w-[16ch] font-display text-h2 font-extrabold uppercase",
                        step.heading,
                      )}
                    >
                      {step.title}
                    </h3>

                    <p
                      className={cn(
                        "mt-5 max-w-[46ch] text-lg font-medium",
                        step.copy,
                      )}
                    >
                      {step.body}
                    </p>
                  </div>

                  <div className="-mb-10 flex justify-center self-end">
                    <Image
                      src={step.image.src}
                      alt={step.image.alt}
                      width={step.image.width}
                      height={step.image.height}
                      quality={100}
                      sizes="(min-width: 1024px) 368px, (min-width: 768px) 34vw, 80vw"
                      className="h-auto w-full max-w-[23rem] rounded-t-screen-lg"
                    />
                  </div>
                </div>
              </article>
            </li>
          ))}

          <li aria-hidden className="h-[45vh] min-h-56" />
        </ol>
      </div>
    </section>
  );
}
