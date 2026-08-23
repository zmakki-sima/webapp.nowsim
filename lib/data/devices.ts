import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import {
  supportedDevicesResponseSchema,
  type ApiDeviceType,
} from "@/lib/api/schemas";
import { fetchYesim } from "@/lib/api/yesim";
import { slugify } from "@/lib/slugify";
import type { DeviceGroup } from "@/lib/types";

export const DEVICES_TAG = "devices";

const collator = new Intl.Collator("en");

const typeLabels: Record<string, string> = {
  PHONE: "Phones",
  TABLET: "Tablets",
  SMARTWATCH: "Smartwatches",
  LAPTOP: "Laptops",
  CAR: "Cars",
  "WI-FI ROUTERS": "Wi-Fi Routers",
};

const typeOrder = ["phone", "smartwatch", "tablet"];

function typeRank(id: string): number {
  const rank = typeOrder.indexOf(id);

  return rank === -1 ? typeOrder.length : rank;
}

function typeLabel(type: string): string {
  const known = typeLabels[type.toUpperCase()];

  if (known) return known;

  const titled = type
    .toLowerCase()
    .split(/([ -])/)
    .map((part) =>
      /^[ -]$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");

  if (/s$/i.test(titled)) return titled;

  return /(ch|sh|x|z)$/i.test(titled) ? `${titled}es` : `${titled}s`;
}

function toGroups(types: ApiDeviceType[]): DeviceGroup[] {
  const byType = new Map<string, { label: string; devices: Set<string> }>();

  for (const { type, brands } of types) {
    const id = slugify(type);
    const entry = byType.get(id) ?? {
      label: typeLabel(type),
      devices: new Set<string>(),
    };

    for (const { models } of brands) {
      for (const { model } of models) entry.devices.add(model);
    }

    byType.set(id, entry);
  }

  return [...byType.entries()]
    .map(([id, { label, devices }]) => ({
      id,
      label,
      devices: [...devices].sort(collator.compare),
    }))
    .sort(
      (a, b) =>
        typeRank(a.id) - typeRank(b.id) || collator.compare(a.label, b.label),
    );
}

export async function getDeviceGroups(): Promise<DeviceGroup[]> {
  "use cache";

  cacheLife("days");
  cacheTag(DEVICES_TAG);

  const types = await fetchYesim(
    "supported_devices",
    supportedDevicesResponseSchema,
  );

  return toGroups(types);
}
