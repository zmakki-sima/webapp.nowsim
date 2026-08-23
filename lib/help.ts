import { installHref } from "@/lib/install";

export type HelpTopicId = "esim" | "plans" | "account" | "policies";

export type HelpTopic = {
  id: HelpTopicId;
  label: string;
};

export type HelpArticle = {
  id: string;
  title: string;
  blurb: string;
  href: string;
  topic: HelpTopicId;
  /** Card art. Leave unset to render the placeholder tile. */
  image?: string;
  keywords: string[];
};

export const helpTopics: HelpTopic[] = [
  { id: "esim", label: "eSIM" },
  { id: "plans", label: "Plans" },
  { id: "account", label: "Account" },
  { id: "policies", label: "Policies" },
];

export const helpArticles: HelpArticle[] = [
  {
    id: "install-ios",
    title: "Installation for iOS",
    blurb: "iPhone and iPad, by QR code or by hand.",
    href: installHref("ios"),
    topic: "esim",
    image: "/images/help/install-ios.jpg",
    keywords: ["iphone", "ipad", "apple", "ios", "install", "setup", "qr"],
  },
  {
    id: "install-android",
    title: "Installation for Android",
    blurb: "Pixel, Samsung, and most flagship Androids.",
    href: installHref("android"),
    topic: "esim",
    image: "/images/help/install-android.jpg",
    keywords: ["android", "pixel", "samsung", "install", "setup", "qr"],
  },
  {
    id: "compatible-devices",
    title: "Check that your device supports eSIM",
    blurb: "Phones, tablets, laptops, watches, and routers, by model.",
    href: "/esim-compatible-devices",
    topic: "esim",
    keywords: ["compatible", "device", "supported", "phone", "model", "esim"],
  },
  {
    id: "my-esims",
    title: "Find your eSIM and its activation details",
    blurb: "Your QR code, SM-DP+ address, and data left, in one place.",
    href: "/esims",
    topic: "account",
    keywords: [
      "my esim",
      "qr code",
      "activation",
      "sm-dp",
      "data left",
      "balance",
    ],
  },
  {
    id: "how-it-works",
    title: "How a nowsim plan works",
    blurb: "Buy, install, land connected. Three steps, about two minutes.",
    href: "/#how-it-works",
    topic: "plans",
    keywords: ["how it works", "start", "getting started", "activate", "data"],
  },
  {
    id: "choose-a-plan",
    title: "Choose a country, region, or global plan",
    blurb: "One balance per plan, and regional plans cross borders with you.",
    href: "/destinations",
    topic: "plans",
    keywords: ["plan", "country", "region", "global", "coverage", "price"],
  },
  {
    id: "purchases",
    title: "Your orders and receipts",
    blurb: "Every purchase on your account, with what you paid and when.",
    href: "/purchases",
    topic: "account",
    keywords: ["order", "receipt", "invoice", "history", "purchase", "payment"],
  },
  {
    id: "refunds",
    title: "Refunds and cancellations",
    blurb: "When a plan qualifies for a refund, and how to ask for one.",
    href: "/refund-policy",
    topic: "policies",
    keywords: ["refund", "cancel", "money back", "charge", "billing"],
  },
  {
    id: "privacy",
    title: "Privacy policy",
    blurb: "What we collect, why we collect it, and how long we keep it.",
    href: "/privacy-policy",
    topic: "policies",
    keywords: ["privacy", "data", "gdpr", "cookies", "personal"],
  },
  {
    id: "terms",
    title: "Terms of service",
    blurb: "The rules that cover buying and using a nowsim plan.",
    href: "/terms-of-service",
    topic: "policies",
    keywords: ["terms", "conditions", "legal", "agreement"],
  },
];
