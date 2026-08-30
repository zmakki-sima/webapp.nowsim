import type { Metadata } from "next";

import {
  LegalPage,
  legalLink,
  type LegalSection,
} from "@/components/sections/legal/LegalPage";

export const metadata: Metadata = {
  title: "Refund Policy - nowsim",
  description:
    "How refunds work on data plans and top-ups: the 30-day window, what counts as activation, refund methods, and processing times.",
};

const supportEmail = "support@nowsim.com";

const sections: LegalSection[] = [
  {
    title: "Data Plans & Top-Ups Refunds",
    blocks: [
      {
        kind: "terms",
        items: [
          {
            term: "30-Day Window",
            body: "You can request a refund within 30 calendar days from the date of purchase.",
          },
          {
            term: "Usage Conditions",
            body: "Refunds are only available if the product or service has not been activated, used, or expired. The cost of data and any nowsim services actually used will not be refunded.",
          },
          {
            term: "What Counts as Activation",
            body: "Activation includes installing the eSIM profile, connecting to a mobile network, or starting VPN/data usage. For the Unlim Day Pass plan, a day counts as used the moment your device connects to a mobile network and the 24-hour usage period begins.",
          },
        ],
      },
    ],
  },
  {
    title: "Technical Issues & Malfunctions",
    blocks: [
      {
        kind: "terms",
        items: [
          {
            term: "1-Hour Reporting Window",
            body: "If you experience an app malfunction or technical error, you must notify us strictly within 1 hour of the issue occurring.",
          },
          {
            term: "How to Contact Us",
            body: (
              <>
                Reach out via{" "}
                <a href={`mailto:${supportEmail}`} className={legalLink}>
                  {supportEmail}
                </a>{" "}
                or use the contact form inside the nowsim application.
              </>
            ),
          },
          {
            term: "Required Details",
            body: "Please provide clear details and screenshots so our technical team can quickly identify and resolve the problem.",
          },
        ],
      },
    ],
  },
  {
    title: "Refund Methods & Limits",
    blocks: [
      {
        kind: "terms",
        items: [
          {
            term: "Original Payment Method",
            body: "Confirmed refunds will be credited back to the same payment method you used to make the purchase.",
          },
          {
            term: "Refunds under €10",
            body: "If your approved refund amount is €10 or less, it will be issued exclusively to your internal balance in the form of Ycoins.",
          },
          {
            term: "Ycoins Rules",
            body: "Standard Ycoins are promotional, non-refundable, and cannot be exchanged for cash. However, you can request a refund of Ycoins if there is a confirmed technical application malfunction reported within 1 hour with screenshots.",
          },
          {
            term: "Provisions for payments and refunds from Brazil (Pix & IOF tax)",
            body: "For full or partial refunds approved on transactions via the Pix system, nowsim refunds only the base cost of the purchased product or service. The statutory IOF (Financial Operations Tax), currently 3.5% for international transactions, is collected by local authorities and is non-refundable. All national duties, taxes, and related charges must be borne by the payer; nowsim has no obligation to compensate for these unreturned taxes.",
          },
        ],
      },
    ],
  },
  {
    title: "Third-Party Marketplace Purchases",
    blocks: [
      {
        kind: "terms",
        items: [
          {
            term: "Platform Rules Apply",
            body: "If you purchased our service via an external marketplace (such as Amazon or the App Store), the refund and cancellation rules of that platform take precedence. If your request is rejected under their rules, nowsim is not obligated to provide a separate refund.",
          },
        ],
      },
    ],
  },
  {
    title: "Processing Time",
    blocks: [
      {
        kind: "terms",
        items: [
          {
            term: "15 Business Days",
            body: "Any refund request will be reviewed and processed within 15 business days of receipt.",
          },
        ],
      },
    ],
  },
  {
    title: "Technical Constraints and Processing Timelines for Refunds",
    blocks: [
      {
        kind: "text",
        body: "Refunds to the user's original payment method depend on the processing capabilities of the user's payment provider, card issuer, or bank. nowsim does not control or guarantee when the credit appears to the user. Therefore, nowsim is not liable for holds, processing times, or delays caused by the user's third-party payment provider.",
      },
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      lede="We understand that sometimes things don't go as planned. That's why we offer a straightforward refund policy and guarantee for our data plans. Before making a purchase, please ensure that your device is eSIM compatible and carrier-unlocked."
      sections={sections}
    />
  );
}
