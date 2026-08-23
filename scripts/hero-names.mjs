import fs from "node:fs/promises";
import path from "node:path";

const BASE = process.env.YESIM_API_BASE ?? "https://partners-api.yesim.biz";
const TOKEN = process.env.YESIM_API_TOKEN;
const OUT = path.join(process.cwd(), "docs", "hero-names");

const folders = {
  country: "countries",
  region: "regions",
  global: "global",
};

if (!TOKEN) {
  console.error("YESIM_API_TOKEN is not set.");
  console.error("Run with: node --env-file=.env.local scripts/hero-names.mjs");
  process.exit(1);
}

const collator = new Intl.Collator("en");

const csv = (value) =>
  String(value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

function destinationName(planName) {
  const [beforeDigit] = planName.split(/\d/);

  const cleaned = (beforeDigit ?? "")
    .replace(/[_\-–—|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || planName.trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function kindOf(plan) {
  if (plan.plan_type === "country") return "country";

  return /global/i.test(plan.name) ? "global" : "region";
}

function groupKey(plan, kind) {
  if (kind === "country") {
    const iso = csv(plan.countryIso2)[0];

    return `country:${iso ? iso.toUpperCase() : destinationName(plan.name).toLowerCase()}`;
  }

  return `${kind}:${destinationName(plan.name).toLowerCase()}`;
}

function displayName(plan, kind) {
  const included = csv(plan.countries_included);

  if (kind === "country" && included.length === 1) return included[0];

  return destinationName(plan.name);
}

const url = new URL("plans", `${BASE}/`);
url.searchParams.set("token", TOKEN);

const response = await fetch(url, {
  headers: { accept: "application/json" },
  signal: AbortSignal.timeout(30_000),
});

if (!response.ok) {
  console.error(`plans → ${response.status}`);
  process.exit(1);
}

const plans = await response.json();

const groups = new Map();

for (const plan of plans) {
  const kind = kindOf(plan);
  const key = groupKey(plan, kind);

  if (!groups.has(key)) groups.set(key, { kind, plan });
}

const byKind = { country: [], region: [], global: [] };

for (const { kind, plan } of groups.values()) {
  const name = displayName(plan, kind);

  byKind[kind].push({ name, slug: slugify(name) });
}

await fs.mkdir(OUT, { recursive: true });

const stamp = new Date().toISOString().slice(0, 10);

for (const [kind, rows] of Object.entries(byKind)) {
  rows.sort((a, b) => collator.compare(a.name, b.name));

  const width = Math.max(...rows.map((row) => row.slug.length), 0);

  const lines = [
    `# ${rows.length} ${kind} destinations. Generated ${stamp}`,
    `# Drop the photo in public/images/${folders[kind]}/ named after the first`,
    `# column: <slug>.jpg (.jpeg .png .webp .avif also work). Anything without a`,
    `# file falls back to the placeholder. Restart the dev server after adding.`,
    "",
    ...rows.map((row) => `${row.slug.padEnd(width)}  ${row.name}`),
    "",
  ];

  const file = path.join(OUT, `${folders[kind]}.txt`);

  await fs.writeFile(file, lines.join("\n"), "utf8");

  console.log(`${path.relative(process.cwd(), file)}. ${rows.length}`);
}