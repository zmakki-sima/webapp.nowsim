"use client";

import { useId, useMemo, useState } from "react";
import { MdCheck, MdExpandMore } from "react-icons/md";

import { Pressable } from "@/components/ui/Pressable";
import { SearchDialog } from "@/components/ui/SearchDialog";
import { deviceQuery, filterDeviceGroups } from "@/lib/devices";
import type { DeviceGroup } from "@/lib/types";
import { cn } from "@/lib/cn";

export function DeviceDialog({
  open,
  onClose,
  deviceGroups,
}: {
  open: boolean;
  onClose: () => void;
  deviceGroups: DeviceGroup[];
}) {
  const baseId = useId();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const search = deviceQuery(query);

  const groups = useMemo(
    () => filterDeviceGroups(deviceGroups, search),
    [deviceGroups, search],
  );

  return (
    <SearchDialog
      open={open}
      onClose={onClose}
      title="Check device compatibility"
      intro={
        <>
          If your device isn&rsquo;t <span className="text-brand">listed</span>,
          it likely doesn&rsquo;t support eSIM
        </>
      }
      query={query}
      onQueryChange={setQuery}
      searchLabel="Search for devices"
      placeholder="Search for devices"
    >
      {groups.length === 0 ? (
        <p className="py-6 text-sm text-muted">
          No device matches &ldquo;{query.trim()}&rdquo;. Check the spelling, or
          search for the model number.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {groups.map((group) => {
            const isOpen = search !== "" || expanded === group.id;
            const panelId = `${baseId}-${group.id}-panel`;
            const triggerId = `${baseId}-${group.id}-trigger`;

            return (
              <li key={group.id} className="rounded-control bg-brand/6">
                <Pressable
                  press={false}
                  id={triggerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() =>
                    setExpanded((current) =>
                      current === group.id ? null : group.id,
                    )
                  }
                  className={cn(
                    "w-full gap-4 rounded-control px-4 py-3.5 text-left",
                    "text-base font-bold text-ink",
                    // A small lift off the row's own brand/6 fill — /10 read
                    // as a colour change rather than a hover. Only while the
                    // group is shut: tinting the header of an open group made
                    // it look like part of the list below it had lit up too.
                    "transition-colors duration-300 ease-hover",
                    !isOpen && "hover:bg-brand/8",
                    "motion-reduce:transition-none",
                  )}
                >
                  <span className="flex-1">{group.label}</span>

                  <span className="text-sm font-medium text-brand">
                    {group.devices.length}
                  </span>

                  {/* Same hue as the count, dialled back: the number is the
                      thing to read, the chevron only says "there is more". */}
                  <MdExpandMore
                    aria-hidden
                    className={cn(
                      "h-5 w-5 shrink-0 text-brand/50",
                      "transition-transform duration-300 ease-ios",
                      isOpen && "-rotate-180",
                      "motion-reduce:transition-none",
                    )}
                  />
                </Pressable>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className={cn(
                    "grid duration-300 ease-ios",
                    "transition-[grid-template-rows,opacity,visibility]",
                    isOpen
                      ? "visible grid-rows-[1fr] opacity-100"
                      : "invisible grid-rows-[0fr] opacity-0",
                    "motion-reduce:transition-none",
                  )}
                >
                  <div className="overflow-hidden">
                    <ul className="flex flex-col gap-1.5 px-4 pb-4 pt-1">
                      {group.devices.map((device) => (
                        <li
                          key={device}
                          className="flex items-start gap-2.5 text-sm text-muted"
                        >
                          <MdCheck
                            aria-hidden
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                          />
                          {device}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SearchDialog>
  );
}
