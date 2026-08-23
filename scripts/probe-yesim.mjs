import fs from "node:fs/promises";
import path from "node:path";

const BASE = process.env.YESIM_API_BASE ?? "https://partners-api.yesim.biz";
const TOKEN = process.env.YESIM_API_TOKEN;
const OUT = path.join(process.cwd(), "lib", "api", "__fixtures__");

const redact = (value) =>
  String(value).replace(/((?:token|api_key)=)[^&\s"']+/gi, "$1[redacted]");

if (!TOKEN) {
  console.error("YESIM_API_TOKEN is not set.");
  console.error("Run with: node --env-file=.env.local scripts/probe-yesim.mjs");
  process.exit(1);
}

async function get(endpoint) {
  const url = new URL(endpoint, `${BASE}/`);
  url.searchParams.set("token", TOKEN);

  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`${endpoint} → ${response.status}\n${redact(text.slice(0, 400))}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${endpoint} returned non-JSON:\n${redact(text.slice(0, 400))}`);
  }
}

async function save(name, payload) {
  await fs.mkdir(OUT, { recursive: true });
  const file = path.join(OUT, `${name}.json`);
  await fs.writeFile(file, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`saved ${path.relative(process.cwd(), file)}`);
}

function report(plans) {
  console.log(`\n--- ${plans.length} plans ---\n`);

  const byType = {};
  for (const plan of plans) {
    byType[plan.plan_type] = (byType[plan.plan_type] ?? 0) + 1;
  }
  console.log("plan_type counts:", byType);

  const currencies = new Set(plans.map((plan) => plan.currency));
  console.log("currencies:", [...currencies]);

  const dataUnits = new Set(plans.map((plan) => plan.data_unit));
  console.log("data_units:", [...dataUnits]);

  const multiCountry = plans.filter(
    (plan) =>
      plan.plan_type === "country" && (plan.countries_included?.length ?? 0) > 1,
  );
  console.log(
    `country plans listing >1 country: ${multiCountry.length}`,
    multiCountry.length ? "← grouping by countries_included[0] is unsafe" : "",
  );

  const hasCountryName = plans.some((plan) =>
    plan.countries_included?.some((country) => country.name),
  );
  console.log(
    `countries_included carries a name field: ${hasCountryName}`,
    hasCountryName ? "" : "← mappers fall back to Intl.DisplayNames(iso2)",
  );

  const regionNames = [
    ...new Set(
      plans
        .filter((plan) => plan.plan_type === "region")
        .map((plan) => plan.name),
    ),
  ];
  console.log(`\nregion plan names (${regionNames.length}). The grouping key:`);
  for (const name of regionNames.slice(0, 40)) console.log("  ", name);

  const globals = regionNames.filter((name) => /global/i.test(name));
  console.log(`\nnames matching /global/i: ${globals.length}`);
  for (const name of globals) console.log("  ", name);

  console.log("\nfirst plan verbatim:");
  console.log(JSON.stringify(plans[0], null, 2));
}

const plans = await get("plans").then((body) =>
  Array.isArray(body) ? body : (body.plans ?? body.data ?? []),
);

await save("plans", plans);
report(plans);

try {
  const devices = await get("supported_devices");
  await save("supported-devices", devices);
  console.log("\n--- supported_devices shape ---");
  console.log(JSON.stringify(devices, null, 2).slice(0, 1200));
} catch (error) {
  console.warn(`\nsupported_devices probe failed: ${redact(error.message)}`);
}
