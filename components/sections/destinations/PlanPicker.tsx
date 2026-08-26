"use client";

import { useCallback, useId, useState } from "react";
import { MdSmartphone, MdStar, MdVerifiedUser } from "react-icons/md";

import { ActivationNote } from "@/components/sections/destinations/ActivationNote";
import { DeviceDialog } from "@/components/sections/destinations/DeviceDialog";
import { Price, usePrice } from "@/components/common/Price";
import { Pressable } from "@/components/ui/Pressable";
import { Tabs } from "@/components/ui/Tabs";
import { MAX_ESIMS, checkoutHref } from "@/lib/checkout";
import type { DestinationKind, DeviceGroup, Plan } from "@/lib/types";
import { cn } from "@/lib/cn";

const stepper =
  "h-10 w-10 rounded-full border border-hairline text-xl leading-none";

const stepperAdd = cn(
  stepper,
  "enabled:border-brand enabled:bg-brand enabled:text-white",
  "enabled:hover:border-brand-soft enabled:hover:bg-brand-soft",
);

const card = cn(
  "relative flex flex-col rounded-card border px-5 py-4",
  "press",
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
);

const cardIdle = cn(
  "border-hairline bg-surface",
  "hover:border-ink/25 hover:shadow-lg hover:shadow-ink/8",
);

const cardPicked = "border-brand bg-brand/5";

