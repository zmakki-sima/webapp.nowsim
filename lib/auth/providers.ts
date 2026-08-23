import type { IconType } from "react-icons";
import { MdOutlineMail } from "react-icons/md";

export type ProviderId = "google" | "email";

export type AuthProvider = {
  id: ProviderId;
  label: string;
  Icon: IconType;
  ready: boolean;
};

export const authProviders: AuthProvider[] = [
  { id: "email", label: "Continue with Email", Icon: MdOutlineMail, ready: true },
];

export const providerNames: Record<ProviderId, string> = {
  google: "Google",
  email: "Email",
};

export const legalLinks = [
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];
