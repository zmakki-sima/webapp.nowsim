import type { Money } from "@/lib/money";

export type DestinationKind = "country" | "region" | "global";

export type DestinationFilter = "all" | DestinationKind;

export const destinationKinds: DestinationKind[] = [
  "country",
  "region",
  "global",
];

const filters: DestinationFilter[] = ["all", ...destinationKinds];

export function isDestinationFilter(
  value: string | undefined,
): value is DestinationFilter {
  return value !== undefined && filters.includes(value as DestinationFilter);
}

export function isDestinationKind(
  value: string | undefined,
): value is DestinationKind {
  return value !== undefined && destinationKinds.includes(value as never);
}

export function destinationHref(kind: DestinationKind, slug: string): string {
  return `/destinations/${kind}/${slug}`;
}

export const kindLabels: Record<DestinationKind, string> = {
  country: "Country eSIMs",
  region: "Regional eSIMs",
  global: "Global eSIMs",
};

export type Blurb = {
  lead: string;
  coverage?: string;
  tail: string;
};

export type Plan = {
  id: string;
  data: string;
  unlimited: boolean;
  days: number;
  price: Money;
  legacyId?: string;
};

export type CoveredCountry = {
  name: string;
  art?: string;
  codes?: string[];
};

export type DestinationSummary = {
  slug: string;
  name: string;
  kind: DestinationKind;
  art: string;
  from: Money;
  covers?: number;
  codes?: string[];
  coverage?: string[];
};

export type Destination = DestinationSummary & {
  hero: string;
  blurb: Blurb;
  coversList?: CoveredCountry[];
  plans: Plan[];
  apn?: string;
  operators: string[];
};

export function toSummary(destination: Destination): DestinationSummary {
  const { slug, name, kind, art, from, covers, codes, coverage } = destination;

  return { slug, name, kind, art, from, covers, codes, coverage };
}

export type DeviceGroup = {
  id: string;
  label: string;
  devices: string[];
};

/**
 * `installed` and `issued` both carry a live plan and differ only in whether the
 * profile ever reached a device — upstream `status_qr` is `Enabled` once it has,
 * `Released` while the QR is still outstanding. Keeping them apart is what tells
 * a customer whose card is working from one who still has an install to do.
 */
export type EsimState =
  | "installed"
  | "issued"
  | "ready"
  | "expired"
  | "removed";

export type EsimUsage = {
  usedMb: number;
  totalMb: number;
  leftMb: number;
};

export type PlanRef = {
  destination: string;
  href: string;
  art: string;
  data: string;
  days: number;
};

export type Esim = {
  id: string;
  iccid: string;
  state: EsimState;
  plan?: PlanRef;
  activatedAt?: string;
  expiresAt?: string;
  daysLeft?: number;
  usage?: EsimUsage;
  activationCode?: string;
  qrImage?: string;
  iosTapLink?: string;
  installLocked?: boolean;
  network?: string;
};

export type Purchase = {
  id: string;
  iccid: string;
  plan?: PlanRef;
  price?: Money;
  boughtAt?: string;
  paymentId?: string;
};

export const esimStateLabels: Record<EsimState, string> = {
  installed: "Active",
  issued: "Not installed",
  ready: "Ready to use",
  expired: "Expired",
  removed: "Removed",
};

/** States whose plan is still running, so usage and expiry are worth reading. */
export function isRunningEsim(esim: Esim): boolean {
  return esim.state === "installed" || esim.state === "issued";
}

export function isLiveEsim(esim: Esim): boolean {
  return isRunningEsim(esim) || esim.state === "ready";
}

/**
 * States worth showing the customer on their eSIM list. An expired card is kept
 * because the profile is still installed on the device: a new plan can be
 * written to it at checkout, sparing the customer the install. Only `removed`
 * is dropped — that profile is gone from the SM-DP+ and cannot be written to,
 * which is the same line `listInstallTargets` draws for top-up targets.
 */
export function isReusableEsim(esim: Esim): boolean {
  return esim.state !== "removed";
}