const tabs = [
  { id: "fixed", label: "Prepaid plans" },
  { id: "unlimited", label: "Unlimited plans" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function PlanPicker({
  plans,
  heading,
  destinationName,
  destinationKind,
  destinationSlug,
  deviceGroups,
}: {
  plans: Plan[];
  /** Sits on the same row as the plan-type tabs. */
  heading: string;
  destinationName: string;
  destinationKind: DestinationKind;
  destinationSlug: string;
  deviceGroups: DeviceGroup[];
}) {
  const groupId = useId();

  const groups: Record<TabId, Plan[]> = {
    fixed: plans.filter((plan) => !plan.unlimited),
    unlimited: plans.filter((plan) => plan.unlimited),
  };

  const tabbed = groups.fixed.length > 0 && groups.unlimited.length > 0;

  const [activeTab, setActiveTab] = useState<TabId>(() =>
    groups.fixed.length > 0 ? "fixed" : "unlimited",
  );

  const shownPlans = tabbed ? groups[activeTab] : plans;

  const [selectedId, setSelectedId] = useState(() => shownPlans[0].id);

  const [quantity, setQuantity] = useState(1);

  const [deviceOpen, setDeviceOpen] = useState(false);
  const closeDevices = useCallback(() => setDeviceOpen(false), []);

  const pickTab = (id: TabId) => {
    setActiveTab(id);
    setSelectedId(groups[id][0].id);
  };

  const selectedPlan =
    shownPlans.find((plan) => plan.id === selectedId) ?? shownPlans[0];

  const total = usePrice(selectedPlan.price, quantity);

  return (
    <>
      <div
        className={cn(
          "mt-12 flex flex-wrap items-center gap-x-6 gap-y-4",
          tabbed && "justify-between",
        )}
      >
        <h2 className="min-w-[15rem] flex-1 text-xl font-bold tracking-[-0.02em]">
          {heading}
        </h2>

        {tabbed && (
          <Tabs
            items={tabs}
            value={activeTab}
            onChange={pickTab}
            label={`Plan type for ${destinationName}`}
            tabId={(id) => `${groupId}-tab-${id}`}
            panelId={`${groupId}-panel`}
            className="shrink-0"
          />
        )}
      </div>

      <fieldset
        id={tabbed ? `${groupId}-panel` : undefined}
        role={tabbed ? "tabpanel" : undefined}
        aria-labelledby={tabbed ? `${groupId}-tab-${activeTab}` : undefined}
        className="mt-6"
      >
        <legend className="sr-only">
          Choose a data plan for {destinationName}
        </legend>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shownPlans.map((plan) => {
            const inputId = `${groupId}-${plan.id}`;
            const picked = plan.id === selectedId;

            return (
              <li
                key={plan.id}
                className={cn(card, picked ? cardPicked : cardIdle)}
              >
                <input
                  type="radio"
                  id={inputId}
                  name={groupId}
                  value={plan.id}
                  checked={picked}
                  onChange={() => setSelectedId(plan.id)}
                  className="sr-only"
                />

                <div className="flex items-start justify-between gap-3">
                  <label
                    htmlFor={inputId}
                    className="cursor-pointer text-xl font-bold tracking-[-0.02em] after:absolute after:inset-0 after:content-['']"
                  >
                    {plan.data}
                    <span className="sr-only">, {plan.days} days</span>
                  </label>

                  <span
                    aria-hidden
                    className={cn(
                      "mt-1 h-5 w-5 shrink-0 rounded-full border",
                      "transition-[border-width,border-color] duration-300 ease-hover",
                      "motion-reduce:transition-none",
                      picked ? "border-[6px] border-brand" : "border-ink/25",
                    )}
                  />
                </div>

                <p
                  aria-hidden
                  className={cn(
                    "mt-2 w-fit rounded-full border border-hairline px-2.5 py-0.5",
                    "text-[0.8125rem]/[1.125rem] font-medium text-muted",
                  )}
                >
                  {plan.days} days
                </p>

                <p className="mt-auto pt-2 text-right text-lg font-bold tracking-[-0.02em]">
                  <Price money={plan.price} />
                </p>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <ActivationNote />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-lg font-bold tracking-[-0.02em]">
            Choose number of eSIMs
          </p>
          <p className="text-sm text-muted">How many travellers?</p>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-hairline p-1.5">
          <Pressable
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={quantity <= 1}
            aria-label="Remove one eSIM"
            className={cn(stepper, "hover:bg-surface-soft")}
          >
            &minus;
          </Pressable>

          <span
            aria-live="polite"
            className="min-w-[4.75rem] text-center text-base font-bold"
          >
            {quantity} eSIM{quantity > 1 ? "s" : ""}
          </span>

          <Pressable
            onClick={() =>
              setQuantity((current) => Math.min(MAX_ESIMS, current + 1))
            }
            disabled={quantity >= MAX_ESIMS}
            aria-label="Add one eSIM"
            className={stepperAdd}
          >
            +
          </Pressable>
        </div>
      </div>

      <Pressable
        href={checkoutHref(
          destinationKind,
          destinationSlug,
          selectedPlan.id,
          quantity,
        )}
        className="mt-8 w-full rounded-full bg-brand px-8 py-4 text-base font-bold text-white hover:bg-brand/85"
      >
        Go to checkout - {total}
      </Pressable>

      <Pressable
        aria-haspopup="dialog"
        aria-expanded={deviceOpen}
        onClick={() => setDeviceOpen(true)}
        className={cn(
          "mt-3 w-full gap-2 rounded-full bg-brand/12 px-8 py-4",
          "text-base font-bold text-brand",
          "hover:bg-brand/20 active:bg-brand/20",
        )}
      >
        <MdSmartphone aria-hidden className="h-5 w-5 shrink-0" />
        Device compatibility
      </Pressable>

      <DeviceDialog
        open={deviceOpen}
        onClose={closeDevices}
        deviceGroups={deviceGroups}
      />

      <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <li className="flex items-center gap-2 text-base font-medium text-ink">
          <MdStar aria-hidden className="h-4 w-4" />
          4.7 (97,400+ reviews)
        </li>

        <li className="flex items-center gap-2 text-base font-medium text-ink">
          <MdVerifiedUser aria-hidden className="h-5 w-5 text-success" />
          Secure payment guaranteed
        </li>
      </ul>
    </>
  );
}
