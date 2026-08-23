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

export type EsimState = "active" | "ready" | "expired" | "removed";

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
  active: "Active",
  ready: "Ready to use",
  expired: "Expired",
  removed: "Removed",
};

export function isLiveEsim(esim: Esim): boolean {
  return esim.state === "active" || esim.state === "ready";
}
