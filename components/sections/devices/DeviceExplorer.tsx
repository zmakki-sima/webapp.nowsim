"use client";

import { useMemo, useState } from "react";
import { MdCheck } from "react-icons/md";

import { SearchField } from "@/components/ui/SearchField";
import { deviceQuery, filterDeviceGroups } from "@/lib/devices";
import type { DeviceGroup } from "@/lib/types";
import { cn } from "@/lib/cn";

export function DeviceExplorer({ groups }: { groups: DeviceGroup[] }) {
  const [query, setQuery] = useState("");

  const search = deviceQuery(query);

  const shown = useMemo(
    () => filterDeviceGroups(groups, search),
    [groups, search],
  );

  const total = shown.reduce((count, group) => count + group.devices.length, 0);

  return (
    <>
      <SearchField
        value={query}
        onChange={setQuery}
        label="Search for devices"
        placeholder="Search for devices"
        className="mt-10 max-w-xl md:mt-12"
      />

      <p aria-live="polite" className="sr-only">
        {total} devices match
      </p>

      {shown.length ? (
        <div className="mt-12 flex flex-col gap-12 md:mt-14 md:gap-14">
          {shown.map((group) => (
            <section key={group.id}>
              <h2 className="text-xl font-bold tracking-[-0.02em]">
                {group.label}
              </h2>

              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.devices.map((device) => (
                  <li
                    key={device}
                    className={cn(
                      "flex items-start gap-2.5 border-b border-hairline pb-3",
                      "text-base text-ink/80",
                    )}
                  >
                    <MdCheck
                      aria-hidden
                      className="mt-1 h-4 w-4 shrink-0 text-brand"
                    />
                    {device}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-12 rounded-card bg-surface-soft px-6 py-12 text-center text-lg text-muted md:mt-14">
          Nothing matches &ldquo;{query.trim()}&rdquo;. Check the spelling, or
          search for the model number.
        </p>
      )}
    </>
  );
}
