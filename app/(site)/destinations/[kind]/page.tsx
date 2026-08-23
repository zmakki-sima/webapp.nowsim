import { notFound, redirect } from "next/navigation";

import { destinationKinds, isDestinationKind } from "@/lib/types";

export function generateStaticParams() {
  return destinationKinds.map((kind) => ({ kind }));
}

export default async function DestinationKindPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;

  if (!isDestinationKind(kind)) notFound();

  redirect(`/destinations?kind=${kind}`);
}
