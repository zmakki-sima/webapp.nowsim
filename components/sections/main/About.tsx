import Image from "next/image";

import { NowsimEmblem } from "@/components/ui/NowsimEmblem";

export function About() {
  return (
    <section className="px-3 py-16 md:px-4 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-[minmax(0,4.5fr)_minmax(0,7.5fr)] md:gap-6">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-display text-h1 font-extrabold uppercase tracking-[-0.045em]">
              The future of <span className="text-brand">mobile data</span>
            </h2>

            <p className="mt-5 max-w-[36ch] text-base text-muted">
              With nowsim you&rsquo;re connected to every network worth using,
              in every country worth visiting. One eSIM, one account, no roaming
              bills and no plastic. Because staying online shouldn&rsquo;t
              depend on which border you just crossed. Pick a destination, tap
              once, and land connected.
            </p>
          </div>

          <div className="flex flex-1 items-center rounded-sheet bg-ink p-8 text-center md:p-12">
            <p className="text-h3 font-medium text-white">
              Our app gives you a first-class connection wherever you are:
              couch, café, or a cliff in Cappadocia. No airport kiosk, no SIM
              tray. Set it up once, & you&rsquo;re set.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 md:gap-6">
          <div className="relative aspect-[16/6] overflow-hidden rounded-full bg-surface-soft">
            <Image
              src="/images/main/fisheye.jpg"
              alt="Traveller photographed from above with a fisheye lens, looking up at the camera on a grassy path"
              fill
              quality={90}
              sizes="(min-width: 1200px) 720px, (min-width: 768px) 60vw, 100vw"
              className="object-cover object-center"
            />
          </div>

          {/*
            The 3fr/7fr split only has room from `lg` up: at tablet width the
            right-hand track was too narrow for the rating tile and the figure
            beside it, which pushed the section past the viewport.
          */}
          <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:gap-6">
            {/* An explicit ratio below `lg`, where this is a single full-width
                row and a `fill` image has no height to resolve against. */}
            <div className="relative aspect-[16/6] overflow-hidden rounded-full bg-surface-soft lg:aspect-auto">
              <Image
                src="/images/main/pose.jpg"
                alt="Portrait of a nowsim traveller framing their face with both hands"
                fill
                quality={90}
                sizes="(min-width: 1200px) 315px, (min-width: 1024px) 27vw, 100vw"
                className="object-cover object-center"
              />
            </div>

            <div className="flex min-w-0 flex-col gap-5 md:gap-6">
              <div className="flex min-w-0 flex-1 gap-5 md:gap-6">
                <div className="relative aspect-square shrink-0 rounded-full bg-volt text-ink">
                  <NowsimEmblem className="absolute inset-[27%]" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-card bg-brand px-5 py-6 text-center text-white">
                  <p className="text-[clamp(2.25rem,4.6vw,3.25rem)] font-extrabold leading-none tracking-[-0.05em] tabular-nums">
                    4.9
                  </p>
                  <p className="mt-2 max-w-[22ch] text-xs leading-snug font-bold text-muted-invert md:text-sm">
                    Out of 5.0 on the App Store &amp; Google Play
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-card bg-aqua px-5 py-6 text-center text-ink">
                {/*
                  An 13-character unbreakable figure. From `md` up it sits in a
                  narrow column of a nested grid, where 5.4vw is wider than the
                  track and forced the whole grid open; cap it there so it
                  scales to the column instead.
                */}
                <p className="max-w-full text-[clamp(1.75rem,5.4vw,3.75rem)] font-extrabold leading-none tracking-[-0.05em] tabular-nums md:text-[clamp(1.25rem,3.1vw,3.75rem)]">
                  1,657,382,391
                </p>
                <p className="mt-2 text-xs leading-snug font-bold text-ink/70 md:text-sm">
                  Gigabytes delivered on nowsim
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
