import type { DeviceGroup } from "@/lib/types";

export function deviceQuery(value: string): string {
  return value.trim().toLowerCase();
}

function filterDevices(devices: string[], query: string): string[] {
  if (!query) return devices;

  return devices.filter((device) => device.toLowerCase().includes(query));
}

export function filterDeviceGroups(
  groups: DeviceGroup[],
  query: string,
): DeviceGroup[] {
  if (!query) return groups;

  return groups
    .map((group) => ({
      ...group,
      devices: filterDevices(group.devices, query),
    }))
    .filter((group) => group.devices.length > 0);
}
