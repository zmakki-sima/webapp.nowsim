"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  MdAddCircleOutline,
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
  "text-[0.8125rem]/[1.125rem] font-medium text-muted",
  "bg-brand/10",
);

const pillTone: Record<EsimState, string> = {
  active: "bg-success/12 text-success",
  ready: "bg-brand/15 text-brand",
  expired: "bg-ink/8 text-muted",
  removed: "bg-ink/8 text-muted",
};

const action = cn("rounded-full px-5 py-2.5 text-sm font-bold");

const primary = cn(
  action,
  "gap-2 bg-brand text-white",
  "hover:bg-brand-deep active:bg-brand-deep",
);

const secondary = cn(
  action,
  "bg-surface text-ink",
  "hover:bg-surface/70 active:bg-surface/70",
);

const quiet = cn(action, "bg-surface/60 text-muted");

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

  const { plan, usage, state } = esim;

  const spent = usage ? Math.round((usage.usedMb / usage.totalMb) * 100) : 0;

  const live = isLiveEsim(esim);

  const installable = Boolean(
    esim.qrImage || esim.activationCode || esim.installLocked,
  );

  useEffect(() => {
    if (!mail?.ok) return;

    const timer = setTimeout(() => setMail(null), 6000);

    return () => clearTimeout(timer);
  }, [mail]);

  async function sendEmail() {
    setMailing(true);
    setMail(null);

    const result = await emailEsim(esim.id);

    setMailing(false);

    if (result.locked) {
      setInstalling(true);

      return;
    }

    setMail(result);
  }

  return (
    <li className="rounded-sheet bg-brand/6 p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          {plan?.art ? (
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-brand/12">
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
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/12">
              <MdSimCard aria-hidden className="h-5 w-5 text-brand" />
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
            className="mt-2 h-2 overflow-hidden rounded-full bg-brand/15"
          >
            <div
              className={cn(
                "h-full rounded-full",
                live ? "bg-brand" : "bg-ink/25",
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
              label={state === "active" ? "Expires" : "Expired"}
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
        {installable && (
          <>
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
              onClick={sendEmail}
              disabled={mailing || mail?.ok}
              className={cn(mailing || mail?.ok ? quiet : secondary, "gap-2")}
            >
              {mail?.ok ? (
                <MdCheck aria-hidden className="h-4 w-4" />
              ) : (
                <MdMailOutline aria-hidden className="h-4 w-4" />
              )}
              {mail?.ok ? "Sent" : mailing ? "Sending…" : "Resend email"}
            </Pressable>
          </>
        )}

        {plan && (
          <Pressable
            href={plan.href}
            className={cn(secondary, "gap-2 sm:ml-auto")}
          >
            <MdAddCircleOutline aria-hidden className="h-4 w-4" />
            Top up {plan.destination}
          </Pressable>
        )}
      </div>

      {mail?.ok && mail.email ? (
        <p className="mt-3 text-sm text-muted">
          {mail.throttled
            ? `Already sent to ${mail.email}. Check your inbox`
            : `Install details sent to ${mail.email}`}
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
        onClose={() => setInstalling(false)}
      />
    </li>
  );
}
