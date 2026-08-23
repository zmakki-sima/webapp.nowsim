import type { Blurb, DestinationKind } from "@/lib/types";

export function blurbText({ lead, coverage, tail }: Blurb): string {
  return `${lead}${coverage ?? ""}${tail}`;
}

export function blurbFor({
  name,
  kind,
  covers,
}: {
  name: string;
  kind: DestinationKind;
  covers?: number;
}): Blurb {
  if (kind === "country") {
    return {
      lead: `Get a travel eSIM for ${name} and enjoy reliable, affordable internet the moment you land.`,
      tail: "",
    };
  }

  if (kind === "region") {
    return {
      lead: "One eSIM for ",
      coverage: `${covers} countries`,
      tail: ` across ${name}. Hop borders on the same plan, with no roaming bill waiting for you.`,
    };
  }

  return {
    lead: "A travel eSIM that follows you across ",
    coverage: `${covers} destinations`,
    tail: ". One plan, one account, wherever the trip goes.",
  };
}
