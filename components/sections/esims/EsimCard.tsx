"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MdCheck, MdMailOutline, MdQrCode2, MdSimCard } from "react-icons/md";

import { emailEsim, type MailState } from "@/app/actions/esims";
import {
  cardPill,
  cardPillTone,
  cardSpec,
  Fact,
} from "@/components/common/CardFact";
import { InstallDialog } from "@/components/sections/esims/InstallDialog";
import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/cn";
import { ESIM_MAIL_COOLDOWN_SECONDS } from "@/lib/mail/cooldown";
import { esimStateLabels, isLiveEsim, type Esim } from "@/lib/types";
import { formatData, formatDay } from "@/lib/units";

/* Full width only on a narrow phone, where the pair cannot share a row and two
   half-empty pills read as a broken column. Above that they size to their label
   and wrap on their own when they run out of room. */
const action = cn(
  "rounded-full border border-transparent px-5 py-2.5 text-sm font-bold",
  "w-full min-[480px]:w-auto",
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

/* Both spent states stay solid chips. A disabled button left to fade out reads
   as the control having vanished rather than as a confirmation in its place. */
const pending = cn(secondary, "disabled:opacity-100");

const done = cn(
  action,
  /* Same brand family as the live button, dialled down — spent, not a
     different meaning. */
  "border-brand/20 bg-brand/8 text-brand/60",
  "disabled:opacity-100",
);

export function EsimCard({ esim }: { esim: Esim }) {
  const [installing, setInstalling] = useState(false);
  const [mailing, setMailing] = useState(false);
  const [mail, setMail] = useState<MailState | null>(null);
  // A resend can be interrupted by a stale session. The dialog it borrows is
  // the install one, so remember whose confirmation this is — otherwise a
  // correct code lands the customer in install details they never asked for.
  const [confirmingMail, setConfirmingMail] = useState(false);

  const { plan, usage, state } = esim;

  // Spent while the server would refuse a second send anyway, so the button
  // stops asking rather than letting someone lean on it.
  const sent = Boolean(mail?.ok);

  // ...and comes back when the cooldown is up, because a customer whose mail
  // never arrived has no other way to ask for it again. A throttled reply rode
  // an older lock, so its window is shorter than this — waiting the full one
  // only means the retry is certain to go through.
  useEffect(() => {
    if (!mail?.ok) return;

    const timer = setTimeout(
      () => setMail(null),
      ESIM_MAIL_COOLDOWN_SECONDS * 1000,
    );

    return () => clearTimeout(timer);
  }, [mail]);

  const spent = usage ? Math.round((usage.usedMb / usage.totalMb) * 100) : 0;

  const live = isLiveEsim(esim);

  const installable = Boolean(
    esim.qrImage || esim.activationCode || esim.installLocked,
  );

  // An expired card is a receipt, not a control. Its profile is already on the
  // device, and topping it up starts at checkout — which picks the eSIM itself
  // — so the card carries no actions at all.
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
                <span className={cardSpec}>{plan.data}</span>
                <span className={cardSpec}>
                  {plan.days} day{plan.days === 1 ? "" : "s"}
                </span>
              </p>
            )}
          </div>
        </div>

        <span className={cn(cardPill, cardPillTone[state])}>
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

      {/* Dates and network only tell the customer something while the plan can
          still be used. Once it is spent the chip already says so, and the rest
          is history they did not ask for. */}
      {!expired && (esim.activatedAt || esim.expiresAt || esim.network) && (
        <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-4">
          {esim.activatedAt && (
            <Fact label="Activated" value={formatDay(esim.activatedAt)} />
          )}

          {esim.expiresAt && (
            <Fact
              label="Expires"
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

      {!expired && installable && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Pressable
            aria-haspopup="dialog"
            aria-expanded={installing}
            onClick={() => setInstalling(true)}
            className={primary}
          >
            <MdQrCode2 aria-hidden className="h-4 w-4" />
            Install details
          </Pressable>

          <Pressable
            onClick={() => void sendEmail()}
            disabled={mailing || sent}
            /* Disabled until the server's cooldown is up, so the confirmation
               reads as spent rather than as a button asking to be pressed
               again. */
            title={
              sent && mail?.email
                ? mail.throttled
                  ? `Already sent to ${mail.email}. Check your inbox.`
                  : `Install details sent to ${mail.email}.`
                : undefined
            }
            className={cn(
              sent ? done : mailing ? pending : secondary,
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
        </div>
      )}

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
