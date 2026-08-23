import type { ApiEsim, ApiOrder, ApiPlan } from "@/lib/api/schemas";
import { blurbFor } from "@/lib/copy";
import { heroFor } from "@/lib/heroes";
import { money, type Money } from "@/lib/money";
import { slugify } from "@/lib/slugify";
import type {
  CoveredCountry,
  Destination,
  DestinationKind,
  Esim,
  EsimState,
  EsimUsage,
  Plan,
  PlanRef,
  Purchase,
} from "@/lib/types";

const collator = new Intl.Collator("en");

const excludedCountries = new Set(["israel"]);

const excludedCodes = new Set(["il", "isr"]);

function isExcludedCountry(name: string): boolean {
  return excludedCountries.has(name.trim().toLowerCase());
}

function isExcludedCountryPlan(plan: ApiPlan): boolean {
  return (
    plan.countries_included.some(isExcludedCountry) ||
    plan.countryIso2.some((code) => excludedCodes.has(code.toLowerCase())) ||
    plan.iso3.some((code) => excludedCodes.has(code.toLowerCase())) ||
    isExcludedCountry(destinationName(plan.name))
  );
}

export function destinationName(planName: string): string {
  const [beforeDigit] = planName.split(/\d/);

  const cleaned = (beforeDigit ?? "")
    .replace(/[_\-–—|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || planName.trim();
}

const regionNames: Record<string, string> = {
  latam: "Latin America",
  "latin america": "Latin America",
  asia: "Asia Pacific",
  "asia pacific": "Asia Pacific",
  "middle east": "Middle East",
  sea: "South East Asia",
  cis: "Eurasia",
};

function regionName(name: string): string {
  return regionNames[name.trim().toLowerCase()] ?? name;
}

const countryNames: Record<string, string> = {
  "palestinian territory": "Palestine",
  "russian federation": "Russia",
};

function countryName(name: string): string {
  return countryNames[name.trim().toLowerCase()] ?? name;
}

function kindOf(plan: ApiPlan): DestinationKind {
  if (plan.plan_type === "country") return "country";

  return /global/i.test(plan.name) ? "global" : "region";
}

function groupKey(plan: ApiPlan, kind: DestinationKind): string {
  if (kind === "country") {
    return `country:${plan.countryIso2[0]?.toUpperCase() ?? destinationName(plan.name).toLowerCase()}`;
  }

  return `${kind}:${regionName(destinationName(plan.name)).toLowerCase()}`;
}

function displayName(plan: ApiPlan, kind: DestinationKind): string {
  if (kind === "country" && plan.countries_included.length === 1) {
    return countryName(plan.countries_included[0]);
  }

  return regionName(destinationName(plan.name));
}

function planPrice(plan: ApiPlan): Money {
  return money(Math.round(plan.retail_price * 100), plan.currency);
}

const UNLIMITED = "Unlimited";

function dataLabel(plan: ApiPlan): string {
  const raw = plan.data.trim();

  if (!raw || /^unlimited$/i.test(raw)) return UNLIMITED;

  return `${raw} ${plan.data_unit}`.trim();
}

function toPlan(plan: ApiPlan): Plan {
  const data = dataLabel(plan);

  return {
    id: plan.id,
    data,
    unlimited: data === UNLIMITED,
    days: plan.days,
    price: planPrice(plan),
    legacyId: plan.old_id ?? undefined,
  };
}

function byGroupThenPrice(a: Plan, b: Plan): number {
  return (
    Number(a.unlimited) - Number(b.unlimited) ||
    a.price.amount - b.price.amount ||
    a.days - b.days
  );
}

function cheapest(plans: Plan[]): Money {
  return plans.reduce(
    (lowest, plan) => (plan.price.amount < lowest.amount ? plan.price : lowest),
    plans[0].price,
  );
}

type CountryFacts = { art?: string; codes?: string[] };

function factsByCountry(apiPlans: ApiPlan[]): Map<string, CountryFacts> {
  const facts = new Map<string, CountryFacts>();

  for (const plan of apiPlans) {
    if (plan.countries_included.length !== 1) continue;

    const key = countryName(plan.countries_included[0]).toLowerCase();
    const codes = [...plan.countryIso2, ...plan.iso3]
      .filter(Boolean)
      .map((code) => code.toLowerCase());

    const existing = facts.get(key) ?? {};

    facts.set(key, {
      art: plan.image || existing.art,
      codes: codes.length ? codes : existing.codes,
    });
  }

  return facts;
}

function coverageOf(
  apiPlans: ApiPlan[],
  facts: Map<string, CountryFacts>,
): CoveredCountry[] {
  const names = new Set<string>();

  for (const plan of apiPlans) {
    for (const country of plan.countries_included) {
      if (!isExcludedCountry(country)) names.add(countryName(country));
    }
  }

  return [...names].sort(collator.compare).map((name) => {
    const known = facts.get(name.toLowerCase());

    return {
      name,
      art: known?.art,
      codes: known?.codes,
    } satisfies CoveredCountry;
  });
}

function codesOf(apiPlans: ApiPlan[]): string[] {
  const codes = new Set<string>();

  for (const plan of apiPlans) {
    for (const code of [...plan.countryIso2, ...plan.iso3]) {
      if (code) codes.add(code.toLowerCase());
    }
  }

  return [...codes];
}

function operatorsOf(apiPlans: ApiPlan[]): string[] {
  const names = new Set<string>();

  for (const plan of apiPlans) {
    for (const operator of plan.operators) names.add(operator);
  }

  return [...names].sort(collator.compare);
}

function build(
  kind: DestinationKind,
  apiPlans: ApiPlan[],
  facts: Map<string, CountryFacts>,
): Destination {
  const first = apiPlans[0];
  const name = displayName(first, kind);
  const slug = slugify(name);

  const plans = apiPlans.map(toPlan).sort(byGroupThenPrice);

  const coversList = coverageOf(apiPlans, facts);
  const covers = kind === "country" ? undefined : coversList.length;

  return {
    slug,
    name,
    kind,
    art: first.image,
    from: cheapest(plans),
    covers,
    codes: kind === "country" ? codesOf(apiPlans) : undefined,
    coverage:
      kind === "country" ? undefined : coversList.map((entry) => entry.name),
    hero: heroFor(kind, slug),
    blurb: blurbFor({ name, kind, covers }),
    coversList: kind === "country" ? undefined : coversList,
    plans,
    apn: first.apn,
    operators: operatorsOf(apiPlans),
  };
}

const DAY_MS = 86_400_000;

const YESIM_STAMP = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

function toIso(value: string | null | undefined): string | undefined {
  const raw = value?.trim();

  if (!raw) return undefined;

  const parsed = Date.parse(
    YESIM_STAMP.test(raw) ? `${raw.replace(" ", "T")}Z` : raw,
  );

  return Number.isNaN(parsed) ? undefined : new Date(parsed).toISOString();
}

function clamp(value: number, max: number): number {
  return Math.min(Math.max(value, 0), max);
}

function toUsage(esim: ApiEsim): EsimUsage | undefined {
  const totalMb = esim.data_package_mb ?? 0;

  if (totalMb <= 0) return undefined;

  const leftMb = clamp(
    esim.data_left_mb ?? totalMb - (esim.data_used_mb ?? 0),
    totalMb,
  );

  const usedMb = clamp(esim.data_used_mb ?? totalMb - leftMb, totalMb);

  return { usedMb, totalMb, leftMb };
}

function toState(
  esim: ApiEsim,
  expiresAt: string | undefined,
  now: number,
): EsimState {
  if (String(esim.is_deleted ?? "0") === "1") return "removed";

  if ((esim.status_qr ?? "").toLowerCase() === "deleted") return "removed";

  if (expiresAt) return Date.parse(expiresAt) > now ? "active" : "expired";

  return esim.active_plan_id ? "active" : "ready";
}

const stateRank: Record<EsimState, number> = {
  active: 0,
  ready: 1,
  expired: 2,
  removed: 3,
};

function byUrgency(a: Esim, b: Esim): number {
  const rank = stateRank[a.state] - stateRank[b.state];

  if (rank !== 0) return rank;

  const left = Date.parse(a.expiresAt ?? a.activatedAt ?? "") || 0;
  const right = Date.parse(b.expiresAt ?? b.activatedAt ?? "") || 0;

  return a.state === "active" ? left - right : right - left;
}

export function toEsims(
  apiEsims: ApiEsim[],
  plans: Map<string, PlanRef>,
  now: number = Date.now(),
): Esim[] {
  return apiEsims
    .map((esim) => {
      const expiresAt = toIso(esim.plan_expired_at);
      const state = toState(esim, expiresAt, now);

      return {
        id: esim.id,
        iccid: esim.iccid,
        state,
        plan: esim.active_plan_id ? plans.get(esim.active_plan_id) : undefined,
        activatedAt: toIso(esim.plan_activated_at),
        expiresAt,
        daysLeft:
          state === "active" && expiresAt
            ? Math.max(Math.ceil((Date.parse(expiresAt) - now) / DAY_MS), 0)
            : undefined,
        usage: toUsage(esim),
        activationCode: esim.qrcode ?? undefined,
        qrImage: esim.img ?? undefined,
        iosTapLink: esim.ios_tap_link ?? undefined,
        network: esim.networkinfo?.lastRat ?? undefined,
      } satisfies Esim;
    })
    .sort(byUrgency);
}

function stampOf(purchase: Purchase): number {
  const parsed = Date.parse(purchase.boughtAt ?? "");

  return Number.isNaN(parsed) ? 0 : parsed;
}

function byNewest(a: Purchase, b: Purchase): number {
  return stampOf(b) - stampOf(a);
}

export function toPurchases(
  apiOrders: ApiOrder[],
  plans: Map<string, PlanRef>,
): Purchase[] {
  return apiOrders
    .map((order) => {
      const cost = order.cost_eur;

      return {
        id: order.id,
        iccid: order.iccid,
        plan: order.plan_id ? plans.get(order.plan_id) : undefined,
        price:
          cost === null || cost === undefined
            ? undefined
            : money(Math.round(cost * 100), "EUR"),
        boughtAt: toIso(order.created_at),
        paymentId: order.payment_id ?? undefined,
      } satisfies Purchase;
    })
    .sort(byNewest);
}

export function toDestinations(apiPlans: ApiPlan[]): Destination[] {
  const facts = factsByCountry(apiPlans);

  const groups = new Map<string, { kind: DestinationKind; plans: ApiPlan[] }>();

  for (const plan of apiPlans) {
    const kind = kindOf(plan);

    if (kind === "country" && isExcludedCountryPlan(plan)) continue;

    const key = groupKey(plan, kind);

    const bucket = groups.get(key);

    if (bucket) bucket.plans.push(plan);
    else groups.set(key, { kind, plans: [plan] });
  }

  return [...groups.values()]
    .map(({ kind, plans }) => build(kind, plans, facts))
    .sort((a, b) => collator.compare(a.name, b.name));
}
