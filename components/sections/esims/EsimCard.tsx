"use client";

import Image from "next/image";
import { useState } from "react";
import {
  MdAdd,
  MdCheck,
  MdMailOutline,
  MdQrCode2,
  MdSimCard,
} from "react-icons/md";

import { emailEsim, type MailState } from "@/app/actions/esims";
import { InstallDialog } from "@/components/sections/esims/InstallDialog";
import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";
import {
  esimStateLabels,
  isLiveEsim,
  type Esim,
  type EsimState,
} from "@/lib/types";
import { formatData, formatDay } from "@/lib/units";

const pill = cn(
  "shrink-0 rounded-full px-3 py-1",
  "text-[0.8125rem]/[1.125rem] font-bold",
);

const spec = cn(
  "shrink-0 rounded-full px-2.5 py-0.5",
  "text-[0.8125rem]/[1.125rem] font-medium text-brand",
  /* Brand-tinted, not grey — greys go muddy on the lilac card. */
  "bg-brand/10",
);

const pillTone: Record<EsimState, string> = {
  installed: "bg-success/12 text-success",
  issued: "bg-ink/8 text-muted",
  ready: "bg-brand/15 text-brand",
  expired: "bg-ink/8 text-muted",
  removed: "bg-danger/15 text-danger",
};

const action = cn(
  "rounded-full border border-transparent px-5 py-2.5 text-sm font-bold",
);

const primary = cn(
  action,
  "gap-2 bg-brand text-white",
  "hover:bg-brand-deep active:bg-brand-deep",
);

const secondary = cn(
  action,
  "border-brand bg-brand/10 text-brand",
  "hover:bg-brand/20 active:bg-brand/20",
);

const quiet = cn(action, "border-hairline bg-transparent text-muted");

const factLabel = "text-[0.8125rem]/[1.125rem] text-muted";

const factValue = "mt-0.5 text-base font-bold tracking-[-0.01em]";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={factLabel}>{label}</dt>
      <dd className={factValue}>{value}</dd>
    </div>
  );
}

