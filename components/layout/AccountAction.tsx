"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  MdCheck,
  MdContentCopy,
  MdLogout,
  MdPerson,
  MdReceiptLong,
  MdSimCard,
} from "react-icons/md";

import { signOut } from "@/app/actions/auth";
import { SignInDialog } from "@/components/layout/SignInDialog";
import { useAccount, useSetAccount } from "@/components/layout/SessionProvider";
import { Dialog } from "@/components/ui/Dialog";
import { Pressable } from "@/components/ui/Pressable";
import { providerNames } from "@/lib/auth/providers";
import { cn } from "@/lib/cn";

const trigger = cn(
  "rounded-full bg-brand/12 px-4 py-2.5 md:px-5",
  "text-base font-semibold text-brand",
  "hover:bg-brand/20 active:bg-brand/20",
);

export function AccountActionFallback() {
  return (
    <span aria-hidden className={cn(trigger, "inline-flex opacity-70")}>
      Sign in
    </span>
  );
}

const row = "w-full rounded-control bg-white/10 px-4 py-3.5 text-base";

const menuBase = cn(
  "w-full justify-between gap-3 rounded-control px-4 py-3.5",
  "text-left text-base",
);

const menuItem = cn(
  menuBase,
  "font-semibold",
  "bg-white/10 enabled:hover:bg-white/20 enabled:active:bg-white/20",
);

const menuWhite = cn(
  menuBase,
  "font-semibold",
  "bg-white text-ink",
  "enabled:hover:bg-white/85 enabled:active:bg-white/85",
);

const menuLeave = cn(
  menuBase,
  "font-bold",
  "bg-danger/20 text-danger",
  "enabled:hover:bg-danger/30 enabled:active:bg-danger/30",
);

const menuLabel = "flex min-w-0 items-center gap-3";

function CopyId({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), 2000);

    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Pressable
      onClick={copy}
      className={cn(row, "gap-3 hover:bg-white/20 active:bg-white/20")}
    >
      <span className="shrink-0 font-semibold">Yesim User ID</span>

      <span className="min-w-0 flex-1 truncate text-right text-white/70">
        {userId}
      </span>

      {copied ? (
        <MdCheck aria-hidden className="h-5 w-5 shrink-0" />
      ) : (
        <MdContentCopy aria-hidden className="h-5 w-5 shrink-0 text-white/70" />
      )}

      <span className="sr-only">
        {copied ? "Account ID copied" : "Copy account ID"}
      </span>
    </Pressable>
  );
}

export function AccountAction() {
  const account = useAccount();
  const setAccount = useSetAccount();
  const router = useRouter();
  const pathname = usePathname();

  const [view, setView] = useState<"menu" | "details" | null>(null);
  const [leaving, startLeaving] = useTransition();

  const close = useCallback(() => setView(null), []);

  const [seen, setSeen] = useState({ account, pathname });

  if (seen.account !== account || seen.pathname !== pathname) {
    setSeen({ account, pathname });
    setView(null);
  }

  function leave() {
    startLeaving(async () => {
      await signOut();

      setAccount(null);
      close();

      router.refresh();
      router.replace("/");
    });
  }

  if (!account) {
    return (
      <>
        <Pressable
          hit
          aria-haspopup="dialog"
          aria-expanded={view !== null}
          onClick={() => setView("menu")}
          className={trigger}
        >
          Sign in
        </Pressable>

        <SignInDialog open={view !== null} onClose={close} />
      </>
    );
  }

  return (
    <>
      <Pressable
        hit
        aria-haspopup="dialog"
        aria-expanded={view !== null}
        onClick={() => setView("menu")}
        className={cn(
          "h-10 w-10 rounded-full bg-brand/12 text-brand",
          "hover:bg-brand/20 active:bg-brand/20",
        )}
      >
        <MdPerson aria-hidden className="h-5 w-5" />
        <span className="sr-only">Your account</span>
      </Pressable>

      <Dialog open={view === "menu"} onClose={close} title="Your account">
        <ul className="mt-6 flex flex-col gap-3">
          <li>
            {}
            <Pressable
              href="/esims"
              onClick={close}
              className={cn(menuWhite, "hover:bg-white/85 active:bg-white/85")}
            >
              <span className={menuLabel}>
                <MdSimCard aria-hidden className="h-5 w-5 shrink-0" />
                My eSIMs
              </span>
            </Pressable>
          </li>

          <li>
            <Pressable
              aria-haspopup="dialog"
              onClick={() => setView("details")}
              className={menuItem}
            >
              <span className={menuLabel}>
                <MdPerson aria-hidden className="h-5 w-5 shrink-0" />
                Account
              </span>
            </Pressable>
          </li>

          <li>
            {}
            <Pressable
              href="/purchases"
              onClick={close}
              className={cn(menuItem, "hover:bg-white/20 active:bg-white/20")}
            >
              <span className={menuLabel}>
                <MdReceiptLong aria-hidden className="h-5 w-5 shrink-0" />
                Purchase History
              </span>
            </Pressable>
          </li>

          <li>
            <Pressable onClick={leave} disabled={leaving} className={menuLeave}>
              <span className={menuLabel}>
                <MdLogout aria-hidden className="h-5 w-5 shrink-0" />
                {leaving ? "Logging out…" : "Log out"}
              </span>
            </Pressable>
          </li>
        </ul>
      </Dialog>

      <Dialog
        open={view === "details"}
        onClose={close}
        onBack={() => setView("menu")}
        title="Account"
      >
        <div className={cn(row, "mt-6 flex items-center gap-3")}>
          <MdPerson aria-hidden className="h-5 w-5 shrink-0 text-white/55" />
          <p className="min-w-0 flex-1 truncate">{account.email}</p>
        </div>

        <p className="mt-2 text-sm text-white/55">
          Signed in via {providerNames[account.provider]}. Your eSIM, QR code
          and receipt go to this address.
        </p>

        <div className="mt-4">
          <CopyId userId={account.userId} />
        </div>

        <Pressable
          className={cn(
            "mt-6 w-full rounded-control px-5 py-3.5 text-base font-bold",
            "bg-danger/20 text-danger hover:bg-danger/30 active:bg-danger/30",
          )}
        >
          Delete account
        </Pressable>
      </Dialog>
    </>
  );
}
