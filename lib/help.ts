import { installHref } from "@/lib/install";

export type HelpArticle = {
  id: string;
  title: string;
  blurb: string;
  href: string;
  /** Card art. Leave unset to render the placeholder tile. */
  image?: string;
  keywords: string[];
};

export const helpArticles: HelpArticle[] = [
  {
    id: "install-ios",
    title: "Installation for iOS",
    blurb: "iPhone and iPad, by QR code or by hand",
    href: installHref("ios"),
    image: "/images/help/install-ios.jpg",
    keywords: ["iphone", "ipad", "apple", "ios", "install", "setup", "qr"],
  },
  {
    id: "install-android",
    title: "Installation for Android",
    blurb: "Pixel, Samsung, and most flagship Androids",
    href: installHref("android"),
    image: "/images/help/install-android.jpg",
    keywords: ["android", "pixel", "samsung", "install", "setup", "qr"],
  },
  {
    id: "compatible-devices",
    title: "Check that your device supports eSIM",
    blurb: "Phones, tablets, laptops, watches, and routers, by model",
    href: "/help/esim-compatible-devices",
    image: "/images/help/compatible-devices.jpg",
    keywords: ["compatible", "device", "supported", "phone", "model", "esim"],
  },
  {
    id: "refunds",
    title: "Refunds and cancellations",
    blurb: "When a plan qualifies for a refund, and how to ask for one",
    href: "/refund-policy",
    image: "/images/help/refunds.jpg",
    keywords: ["refund", "cancel", "money back", "charge", "billing"],
  },
  {
    id: "privacy",
    title: "Privacy policy",
    blurb: "What we collect, why we collect it, and how long we keep it",
    href: "/privacy-policy",
    image: "/images/help/privacy.jpg",
    keywords: ["privacy", "data", "gdpr", "cookies", "personal"],
  },
  {
    id: "terms",
    title: "Terms of service",
    blurb: "The rules that cover buying and using a nowsim plan",
    href: "/terms-of-service",
    image: "/images/help/terms.jpg",
    keywords: ["terms", "conditions", "legal", "agreement"],
  },
];
