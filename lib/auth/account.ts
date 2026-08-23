import type { ProviderId } from "@/lib/auth/providers";

export type Account = {
  userId: string;
  email: string;
  provider: ProviderId;
};