export function EsimCard({ esim }: { esim: Esim }) {
  const [installing, setInstalling] = useState(false);
  const [mailing, setMailing] = useState(false);
  const [mail, setMail] = useState<MailState | null>(null);
  // A resend can be interrupted by a stale session. The dialog it borrows is
  // the install one, so remember whose confirmation this is — otherwise a
  // correct code lands the customer in install details they never asked for.
  const [confirmingMail, setConfirmingMail] = useState(false);

  const { plan, usage, state } = esim;

  // Sticky for the life of the page. A mail that has left is not worth sending
  // twice, and the send is rate limited on the server regardless — the button
  // should stop asking rather than let someone lean on it.
  const sent = Boolean(mail?.ok);

  const spent = usage ? Math.round((usage.usedMb / usage.totalMb) * 100) : 0;

  const live = isLiveEsim(esim);

  const installable = Boolean(
    esim.qrImage || esim.activationCode || esim.installLocked,
  );

  // An expired card still holds its profile, so the customer can buy a new plan
  // onto it and skip the install. Checkout does the actual picking; this only
  // sends them there with the plan browser open.
  const expired = state === "expired";

  /**
   * `retry` marks the send that follows a confirmation. A second lock there
   * would mean the fresh session did not take, so it reports the failure rather
   * than reopening the dialog the customer just cleared.
   */
  async function sendEmail(retry = false) {
    setMailing(true);
    setMail(null);

    const result = await emailEsim(esim.id);

    setMailing(false);

    if (result.locked) {
      if (retry) {
        setMail({ ok: false, error: "We could not confirm it was you. Try again." });

        return;
      }

      setConfirmingMail(true);
      setInstalling(true);

      return;
    }

    setMail(result);
  }

  // The code checked out, so finish the send that was interrupted and close the
  // dialog behind it. The customer asked for an email, not for a QR code.
  function onMailConfirmed() {
    setConfirmingMail(false);
    setInstalling(false);
    void sendEmail(true);
  }

  return (
    <li className="rounded-sheet bg-surface-soft p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          {plan?.art ? (
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-brand/10">
              <Image
                src={plan.art}
                alt=""
                fill
                quality={90}
                sizes="44px"
                unoptimized={plan.art.endsWith(".svg")}
                className="object-cover"
              />
            </span>
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10">
              <MdSimCard aria-hidden className="h-5 w-5 text-muted" />
            </span>
          )}

          <div className="min-w-0">
            <h3 className="truncate text-h3">
              {plan ? `${plan.destination} eSIM` : "eSIM"}
            </h3>

            {plan && (
              <p className="mt-2 flex flex-wrap items-center gap-2">
                <span className={spec}>{plan.data}</span>
                <span className={spec}>
                  {plan.days} day{plan.days === 1 ? "" : "s"}
                </span>
              </p>
            )}
          </div>
        </div>

        <span className={cn(pill, pillTone[state])}>
          {esimStateLabels[state]}
        </span>
      </div>

      {usage && (
        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-base font-bold tracking-[-0.01em]">
              {formatData(usage.leftMb)} left
            </p>

            <p className="text-sm text-muted">
              {formatData(usage.usedMb)} of {formatData(usage.totalMb)} used
            </p>
          </div>

          <div
            role="progressbar"
            aria-label="Data used"
            aria-valuenow={spent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-2 h-2 overflow-hidden rounded-full bg-brand/12"
          >
            <div
              className={cn(
                "h-full rounded-full",
                live ? "bg-success" : "bg-ink/25",
              )}
              style={{ width: `${Math.min(Math.max(spent, 0), 100)}%` }}
            />
          </div>
        </div>
      )}

      {(esim.activatedAt || esim.expiresAt || esim.network) && (
        <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-4">
          {esim.activatedAt && (
            <Fact label="Activated" value={formatDay(esim.activatedAt)} />
          )}

          {esim.expiresAt && (
            <Fact
              label={state === "expired" ? "Expired" : "Expires"}
              value={
                esim.daysLeft === undefined
                  ? formatDay(esim.expiresAt)
                  : `${formatDay(esim.expiresAt)} · ${esim.daysLeft} day${esim.daysLeft === 1 ? "" : "s"} left`
              }
            />
          )}

          {esim.network && <Fact label="Last network" value={esim.network} />}
        </dl>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {expired && (
          <Pressable href="/destinations" className={primary}>
            <MdAdd aria-hidden className="h-4 w-4" />
            Add a new plan
          </Pressable>
        )}

        {installable && (
          <>
            <Pressable
              aria-haspopup="dialog"
              aria-expanded={installing}
              onClick={() => setInstalling(true)}
              className={expired ? secondary : primary}
            >
              <MdQrCode2 aria-hidden className="h-4 w-4" />
              Install details
            </Pressable>

            {/* The profile is already on the device once a plan has expired;
                re-sending the install mail has nothing left to tell them. */}
            {!expired && (
              <Pressable
                onClick={() => void sendEmail()}
                disabled={mailing || sent}
                /* Stays disabled for the life of the page: one mail per visit
                   is enough, and the confirmation reads as spent rather than
                   as a button asking to be pressed again. */
                title={
                  sent && mail?.email
                    ? mail.throttled
                      ? `Already sent to ${mail.email}. Check your inbox.`
                      : `Install details sent to ${mail.email}.`
                    : undefined
                }
                className={cn(
                  mailing || sent ? quiet : secondary,
                  "gap-2 sm:ml-auto",
                )}
              >
                {sent ? (
                  <MdCheck aria-hidden className="h-4 w-4" />
                ) : (
                  <MdMailOutline aria-hidden className="h-4 w-4" />
                )}
                {sent
                  ? mail?.throttled
                    ? "Already sent"
                    : "Sent"
                  : mailing
                    ? "Sending…"
                    : "Resend email"}
              </Pressable>
            )}
          </>
        )}
      </div>

      {/* Announced only — the visible confirmation is the button itself, which
          a screen reader will not re-read when its label swaps to "Sent". */}
      {sent && mail?.email ? (
        <p role="status" className="sr-only">
          {mail.throttled
            ? `Already sent to ${mail.email}. Check your inbox.`
            : `Install details sent to ${mail.email}.`}
        </p>
      ) : null}

      {mail?.error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          {mail.error}
        </p>
      ) : null}

      <InstallDialog
        esim={esim}
        open={installing}
        onClose={() => {
          setInstalling(false);
          setConfirmingMail(false);
        }}
        confirm={
          confirmingMail
            ? {
                reason: "before emailing it again",
                submitLabel: "Send the email",
                onConfirmed: onMailConfirmed,
              }
            : undefined
        }
      />
    </li>
  );
}
