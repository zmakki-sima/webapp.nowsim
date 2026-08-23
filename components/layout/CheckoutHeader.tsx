import { MdLock } from "react-icons/md";

import { NowsimLogo } from "@/components/ui/NowsimLogo";
import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";

export function CheckoutHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 text-ink">
      <div className="pt-[env(safe-area-inset-top)]">
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 border-b border-hairline",
            "bg-white/70 backdrop-blur-xl backdrop-saturate-150",
          )}
        />

        <div className="px-6 md:px-12">
          <div className="relative mx-auto flex h-(--header-height) max-w-6xl items-center justify-between gap-4">
            <Pressable
              href="/"
              hit
              aria-label="nowsim home"
              className="-m-2 shrink-0 rounded-full p-2"
            >
              <NowsimLogo
                id="nowsim-logo-checkout"
                className="h-6 w-auto text-brand md:h-7"
              />
            </Pressable>

            <p className="flex items-center gap-2 text-sm font-bold md:text-base">
              <MdLock aria-hidden className="h-4 w-4 text-success" />
              Secure checkout
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
