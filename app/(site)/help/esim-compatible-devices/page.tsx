import type { Metadata } from "next";

import { DeviceExplorer } from "@/components/sections/devices/DeviceExplorer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getDeviceGroups } from "@/lib/data/devices";

export const metadata: Metadata = {
  title: "eSIM compatible devices - nowsim",
  description:
    "Check whether your phone, tablet, laptop, smartwatch, or router supports eSIM before you buy a nowsim data plan.",
};

export default async function CompatibleDevicesPage() {
  const groups = await getDeviceGroups();

  return (
    <section className="px-3 pb-20 pt-28 md:px-4 md:py-28">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb
          className="mb-10"
          items={[
            { label: "Home", href: "/" },
            { label: "Help", href: "/help" },
            { label: "eSIM compatible devices" },
          ]}
        />

        <h1 className="max-w-[18ch] font-display text-h1 font-extrabold uppercase tracking-[-0.045em]">
          eSIM compatible devices
        </h1>

        <p className="mt-5 max-w-[62ch] text-lg text-muted md:text-xl">
          eSIM support varies from device to device. This list comes from the
          manufacturers, so we can&rsquo;t guarantee every entry is current. If
          your device isn&rsquo;t listed, it likely doesn&rsquo;t support eSIM.
        </p>

        <DeviceExplorer groups={groups} />
      </div>
    </section>
  );
}
