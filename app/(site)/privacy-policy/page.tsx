import type { Metadata } from "next";

import {
  LegalPage,
  legalLink,
  type LegalSection,
} from "@/components/sections/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | nowsim",
  description:
    "What personal data we collect, why we collect it, how we use and share it, how long we keep it, and the rights you have over it.",
};

const supportEmail = "support@nowsim.com";

function SupportLink() {
  return (
    <a href={`mailto:${supportEmail}`} className={legalLink}>
      {supportEmail}
    </a>
  );
}

const sections: LegalSection[] = [
  {
    title: "1. When does this Privacy Policy apply?",
    blocks: [
      {
        kind: "text",
        body: "1.1. We are committed to respecting your privacy and safeguarding your personal data. This Privacy Policy explains what personal data we collect, how we use it, with whom we share it, and what rights you have in relation to your data.",
      },
      {
        kind: "text",
        body: "1.2. In this Privacy Policy, references to “nowsim”, “we”, “us”, or “our” refer to Genesis Group AG, Registration number: CHE-135.623.633, Bahnhofstrasse 4, Baar, 6340, Switzerland, acting as the data controller for the purposes of applicable data protection laws, including the General Data Protection Regulation (GDPR) and the Swiss Federal Act on Data Protection (nFADP), meaning we determine the purposes and means of processing your personal data. Our contact details, as well as the contact information of our Data Protection Officer, are provided at the beginning and at the end of this Privacy Policy.",
      },
      { kind: "text", body: "1.3. This Privacy Policy applies to you if you:" },
      {
        kind: "list",
        items: [
          "access or use our website, social media pages (collectively, the “Website”) or mobile application (“Application”);",
          "purchase, activate, or use our services and products (collectively, the “Services”), including, where applicable, services enabling you to obtain and use virtual phone numbers and related communication functionality (the “Virtual Number Services”);",
          "communicate with our customer support or commercial teams;",
          "receive emails, messages, or other communications from us;",
          "participate in our marketing campaigns, surveys, or events.",
        ],
      },
    ],
  },
  {
    title: "2. What personal data do we collect and process?",
    summary:
      "We collect different categories of personal data – from your contact details and payment information to technical data from your device and how you use our Services.",
    parts: [
      {
        title: "2.1. Agreement (Registration) Data",
        blocks: [
          {
            kind: "text",
            body: "Details you provide when registering or managing your account, including:",
          },
          {
            kind: "list",
            items: [
              "your identity information, such as name, surname, identity code or number, if any,",
              "payment method,",
              "date of birth,",
              "residence (including tax residence),",
              "address,",
              "email,",
              "phone number,",
              "identity document data (when provided by law).",
            ],
          },
        ],
      },
      {
        title: "2.2. Billing and Accounting Data",
        blocks: [
          {
            kind: "text",
            body: "Data related to your purchases, service usage and your selected tariff plan:",
          },
          {
            kind: "list",
            items: [
              "number of minutes of voice call (incoming or outgoing),",
              "megabytes of data (incoming or outgoing),",
              "messaging (SMS),",
              "other payments and payment terms, defined in your agreement with nowsim,",
              "payment-related information such as transaction identifiers, masked card details, billing data, and payment status,",
              "related taxes, fees and other obligatory payments.",
            ],
          },
          {
            kind: "text",
            body: "Please note that we do not store full payment card details. Payments are processed by our payment service providers. We may receive limited payment-related information, some of which may be provided in a pseudonymised form, and store such information for billing, accounting, and fraud prevention purposes.",
          },
        ],
      },
      {
        title: "2.3. Correspondence Data",
        blocks: [
          {
            kind: "text",
            body: "Any data you share with us when you contact customer support or send us questions, claims, complaints, or job applications:",
          },
          {
            kind: "list",
            items: [
              "your identity information, such as name, surname and correspondence address/method,",
              "other personal data you submit to nowsim by any written or oral correspondence.",
            ],
          },
        ],
      },
      {
        title: "2.4. Login and Authentication Data",
        blocks: [
          {
            kind: "text",
            body: "Information related to your login and technical environment, including:",
          },
          {
            kind: "list",
            items: [
              "your login credentials and identifiers (for example, username, Facebook user ID),",
              "registration timestamps and session lifecycle data (including access duration),",
              "Facebook login integration and associated SDK events (e.g. “Download”, “Like”),",
              "basic in-app interactions and event metadata (e.g. app installs, launches),",
              "system events and error logs,",
              "IP address and time zone,",
              "device and application metadata, including: mobile OS type and version, application version, device model, carrier, screen size, processor cores, total and remaining disk space, device opt-out setting.",
            ],
          },
        ],
      },
      {
        title: "2.5. Data from Public or Legal Authorities",
        blocks: [
          {
            kind: "text",
            body: "Personal data received from law enforcement authorities or courts and/or other competent authorities that varies per case:",
          },
          {
            kind: "list",
            items: ["may include identity, contact, or behavioral data."],
          },
        ],
      },
      {
        title: "2.6. Promotional Data",
        blocks: [
          {
            kind: "text",
            body: "Information used to send you service updates and legal notices or invite you to surveys or provide promotions:",
          },
          {
            kind: "list",
            items: [
              "your email, phone number,",
              "other data used to notify you about changes to our Services, Terms of Service, or this Privacy Policy, to contact you for market research purposes and to keep you up to date.",
            ],
          },
        ],
      },
      {
        title: "2.7. Service Usage Data",
        blocks: [
          {
            kind: "text",
            body: "Information about what and how you use our Services (excluding data specifically related to Virtual Number Services, which is described separately below):",
          },
          {
            kind: "list",
            items: [
              "purchased and used Services,",
              "geolocation data, including information about the location of your purchase.",
            ],
          },
        ],
      },
      {
        title: "2.8. Virtual Number Service Data (if applicable)",
        blocks: [
          {
            kind: "text",
            body: "Information in connection with your use of our Virtual Number Services, which may include:",
          },
          {
            kind: "list",
            items: [
              "assigned virtual phone number,",
              "call and messaging metadata (e.g. timestamps, duration, sender/recipient identifiers),",
              "routing and delivery information,",
              "service configuration settings.",
            ],
          },
        ],
      },
      {
        title: "2.9. Website (Cookies) and Application Data",
        blocks: [
          {
            kind: "text",
            body: "Information collected automatically when you use our Website or Application:",
          },
          {
            kind: "list",
            items: [
              "your IP address,",
              "device and browser metadata (device type, OS and version, browser type and version, screen resolution, language settings),",
              "date and time of access,",
              "referral sources (e.g. external websites or links that directed you to our Website or Application),",
              "user interaction data (e.g. button clicks, page navigation, login events),",
              "form input data and stored user preferences,",
              "activity logs and behavioral analytics data, cookie identifiers and similar tracking elements (see our Cookie Policy).",
            ],
          },
        ],
      },
    ],
  },
  {
    title: "3. How do we use your personal data?",
    summary:
      "We use your data depending on how you interact with us – to run our services, help you use them effectively, support you, improve what we do, and keep you informed. This Section explains the types of individuals concerned, the categories of personal data processed, the purposes for which they are used, and the sources from which the data are collected.",
    parts: [
      {
        title: "3.1. Website Visitors and Application Users",
        summary:
          "Who this applies to: Individuals who access or use our Website and Application, including via social media integrations.",
        blocks: [
          {
            kind: "table",
            columns: [
              {
                heading: "We use",
                items: [
                  "Website (Cookies) and Application Data,",
                  "Login and Authentication Data.",
                ],
              },
              {
                heading: "Why",
                items: [
                  "To operate and secure our Website and Application,",
                  "To analyze and improve performance,",
                  "To remember user settings and form inputs,",
                  "To perform statistical analysis and optimize user experience.",
                ],
              },
              {
                heading: "Where from",
                items: [
                  "You,",
                  "Your device, your browser,",
                  "Credit reference and fraud prevention agencies (if applicable),",
                  "Group Account Holder, if applicable,",
                  "Our agents.",
                ],
              },
            ],
          },
        ],
      },
      {
        title: "3.2. Services Users (Customers)",
        summary:
          "Who this applies to: Individuals who register for, purchase, activate or use our Services.",
        blocks: [
          {
            kind: "table",
            columns: [
              {
                heading: "We use",
                items: [
                  "Agreement (Registration) Data,",
                  "Billing and Accounting Data,",
                  "Service Usage Data,",
                  "Correspondence Data,",
                  "Promotional Data.",
                ],
              },
              {
                heading: "Why",
                items: [
                  "To register and authenticate users,",
                  "To provide, manage and bill for the Services,",
                  "To analyze and improve performance of our Services,",
                  "To fulfill legal obligations (e.g. AML, tax, identity checks),",
                  "To manage your account and support queries,",
                  "To provide services of AI customer support agent,",
                  "To conduct credit and fraud screening (where required by law),",
                  "To notify you of material changes or legal matters related to your agreement.",
                ],
              },
              {
                heading: "Where from",
                items: [
                  "You,",
                  "Credit reference and fraud prevention agencies (if applicable),",
                  "Group Account Holder, if applicable,",
                  "Our agents,",
                  "Public databases.",
                ],
              },
            ],
          },
        ],
      },
      {
        title: "3.3. Virtual Number Services Users",
        summary:
          "Who this applies to: Services Users (Customers) who use our Virtual Number Services.",
        blocks: [
          {
            kind: "table",
            columns: [
              {
                heading: "We use",
                items: [
                  "Virtual Number Service Data (in addition to the data categories described for Services Users (Customers) above).",
                ],
              },
              {
                heading: "Why",
                items: [
                  "To provide and maintain virtual number functionality,",
                  "To support message and calls handling, routing, and service delivery,",
                  "To ensure service security and fraud prevention,",
                  "To comply with applicable contractual, legal and regulatory requirements,",
                  "To manage user settings and service configuration.",
                ],
              },
              {
                heading: "Where from",
                items: ["You,", "Your device, your browser."],
              },
            ],
          },
        ],
      },
      {
        title: "3.4. Support Inquirers and Correspondents",
        summary:
          "Who this applies to: Individuals who communicate with us via written or oral means (email, chat, phone, forms).",
        blocks: [
          {
            kind: "table",
            columns: [
              {
                heading: "We use",
                items: ["Correspondence Data,", "Service Usage Data."],
              },
              {
                heading: "Why",
                items: [
                  "To respond to your queries, complaints, or feedback,",
                  "To handle account or service issues,",
                  "To provide services of AI customer support agent,",
                  "To improve support processes.",
                ],
              },
              { heading: "Where from", items: ["You."] },
            ],
          },
        ],
      },
      {
        title: "3.5. Marketing Recipients and Campaign Participants",
        summary:
          "Who this applies to: Individuals who subscribe to communications, respond to marketing offers, or participate in research or promotional activities.",
        blocks: [
          {
            kind: "table",
            columns: [
              { heading: "We use", items: ["Promotional Data."] },
              {
                heading: "Why",
                items: [
                  "To send product updates and marketing offers,",
                  "To analyze consumer behavior and preferences,",
                  "To personalize communications and outreach.",
                ],
              },
              { heading: "Where from", items: ["You."] },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "4. What if your company gives you access (corporate accounts)?",
    summary:
      "If you use nowsim through your employer or organization, some of your data may be shared between us and your company.",
    blocks: [
      {
        kind: "text",
        body: "4.1. In certain cases, our Services may be purchased and managed by a corporate customer (“Group Account Holder”) for the benefit of individual users, such as employees, contractors, or other members (“End Users”).",
      },
      {
        kind: "text",
        body: "Where a Group Account Holder purchases plans and distributes access to our Services to End Users, we may process personal data related to:",
      },
      {
        kind: "list",
        items: [
          "the Group Account Holder (for example, business contact and Billing and Accounting Data), and",
          "the End Users who use the Services (Agreement (Registration) Data, Correspondence Data, Login and Authentication Data, Promotional Data, Service Usage Data, Virtual Number Service Data (if applicable), Website (Cookies) and Application Data).",
        ],
      },
      {
        kind: "text",
        body: "Depending on the circumstances, we may process End User data:",
      },
      {
        kind: "list",
        items: [
          "on our own behalf, where we collect and use personal data directly for our Service provision, technical operation, legal compliance, or improvement purposes,",
          "or in conjunction with the Group Account Holder, where both parties influence how certain data is processed (e.g., for account administration, usage tracking, or internal reporting).",
        ],
      },
      {
        kind: "text",
        body: "4.2. In such cases, we and the Group Account Holder may act as independent or joint controllers, depending on the nature of the processing. Each party is responsible for ensuring that processing is carried out lawfully and transparently. End Users may exercise their data protection rights under applicable laws by contacting either nowsim or the relevant Group Account Holder.",
      },
      {
        kind: "text",
        body: "4.3. End Users are encouraged to review both this Privacy Policy and the privacy notice of the relevant Group Account Holder to understand how their data is processed and protected.",
      },
    ],
  },
  {
    title: "5. Why may we use your data (legal grounds for processing)?",
    summary:
      "We only use your personal data when the law allows it. Here are the reasons why and when.",
    blocks: [
      {
        kind: "text",
        body: "We only process your personal data where there is a valid legal basis to do so under applicable data protection laws, including the General Data Protection Regulation (GDPR) and the Swiss Federal Act on Data Protection (nFADP).",
      },
      {
        kind: "text",
        body: "Depending on the context and nature of your interaction with us, we rely on one or more of the following legal grounds:",
      },
    ],
    parts: [
      {
        title:
          "5.1. Contractual Performance: To deliver the service you asked for",
        blocks: [
          {
            kind: "text",
            body: "We process your personal data where it is necessary to enter into, perform, or administer an agreement with you. This includes:",
          },
          {
            kind: "list",
            items: [
              "enabling the purchase, activation, and use of our Services,",
              "managing your user account,",
              "processing payments,",
              "providing customer support, and",
              "fulfilling our obligations under our Terms of Service.",
            ],
          },
        ],
      },
      {
        title: "5.2. Legal Obligations: Because the law says so",
        blocks: [
          {
            kind: "text",
            body: "We process your personal data where we are legally required to do so, including for compliance with obligations under applicable tax, accounting, anti-money laundering, consumer protection, and telecommunications regulations, where applicable. This may include:",
          },
          {
            kind: "list",
            items: [
              "retaining transaction, service, and other records where required by applicable law,",
              "verifying identity, and",
              "disclosing data to competent authorities upon lawful request.",
            ],
          },
        ],
      },
      {
        title:
          "5.3. Legitimate Interests: For things that help us run and protect our Services",
        blocks: [
          {
            kind: "text",
            body: "We may process your personal data where it is necessary for the purposes of our legitimate interests or those of a third party – as long as it doesn’t unfairly affect your rights. This includes:",
          },
          {
            kind: "list",
            items: [
              "maintaining and improving the functionality and security of our Services;",
              "preventing fraud or misuse of our Website and Application;",
              "conducting internal analytics and performance tracking;",
              "managing and defending legal claims.",
            ],
          },
          {
            kind: "text",
            body: "We carefully assess these uses to make sure they’re fair and proportionate.",
          },
        ],
      },
      {
        title: "5.4. Consent: When you’ve agreed",
        blocks: [
          {
            kind: "text",
            body: "In specific cases, we rely on your prior, explicit, and informed consent to process your personal data, for example, for some types of marketing or data sharing with third parties.",
          },
          {
            kind: "text",
            body: "You may withdraw your consent at any time – it won’t affect what we did before you changed your mind.",
          },
          {
            kind: "text",
            body: "If we ever need to process your data for a new or different reason that isn’t listed above (and isn’t compatible with the original reason), we’ll tell you first – either through an update to this Privacy Policy or a separate notice when we collect the data.",
          },
        ],
      },
    ],
  },
  {
    title: "6. Who do we share your data with?",
    summary:
      "We only share your personal data when necessary – and only with trusted third parties who help us deliver our Services, support our business, or work with us under specific agreements. These third parties may process your data on our behalf (as processors) or for their own purposes (as independent controllers).",
    blocks: [
      {
        kind: "text",
        body: "Service Providers: We engage external vendors and service providers to help us operate, maintain, and support our services. These entities process personal data based on our instructions and are bound by contractual obligations. They include:",
      },
      {
        kind: "list",
        items: [
          "providers of cloud hosting and infrastructure,",
          "customer support platforms,",
          "analytics and diagnostics tools,",
          "payment and billing services,",
          "email delivery and communications,",
          "fraud detection and prevention systems.",
        ],
      },
      {
        kind: "terms",
        items: [
          {
            term: "6.1. Connectivity Infrastructure Providers",
            body: "To provide you with our Services, we work with connectivity infrastructure providers, including roaming and network partners, providers of voice, messaging, numbering, and routing infrastructure. In order to enable and maintain connectivity, certain personal data may be processed within their infrastructure, subject to specific arrangements and applicable regulatory requirements.",
          },
          {
            term: "6.2. Commercial and Business Partners",
            body: "In limited cases, we may share certain categories of personal data with third-party partners for joint service delivery, marketing cooperation, AI-powered customer support, or as part of a contract you enter into. Such sharing is carried out in accordance with applicable data protection laws and, where required, based on your consent or another valid legal basis.",
          },
          {
            term: "6.3. Local Service Partners",
            body: "In some countries, our Services may be sold, distributed, or supported through authorized local partners. These partners may process some of your personal data either as processors on our behalf or as independent controllers, depending on the structure of the Services provided – for example, to manage billing, provide customer support, or deliver local onboarding.",
          },
          {
            term: "6.4. Professional Advisors",
            body: "We may disclose your personal data to legal, tax, insurance, audit, or other professional advisors, where necessary for the services they provide to us, and subject to confidentiality obligations.",
          },
          {
            term: "6.5. Group Companies",
            body: "We may disclose your personal data within our corporate group, including with affiliated entities, where this is necessary to operate and support our Services, manage our business operations, ensure internal administrative coordination, or comply with legal obligations.",
          },
          {
            term: "6.6. Investors",
            body: "We may disclose or transfer your personal data in connection with any actual or contemplated business transactions, including mergers, acquisitions, restructurings, asset sales, or similar events. In such cases, we will ensure that appropriate safeguards are implemented, and you will be informed where required by law.",
          },
          {
            term: "6.7. Legal and Regulatory Authorities",
            body: "We may disclose your personal data to competent public authorities, courts, law enforcement, or regulatory bodies where required to comply with legal obligations, enforce our terms, protect our rights, or respond to lawful requests.",
          },
        ],
      },
    ],
  },
  {
    title: "7. Do we transfer your data abroad?",
    summary:
      "We sometimes send your personal data to trusted partners outside the EU or Switzerland. When we do, we use legally approved safeguards – such as Standard Contractual Clauses and extra security measures – to ensure your data stays protected.",
    blocks: [
      {
        kind: "text",
        body: "7.1. Some of our service providers and partners may be located outside the European Economic Area (EEA), or Switzerland. This includes, for example, Hong Kong.",
      },
      {
        kind: "text",
        body: "Where we transfer your personal data to countries that are not recognized by the European Commission or the Swiss Federal Data Protection and Information Commissioner (FDPIC) as providing an adequate level of protection, we implement appropriate safeguards in accordance with applicable data protection laws. These safeguards may include:",
      },
      {
        kind: "list",
        items: [
          "the use of Standard Contractual Clauses (SCCs) approved by the European Commission or the Swiss FDPIC,",
          "supplementary technical and organizational measures, such as encryption and strict access controls.",
        ],
      },
      {
        kind: "text",
        body: "You may request further details about these safeguards by contacting us at the address provided in this Privacy Policy.",
      },
    ],
  },
  {
    title: "8. How long do we retain your data?",
    summary:
      "We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy unless otherwise required by law.",
    blocks: [
      {
        kind: "text",
        body: "8.1. We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected, as outlined in this Privacy Policy, or to comply with applicable legal, regulatory, or contractual obligations.",
      },
      {
        kind: "text",
        body: "8.2. Where data is processed based on your consent, we will retain it until you withdraw your consent or the purpose for which the data was collected no longer applies, whichever occurs first.",
      },
      {
        kind: "text",
        body: "8.3. Where retention is no longer justified, your personal data will be securely deleted or irreversibly anonymized in accordance with industry standards.",
      },
      {
        kind: "text",
        body: "8.4. More specific retention periods may apply to certain types of data or processing contexts. Please contact us if you wish to receive further information about applicable retention schedules.",
      },
    ],
  },
  {
    title: "9. What are your data protection rights?",
    summary:
      "You have rights that allow you access to and control over your personal data.",
    blocks: [
      {
        kind: "text",
        body: "You have the following rights under applicable data protection laws, including the General Data Protection Regulation (GDPR) and the Swiss Federal Act on Data Protection (nFADP):",
      },
      {
        kind: "terms",
        items: [
          {
            term: "9.1. Right of Access",
            body: "You have the right to request confirmation as to whether we process your personal data, and, if so, to obtain a copy of that data along with relevant information about how and why we process it.",
          },
          {
            term: "9.2. Right to Rectification",
            body: "You have the right to request that we correct or complete any personal data that you believe is inaccurate or incomplete.",
          },
          {
            term: "9.3. Right to Erasure",
            body: "You have the right to request the deletion of your personal data where, for example, the data is no longer necessary for the purposes for which it was collected, or where you have withdrawn your consent (if consent was the legal basis).",
          },
          {
            term: "9.4. Right to Restriction of Processing",
            body: "You may request that we temporarily suspend the processing of your personal data, for example, while we verify its accuracy or assess an objection.",
          },
          {
            term: "9.5. Right to Data Portability",
            body: "Where processing is based on consent or contract and carried out by automated means, you have the right to request that we provide you or another data controller with your personal data in a structured, commonly used, and machine-readable format.",
          },
          {
            term: "9.6. Right to Object",
            body: "You have the right to object to processing based on our legitimate interests (including profiling), unless we can demonstrate compelling legitimate grounds to continue such processing. You also have the absolute right to object to direct marketing at any time.",
          },
          {
            term: "9.7. Right to Withdraw Consent",
            body: "Where we process your personal data based on your consent, you have the right to withdraw that consent at any time. This does not affect the lawfulness of processing carried out prior to the withdrawal.",
          },
          {
            term: "9.8. Right to Lodge a Complaint",
            body: "If you believe that we have infringed your data protection rights, you have the right to file a complaint with the competent supervisory authority, in particular in the country of your habitual residence, place of work, or place of the alleged infringement.",
          },
        ],
      },
      {
        kind: "text",
        body: (
          <>
            To exercise any of your rights, or if you have any questions about
            your rights or how we process your data, you may contact us at:{" "}
            <SupportLink />.
          </>
        ),
      },
    ],
  },
  {
    title: "10. How do we protect your data?",
    summary:
      "We aim to protect your personal data through a system of organizational and technical security measures.",
    blocks: [
      {
        kind: "text",
        body: "10.1. We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, in accordance with applicable data protection laws. These measures are designed to protect your personal data against accidental or unlawful destruction, loss, alteration, unauthorized disclosure or access, and other unlawful or unauthorized forms of processing.",
      },
      {
        kind: "text",
        body: "10.2. We ensure that any third parties processing personal data on our behalf (for example, service providers or contractors) are contractually bound to implement appropriate security measures and comply with applicable data protection requirements.",
      },
      {
        kind: "text",
        body: "10.3. While we take reasonable steps to protect your personal data, no system or transmission over the internet can be guaranteed to be 100% secure. If you believe that your data has been compromised, please contact us immediately using the contact information provided in this Privacy Policy.",
      },
    ],
  },
  {
    title: "11. Do we use cookies?",
    summary:
      "We may use cookies and other tracking technologies to collect and store your information.",
    blocks: [
      {
        kind: "text",
        body: "11.1. We use cookies and similar technologies on our Website and Application to ensure proper functionality, enhance user experience, personalize content, and analyze website traffic and user behavior.",
      },
      {
        kind: "text",
        body: "11.2. Where required by law, we obtain your consent before placing non-essential cookies on your device. You can manage your cookie preferences at any time through our cookie banner or browser settings.",
      },
      {
        kind: "text",
        body: "11.3. For more information about the types of cookies we use, their purposes, the duration of storage, and how to manage or withdraw your consent, please refer to our Cookie Policy.",
      },
    ],
  },
  {
    title: "12. Do we make changes to this Privacy Policy?",
    summary:
      "Yes, we will update this Privacy Policy as necessary to reflect relevant changes.",
    blocks: [
      {
        kind: "text",
        body: "12.1. We may update this Privacy Policy from time to time to reflect changes in legal requirements, technological developments, or our business practices. When we make material changes, we may notify you in a manner appropriate to the significance of those changes – for example, by displaying a prominent notice within our Website or Application or by sending you a direct notification.",
      },
      {
        kind: "text",
        body: "12.2. We encourage you to review this Privacy Policy periodically to stay informed about how we collect, use, and protect your personal data. The “Effective date” at the top of this page indicates when this Privacy Policy was last revised.",
      },
    ],
  },
  {
    title: "13. How can you contact us?",
    blocks: [
      {
        kind: "text",
        body: "13.1. If you have any questions, comments, or requests regarding this Privacy Policy or the way we process your personal data, you may contact us at:",
      },
      {
        kind: "list",
        items: [
          <>
            Email: <SupportLink />;
          </>,
          "Postal address: Bahnhofstrasse 4, Baar, 6340, Switzerland.",
        ],
      },
      {
        kind: "text",
        body: "We will respond to your inquiry in accordance with applicable data protection laws.",
      },
    ],
  },
];

function Meta() {
  return (
    <dl className="grid gap-x-8 gap-y-4 rounded-card border border-hairline p-5 text-base text-muted sm:grid-cols-2 md:p-6">
      <div>
        <dt className="text-eyebrow uppercase tracking-[0.08em] text-ink/45">
          Effective date
        </dt>
        <dd className="mt-2">26 June, 2026</dd>
      </div>

      <div>
        <dt className="text-eyebrow uppercase tracking-[0.08em] text-ink/45">
          Data controller
        </dt>
        <dd className="mt-2">
          Genesis Group AG
          <br />
          Bahnhofstrasse 4, Baar, 6340, Switzerland
          <br />
          Registration number: CHE-135.623.633
          <br />
          Email: <SupportLink />
        </dd>
      </div>
    </dl>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lede="This Privacy Policy explains what personal data we collect, why we collect it, how we use it, and what rights you have."
      meta={<Meta />}
      sections={sections}
    />
  );
}
