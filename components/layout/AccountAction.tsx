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
import { cn } from "@/lib/cn";

const trigger = cn(
  "shrink-0 rounded-full bg-brand/12 px-3 py-2.5 sm:px-4 md:px-5",
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

const row = "w-full rounded-control bg-brand/6 px-4 py-3.5 text-base";

const menuBase = cn(
  "w-full justify-between gap-3 rounded-control px-4 py-3.5",
  "text-left text-base",
);

/*
 * Plain `hover:`, not `enabled:hover:` — half these rows are links, and
 * `:enabled` only ever matches form controls, so the anchors silently lost
 * their hover. A disabled Pressable already takes `pointer-events-none`.
 */
const menuItem = cn(
  menuBase,
  "font-semibold",
  "bg-ink-deep/8 text-ink-deep",
  "hover:bg-ink-deep/15 active:bg-ink-deep/15",
);

const menuPrimary = cn(
  menuBase,
  "font-semibold",
  "bg-brand text-white",
  "hover:bg-brand-soft active:bg-brand-soft",
);

const menuLeave = cn(
  menuBase,
  "font-bold",
  "bg-danger/12 text-danger",
  "hover:bg-danger/20 active:bg-danger/20",
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
      className={cn(row, "gap-3 hover:bg-brand/12 active:bg-brand/12")}
    >
      <span className="shrink-0 font-semibold">Yesim User ID</span>

      <span className="min-w-0 flex-1 truncate text-right text-brand">
        {userId}
      </span>

      {copied ? (
        <MdCheck aria-hidden className="h-5 w-5 shrink-0 text-brand" />
      ) : (
        <MdContentCopy aria-hidden className="h-5 w-5 shrink-0 text-brand" />
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
              className={menuPrimary}
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
              className={menuItem}
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
          <MdPerson aria-hidden className="h-5 w-5 shrink-0 text-brand" />
          <p className="min-w-0 flex-1 truncate">{account.email}</p>
        </div>

        <p className="mt-2 text-sm text-muted">
          Your eSIM, QR code and receipt go to this address.
        </p>

        <div className="mt-4">
          <CopyId userId={account.userId} />
        </div>

        <Pressable
          className={cn(
            "mt-6 w-full rounded-control px-5 py-3.5 text-base font-bold",
            "bg-danger/12 text-danger hover:bg-danger/20 active:bg-danger/20",
          )}
        >
          Delete account
        </Pressable>
      </Dialog>
    </>
  );
}
