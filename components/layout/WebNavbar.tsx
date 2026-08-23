"use client";

import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useId, useState } from "react";

import { NowsimLogo } from "@/components/ui/NowsimLogo";
import { Pressable } from "@/components/ui/Pressable";
import {
  AccountAction,
  AccountActionFallback,
} from "@/components/layout/AccountAction";
import { cn } from "@/lib/cn";

import { MenuPanel, MenuToggle } from "@/components/layout/MobileMenu";

const HOME = "/";

const navLinks = [
  { label: "Countries", href: "/destinations?kind=country" },
  { label: "Regions", href: "/destinations?kind=region" },
  { label: "Global", href: "/destinations?kind=global" },
  { label: "Help", href: "/help" },
];

function useScrolled(pathname: string) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    function measure() {
      frame = 0;
      setScrolled(Math.max(window.scrollY, 0) > 8);
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(measure);
    }

    function onPageShow() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }

    onPageShow();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pageshow", onPageShow);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [pathname]);

  return scrolled;
}

export function WebNavbar() {
  const pathname = usePathname();
  const scrolled = useScrolled(pathname);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const [seenPath, setSeenPath] = useState(pathname);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 text-ink">
        <div className="pt-[env(safe-area-inset-top)]">
          <div
            aria-hidden
            className={cn(
              "absolute inset-0 border-b border-hairline",
              "bg-white/70 backdrop-blur-xl backdrop-saturate-150",
              "transition-opacity duration-300 ease-hover motion-reduce:transition-none",
              scrolled || pathname !== HOME ? "opacity-100" : "opacity-0",
            )}
          />

          <div className="px-6 md:px-12">
            <div className="relative mx-auto flex h-(--header-height) max-w-7xl items-center justify-between">
              <Pressable
                href="/"
                hit
                aria-label="nowsim home"
                className="-m-2 shrink-0 rounded-full p-2"
              >
                <NowsimLogo
                  id="nowsim-logo-header"
                  className="h-6 w-auto text-brand md:h-7"
                />
              </Pressable>

              <nav
                aria-label="Main"
                className="absolute left-1/2 hidden -translate-x-1/2 md:block"
              >
                <ul className="flex items-center gap-1">
                  {navLinks.map((link) => (
                    <li key={link.label}>
                      <Pressable
                        href={link.href}
                        hit
                        className={cn(
                          "rounded-full px-4 py-2.5 text-base font-medium",
                          "hover:bg-brand/6 active:bg-brand/10",
                        )}
                      >
                        {link.label}
                      </Pressable>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="flex items-center gap-3 md:gap-4">
                <Suspense fallback={<AccountActionFallback />}>
                  <AccountAction />
                </Suspense>

                <MenuToggle
                  open={open}
                  onToggle={() => setOpen((value) => !value)}
                  panelId={panelId}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <MenuPanel
        links={navLinks}
        open={open}
        onClose={close}
        panelId={panelId}
      />
    </>
  );
}
