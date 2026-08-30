import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EsimList } from "@/components/sections/esims/EsimList";
import { getEsims } from "@/lib/data/esims";
import { isReusableEsim } from "@/lib/types";

export const metadata: Metadata = {
  title: "My eSIMs - nowsim",
  description: "Your eSIMs, their data left, and how to install them.",
  robots: { index: false, follow: false },
};

export default async function EsimsPage() {
  const esims = await getEsims();

  if (!esims) redirect("/");

  return (
    <section className="px-3 pb-20 pt-28 md:px-4 md:py-28">
      <div className="mx-auto max-w-3xl">
        <EsimList esims={esims.filter(isReusableEsim)} title="My eSIM’s" />
      </div>
    </section>
  );
}
