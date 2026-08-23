import "server-only";

import { z } from "zod";

const schema = z.object({
  YESIM_API_TOKEN: z
    .string()
    .min(1, "YESIM_API_TOKEN is required. The catalog cannot load without it"),
  YESIM_API_BASE: z.url().default("https://partners-api.yesim.biz"),
  REVALIDATE_SECRET: z.string().min(16).optional(),
});

const parsed = schema.safeParse({
  YESIM_API_TOKEN: process.env.YESIM_API_TOKEN,
  YESIM_API_BASE: process.env.YESIM_API_BASE,
  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
});

if (!parsed.success) {
  throw new Error(
    [
      "Invalid environment.",
      z.prettifyError(parsed.error),
      "Copy .env.example to .env.local and fill it in.",
    ].join("\n"),
  );
}

export const env = parsed.data;
