import type { Metadata } from "next";

import {
  LegalPage,
  legalLink,
  type LegalSection,
} from "@/components/sections/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service - nowsim",
  description:
    "The binding terms that govern the purchase and use of nowsim Products and Services, including eSIMs, Data Plans, Virtual Numbers and VPN.",
};

const supportEmail = "support@nowsim.com";

function Url({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={legalLink}>
      {href}
    </a>
  );
}

const sections: LegalSection[] = [
  {
    blocks: [
      { kind: "text", body: `Thank you for selecting nowsim!` },
      {
        kind: "text",
        body: `By creating an Account, accessing, purchasing, using or continuing to use any nowsim Product or Service, You enter into a legally binding agreement with nowsim, which consists of:`,
      },
      {
        kind: "list",
        items: [
          `These ToS;`,
          `Acceptable Use Policy;`,
          `Product Description published on the nowsim Application.`,
        ],
      },
      {
        kind: "text",
        body: `These ToS, Acceptable Use Policy and Product Description together constitute the "Terms".`,
      },
      {
        kind: "text",
        body: (
          <>
            nowsim processes personal data in accordance with the Privacy Policy
            published at <Url href="https://nowsim.com/privacy-policy/" />,
            including Agreement on the Storage of the Cardholder’s Credentials
            published at <Url href="https://nowsim.com/cof/" />.
          </>
        ),
      },
    ],
  },
  {
    title: "1. Definitions",
    blocks: [
      {
        kind: "text",
        body: (
          <>
            1.1. &quot;Acceptable Use Policy&quot; or &quot;AUP&quot; means the
            acceptable use policy published by nowsim at{" "}
            <Url href="https://nowsim.com/acceptable-use-policy/" />, as amended
            from time to time.
          </>
        ),
      },
      {
        kind: "text",
        body: `1.2. "Account" means the personal user account created or maintained in the nowsim Application, through which nowsim Products and Services may be accessed, purchased and managed, whether by the User directly or on behalf of a Company.`,
      },
      {
        kind: "text",
        body: `1.3. “Add-On” means an optional supplementary service or feature that may be purchased only together with, and as an addition to, a nowsim Product or Service, as further specified in the applicable Product Description. A combination of a primary nowsim Product or Service and one or more Add-Ons purchased in a single transaction constitutes a Bundle. An Add-On cannot be purchased, activated, upgraded, renewed or extended on a standalone basis unless nowsim expressly states otherwise in the applicable Product Description.`,
      },
      {
        kind: "text",
        body: `1.4. “Bundle” means a combination of a primary nowsim Product or Service and one or more Add-Ons purchased by the User in a single transaction through the nowsim Application, as made available by nowsim from time to time. The eligible combinations, applicable Bundle pricing and conditions governing each component, including validity periods, are as specified in the applicable Product Description.`,
      },
      {
        kind: "text",
        body: `1.5. "Call Metadata" means the data generated in connection with each call or message processed through the nowsim Application, including the calling party number (A-number), the called party number (B-number), the call or message identifier assigned by nowsim, date and time, duration (for calls), call or message status, SIP address information relating to the call, the platform or channel through which the relevant authentication, communication or transaction was initiated or processed (where available), and the relevant virtual number ID assigned by nowsim.`,
      },
      {
        kind: "text",
        body: `1.6. "Company" means a legal entity that has entered, or intends to enter, into a contract with nowsim for the provision of nowsim Products or Services. Where a Company provides access to nowsim Products or Services to its employees, representatives, contractors or other authorized persons, such individuals shall be deemed Users for the purposes of the Terms. The Company shall ensure that all such individuals comply with these ToS and the Acceptable Use Policy. These ToS and the Acceptable Use Policy apply to any Company and its authorized persons to the extent not inconsistent with the terms of the agreement executed between the Company and nowsim; in the event of a conflict between the Terms and such agreement, the agreement between the Company and nowsim shall prevail with respect to the subject matter of that agreement.`,
      },
      {
        kind: "text",
        body: `1.7. "Data" means mobile data allowances in accordance with the nowsim Data Plan selected and purchased by the User.`,
      },
      {
        kind: "text",
        body: `1.8. "Data Plan" means a data offer that the User may purchase via the nowsim Application, specifying the amount of Data available, the applicable time period and the price.`,
      },
      {
        kind: "text",
        body: `1.9. "Effective Date" means (a) with respect to these ToS, the date indicated at the end of this document; and (b) with respect to any amendment to any part of the Terms, the date of its publication in the nowsim Application, unless a later date is specified in the amendment itself.`,
      },
      {
        kind: "text",
        body: `1.10. "eSIM" means an embedded universal integrated circuit card (eUICC), a form of programmable SIM that is embedded directly into a device of the User, necessary for use of certain nowsim Services and Products.`,
      },
      {
        kind: "text",
        body: `1.11. "Terms" means, collectively, these ToS, Product Descriptions and the Acceptable Use Policy.`,
      },
      {
        kind: "text",
        body: `1.12. "OTP Service" means the Virtual Number Service that allows the User to receive automated verification communications on an assigned Virtual Number, including incoming one-time password (OTP) calls and/or incoming one-time password (OTP) SMS, as further specified in the applicable Product Description. The OTP Service is limited to verification-related inbound communications only, does not support person-to-person voice conversations, and does not permit the User to initiate outbound calls or send outbound SMS. The OTP Service may be provided as an Add-On or as a standalone functionality, as specified in the applicable Product Description.`,
      },
      {
        kind: "text",
        body: `1.13. “Inbound Calls Service” means the functionality, where available, that allows the User to receive incoming voice calls through the nowsim Application on an assigned Virtual Number, as further specified in the applicable Product Description. The Inbound Calls Service is subject to the applicable traffic limits, usage allowances specified in the applicable Product Description, and territorial availability. The availability of the Inbound Calls Service in particular countries or territories may be changed, restricted, suspended or withdrawn from time to time at the discretion of nowsim, its network partners or the relevant upstream provider. The Inbound Calls Service may be provided as an Add-On or as a standalone functionality, as specified in the applicable Product Description.`,
      },
      {
        kind: "text",
        body: `1.14. “Inbound SMS Service” means the functionality, where available, that allows the User to receive incoming SMS through the nowsim Application on an assigned Virtual Number, as further specified in the applicable Product Description. The Inbound SMS Service is subject to the applicable traffic limits, message allowances and territorial availability specified in the applicable Product Description. The availability of the Inbound SMS Service in particular countries or territories may be changed, restricted, suspended or withdrawn from time to time at the discretion of nowsim, its network partners or the relevant upstream provider. The Inbound SMS Service may be provided as an Add-On or as a standalone functionality, as specified in the applicable Product Description.`,
      },
      {
        kind: "text",
        body: `1.15. "Intellectual Property Rights" means all rights associated with works of authorship (including copyrights, designs, moral rights and mask work rights), trademarks, service marks, trade dress, logos, trade names, domain names, corporate names and associated goodwill, trade secrets and know-how, patent rights, and all other proprietary rights of any kind, whether registered or unregistered, existing anywhere in the world.`,
      },
      {
        kind: "text",
        body: `1.16. “Outbound Calls Service” means the functionality, where available, that allows the User to initiate outgoing voice calls through the nowsim Application from an assigned Virtual Number to permitted destinations, as further specified in the applicable Product Description. The Outbound Calls Service is subject to the applicable traffic limits, minute allowances specified in the applicable Product Description, and territorial availability. Available countries and territories, as well as the scope of availability of the Outbound Calls Service within them, may be changed, restricted, suspended or withdrawn at any time at the discretion of nowsim, its network partners or the relevant upstream provider. The Outbound Calls Service may be provided as an Add-On or as a standalone functionality, as specified in the applicable Product Description.`,
      },
      {
        kind: "text",
        body: `1.17. “Outbound SMS Service” means the functionality, where available, that allows the User to send outgoing SMS through the nowsim Application from an assigned Virtual Number to permitted destinations, as further specified in the applicable Product Description. The Outbound SMS Service is subject to the applicable traffic limits, message allowances and territorial availability specified in the applicable Product Description. Available countries and territories, as well as the scope of availability of the Outbound SMS Service within them, may be changed, restricted, suspended or withdrawn at any time at the discretion of nowsim, its network partners or the relevant upstream provider. The Outbound SMS Service may be provided as an Add-On or as a standalone functionality, as specified in the applicable Product Description.`,
      },
      {
        kind: "text",
        body: `1.18. "Participating Member Operator" means each of the operator partners of nowsim in whose networks the nowsim eSIM/SIM may be used by the User and/or through which Virtual Number Services are provided, including numbering, voice and messaging providers.`,
      },
      {
        kind: "text",
        body: (
          <>
            1.19. &quot;Privacy Policy&quot; means the privacy policy published
            by nowsim at <Url href="https://nowsim.com/privacy-policy/" />, as
            amended from time to time.
          </>
        ),
      },
      {
        kind: "text",
        body: (
          <>
            1.20. &quot;Product Description&quot; means the description of a
            specific nowsim Product or Service as displayed in the nowsim
            Application and/or on the Website (
            <Url href="https://nowsim.com/" />) at the time of purchase,
            including, as applicable, the product type, service scope, supported
            features and functionality, included allowances, quotas or usage
            parameters (including data volume, call minutes, SMS, VPN usage and
            tiers, traffic limits or other measurable units), applicable fees,
            supported destinations, countries, territories or geographic zones,
            validity period or Rental Period, activation conditions, technical
            prerequisites, and any applicable restrictions, exclusions,
            eligibility criteria or other service-specific conditions. Each
            Product Description is incorporated into the Terms by reference and
            forms an integral part of the Terms for the duration of the
            applicable service period.
          </>
        ),
      },
      {
        kind: "text",
        body: `1.21. "Rental Period" means the initial period (as specified in the applicable Product Description or the nowsim Application) during which the Virtual Number is assigned to the User, commencing on the date of activation, and including any subsequent renewal period(s) where: (a) the subscription (auto-renewal) feature is enabled in accordance with the Terms; or (b) the User manually renews the Virtual Number before the expiry of the then-current Rental Period. Where the Virtual Number is not renewed before such expiry, nowsim shall have no obligation to preserve, restore, reserve or reassign the same Virtual Number to the User.`,
      },
      {
        kind: "text",
        body: `1.22. "Subscription" means the subscription plan purchased by the User for the Data Plan, VPN Service or other Service offered by nowsim, specifying the subscription period, pricing, and any applicable usage conditions, as set out in the applicable Product Description.`,
      },
      {
        kind: "text",
        body: `1.23. "Top-Up" means any purchase or replenishment made by the User in relation to nowsim Products and Services through the nowsim Application or by any other purchase flow made available by nowsim, including: (a) the purchase of YCOINS balance; and/or (b) the funding, recharge or replenishment of the balance, allowance or usage capacity of any nowsim Product or Service, in each case in accordance with the applicable payment mechanics, billing model and Product Description published by nowsim on the Website or in the nowsim Application.`,
      },
      {
        kind: "text",
        body: `1.24. "User" (and/or "You") means: (a) an individual (natural person) who has opened an Account with nowsim and has, or is about to, associate a valid nowsim Product or Service with such Account; or (b) an individual who accesses or uses nowsim Products or Services through an Account maintained or funded by a Company, including any employee, representative, contractor or other authorized person of such Company.`,
      },
      {
        kind: "text",
        body: `1.25. "Virtual Number" means a telephone number assigned to the User on a temporary rental basis through the nowsim Application, enabling the User to receive communications via the Internet, as specified in the applicable Product Description. The type of communications supported, availability by country and applicable limitations are determined by nowsim, as set out in the applicable Product Description. The Virtual Number Service may include, depending on the applicable Product Description, the OTP Service, the Inbound Calls Service, the Inbound SMS Service, the Outbound Calls Service, the Outbound SMS Service, or a combination thereof.`,
      },
      {
        kind: "text",
        body: `1.26. "VPN Service" or "VPN" means the virtual private network Service offered by nowsim through the nowsim Application, enabling the User to establish an encrypted connection to the Internet, as further specified in the applicable Product Description, via servers operated by or on behalf of nowsim or its technology partners. The VPN Service requires the nowsim Application to be installed on the User's device.`,
      },
      {
        kind: "text",
        body: `1.27. "YCOINS" means the point-based loyalty program offered by nowsim, as further described in Section 8.`,
      },
      {
        kind: "text",
        body: (
          <>
            1.28. &quot;nowsim Application&quot; or &quot;nowsim App&quot; means
            the proprietary software application offered by nowsim, including,
            as applicable, any web-based interface, the browser version
            (&quot;Website&quot;) available at{" "}
            <Url href="https://nowsim.com/" /> or online platform operated by or
            on behalf of nowsim through which nowsim Products or Services may be
            accessed, purchased or managed.
          </>
        ),
      },
      {
        kind: "text",
        body: `1.29. "nowsim Products and Services" means the eSIM (or SIM), Data Plans, Virtual Numbers, the Virtual Number Service, the OTP Service, the Inbound Calls Service and the Outbound Calls Service, VPN Service, YCOINS, and any other products, services, features or functionalities offered by nowsim from time to time, in each case as described in the applicable Product Description (each a "Service" or "Product", as applicable).`,
      },
    ],
  },
  {
    title: "2. General Terms",
    blocks: [
      {
        kind: "text",
        body: `2.1. These ToS govern the sale and use of nowsim Application and all nowsim Products and/or Services. The applicable Product Description for each Product or Service purchased by the User is incorporated into these ToS by reference and forms an integral part hereof.`,
      },
      {
        kind: "text",
        body: `2.2. nowsim Products and Services are designed primarily for international travellers and persons temporarily located outside their country of residence. The Data Plans, eSIM, Virtual Number Service (including the OTP Service, the Inbound Calls Service, the Inbound SMS Service, the Outbound Calls Service and the Outbound SMS Service), VPN services, and any other nowsim Product or Service are intended as supplementary, travel-oriented communication tools and are not designed, marketed or offered as a replacement for permanent domestic telecommunications services.`,
      },
      {
        kind: "text",
        body: `2.3. The Privacy Policy, the Agreement on the Storage of the Cardholder’s Credentials, these ToS including the Acceptable Use Policy and all Product Descriptions form the general terms governing nowsim Services and are binding on the relationship between each User (and the Company, where applicable) and nowsim, unless specifically governed by a separate agreement or by special terms of service applicable to specific products.`,
      },
      {
        kind: "text",
        body: `2.4. nowsim and the User are independent parties. Nothing in the Terms shall be construed as creating any agency, partnership, joint venture, employment or franchising relationship between nowsim and the User.`,
      },
      {
        kind: "text",
        body: `2.5. The headings and titles and Definitions of these ToS are for convenience, facilitation and ease of reference only and shall not be used in any way to construe or interpret the ToS.`,
      },
      {
        kind: "text",
        body: `2.6. nowsim is not a telecommunications operator or provider. nowsim acts solely as a distributor and aggregator of communication services, connectivity and related digital services made available through its technology, network, numbering, VPN and proxy partners. nowsim does not itself own, operate or control any telecommunications network or infrastructure, does not itself provide licensed telecommunications services, and does not itself provide encryption services or develop, operate or control the underlying encryption protocols or VPN infrastructure used by any VPN-related service made available through the nowsim Application. No nowsim Product or Service shall be construed as a telephone service, a substitute for a domestic telephone line, or a replacement for the User’s primary means of communication.`,
      },
      {
        kind: "text",
        body: `2.7. nowsim declares a zero-tolerance policy towards Users that violate Intellectual Property Rights. Any unauthorized copying, publication, reproduction or distribution of nowsim's and/or third Party's Intellectual Property is prohibited and is the subject of User's liability, as set in these ToS, applicable law and legal acts.`,
      },
      {
        kind: "text",
        body: `2.8. nowsim reserves the right to amend the Terms (in whole or in part) at any time by publishing the amended version in the nowsim Application. Unless specified otherwise, any amendment shall take effect on the date of its publication (the Effective Date of such amendment).`,
      },
      {
        kind: "text",
        body: `2.9. Where an amendment materially reduces the User's rights, materially increases the User's obligations, or materially affects the functionality of a Service during an active Rental Period or Subscription period, nowsim shall use reasonable efforts to notify affected Users as soon as practicable by any available communication channel, including push notifications, in-app alerts or email to the address associated with the User's Account.`,
      },
      {
        kind: "text",
        body: `2.10. If You do not agree with the Terms or any amendment thereto, You must stop using the nowsim Application, nowsim Products and Services immediately. Continued use of the nowsim Application, nowsim Products and Services after the Effective Date of any amendment constitutes the User's acceptance of the updated Terms.`,
      },
      {
        kind: "text",
        body: `2.11. By creating an Account, accessing, purchasing or continuing to use any nowsim Product or Service, You confirm that You have read, understood and agree to be bound by any changes, amendments or updates to the present Terms. By completing each purchase of any nowsim Product or Service, the User accepts the Terms (including the applicable Product Description) by way of adhesion. No separate signature or additional act of acceptance is required beyond the act of purchase.`,
      },
    ],
  },
  {
    title: "3. Technical Issues",
    blocks: [
      {
        kind: "text",
        body: `3.1. To use all nowsim Application functionality and/or particular nowsim Products and Services Your device shall support eSIM functionality. You are responsible for verifying eSIM compatibility in the settings of Your device prior to purchase.`,
      },
      {
        kind: "text",
        body: `3.2. The eSIM provided through the nowsim Application supports mobile data usage only, as defined by the Global System for Mobile Communications Association (GSMA). Voice calls, SMS and MMS cannot be made or received through the eSIM itself.`,
      },
      {
        kind: "text",
        body: `3.3. Certain nowsim Products and Services, including the Virtual Number Service, the Inbound Calls Service and the Outbound Calls Service, operate over the Internet using VoIP and/or IP-based messaging functionality delivered through the nowsim Application. Such functionality is separate from the eSIM’s mobile data connectivity and does not use the device’s ordinary cellular calling functionality. The availability and quality of such Products and Services depend on the User having an active Internet connection, whether through the nowsim eSIM, Wi-Fi or another Internet source, and on the User’s device permissions and settings, including, where applicable, push notifications and microphone access. If the User has no Internet access, such functionality will not operate. Additional technical conditions, limitations and service-specific requirements are set out in the applicable Product Description.`,
      },
      {
        kind: "text",
        body: `3.4. The nowsim Application only works on unlocked devices, which can use the nowsim Access Point Name (APN). For device configuration, please check our Help Center.`,
      },
      {
        kind: "text",
        body: `3.5. The nowsim Application and nowsim Products and Services require an active Internet connection for installation, activation and use. nowsim does not guarantee the availability, coverage, continuity, speed, quality or security of any Internet connection or network access used by the User, whether through the nowsim eSIM, Data Plans, Wi-Fi, third-party mobile networks, local network infrastructure or otherwise, and shall not be liable for any failure, interruption, degradation or unavailability resulting from the User’s location, signal strength, roaming conditions, third-party carrier limitations, Wi-Fi availability, network congestion or any other circumstance outside nowsim’s reasonable control. nowsim further does not guarantee that any nowsim Data Plan will operate on an uninterrupted, continuous or error-free basis.`,
      },
      {
        kind: "text",
        body: `3.6. nowsim does not guarantee compatibility of the nowsim Application or any nowsim Product or Service with all devices, operating systems or software configurations. The User is solely responsible for ensuring that the User's device meets the applicable technical requirements.`,
      },
      {
        kind: "text",
        body: `3.7. The User acknowledges that certain features of the nowsim Application, including the Virtual Number Service, may require the User to grant specific device permissions (such as microphone access for voice calls, notification permissions for incoming calls and messages). Failure to grant the required permissions may result in the relevant Service being unavailable or limited.`,
      },
      {
        kind: "text",
        body: `3.8. No nowsim Products and Services, including the eSIM, the Virtual Number Service, the OTP Service, the Inbound Calls Service, the Inbound SMS Service, the Outbound Calls Service, the Outbound SMS Service, supports calls or messages to emergency services (including 911, 112, or any equivalent emergency number in any jurisdiction). The eSIM and Data Plans provide data connectivity only and do not themselves enable the User to contact emergency services. Any Virtual Number Service and any call- or SMS-related functionality are delivered over the Internet and are not connected to emergency service infrastructure. The User must use a traditional mobile or landline telephone, or another service capable of contacting emergency services through the applicable local network, in any emergency situation. nowsim shall not be liable for any damages, losses, injuries or death arising from the User’s inability to contact emergency services through any nowsim Products and Services.`,
      },
    ],
  },
  {
    title: "4. Products and Services",
    parts: [
      {
        title: "4.1. General",
        blocks: [
          {
            kind: "text",
            body: `4.1.1. nowsim may make available to Users, through the nowsim Application, various digital connectivity and communication products and services, including eSIM-enabled connectivity, Data Plans, Virtual Number Services, the Inbound Calls Service and the Outbound Calls Service, VPN services, YCOINS and any related features or functionality, in each case as further specified in the applicable Product Description. The exact scope, availability, technical parameters, territorial coverage, pricing, validity period, usage limits and eligibility requirements of each nowsim Product and/or Service are determined by nowsim and set out in the applicable Product Description.`,
          },
        ],
      },
      {
        title: "4.2. eSIM",
        blocks: [
          {
            kind: "text",
            body: `4.2.1. The eSIM is a digital SIM profile made available through the nowsim Application for use on an eSIM-compatible and unlocked device. The eSIM enables the User to access eligible nowsim Data Plans and related connectivity services without using a physical SIM card. Depending on the device and available nowsim offering, the same eSIM may be used with different nowsim Data Plans for different countries, regions or global coverage, as specified in the applicable Product Description. Installation, activation and use of the eSIM are subject to device compatibility, technical requirements and the instructions made available through the nowsim Application.`,
          },
        ],
      },
      {
        title: "4.3. Data Plans",
        blocks: [
          {
            kind: "text",
            body: `4.3.1. A Data Plan is a prepaid mobile data offer made available through the nowsim Application in relation to a supported country, region, city, global destination set or other coverage configuration designated by nowsim. Data Plans may be offered in different formats, including fixed-volume plans, unlimited plans, pay-as-you-go plans, day-based plans, or other billing models determined by nowsim from time to time. Each Data Plan is subject to the applicable Product Description, including the relevant destination or coverage zone, pricing, validity period, traffic allowances, fair usage conditions, activation rules and other service-specific terms. Unless expressly stated otherwise, a Data Plan provides data connectivity only and does not itself include voice calling, SMS, VPN functionality or Virtual Number functionality.`,
          },
          {
            kind: "text",
            body: `4.3.2. A Data Plan may be marketed or identified under a specific commercial name, including “Pay & Fly”, as further specified in the applicable Product Description.`,
          },
        ],
      },
      {
        title: "4.4. Virtual Number",
        blocks: [
          {
            kind: "text",
            body: `4.4.1. The Virtual Number is a digital communication service made available on standalone or Add-On basis through the nowsim Application on a temporary basis only for the applicable Rental Period. The Virtual Number Service is not a telephone service and does not replace or substitute for a local or domestic telephone service. The Virtual Number Service may include, depending on the applicable Product Description, the OTP Service, the Inbound Calls Service, the Inbound SMS Service, the Outbound Calls Service, the Outbound SMS Service, or a combination thereof. The type of communications and functionality supported under the Virtual Number Service, the scope of permitted use, available country or territory, usage limits, renewal rules, eligibility criteria and any service-specific restrictions are determined by nowsim and set out in the applicable Product Description.`,
          },
          {
            kind: "text",
            body: `4.4.2. A Virtual Number is assigned to the User automatically through the nowsim Application and may be assigned on a random basis. A Virtual Number does not confer any ownership right on the User. Unless expressly stated otherwise in the applicable Product Description, the User may not choose a specific Virtual Number, and the number may not be visible to the User before purchase or activation. A Virtual Number may be reclaimed, reassigned, restricted or deactivated by nowsim in accordance with these ToS, the applicable Product Description, upstream provider requirements or regulatory requirements.`,
          },
          {
            kind: "text",
            body: `4.4.3. The Virtual Number Service is subject to these ToS, the Acceptable Use Policy and the applicable Product Description. In the event of a conflict between these ToS and a product-specific condition set out in the applicable Product Description, including with respect to service scope, territory, eligibility, allowances, pricing, renewal rules or other service-specific conditions, the applicable Product Description shall prevail with respect to that specific condition.`,
          },
          {
            kind: "text",
            body: `4.4.4. The relevant Virtual Number shall be activated upon successful receipt of payment in the manner specified in the nowsim Application or in the applicable Product Description.`,
          },
          {
            kind: "text",
            body: `4.4.5. The User shall use the Virtual Number strictly in accordance with the type of service and scope of functionality specified in the applicable Product Description. Any use of the Virtual Number beyond the scope specified in the applicable Product Description, or any use in violation of these ToS or the Acceptable Use Policy, shall constitute a material breach of these ToS.`,
          },
          {
            kind: "text",
            body: `4.4.6. nowsim does NOT guarantee that a specific Virtual Number will remain available to the User after the expiration, deactivation, suspension or termination of the applicable Rental Period or other relevant service period, or that the same number will be available for future rental, reactivation or reassignment to the same User.`,
          },
          {
            kind: "text",
            body: `4.4.7. Where nowsim introduces, enables or makes available additional functionality in relation to the Virtual Number Service, such functionality shall be reflected in the applicable Product Description and, where necessary, in updated Terms. Acceptance of these ToS does not entitle the User to any functionality not expressly described in the applicable Product Description.`,
          },
        ],
      },
      {
        title: "4.5. OTP Service",
        blocks: [
          {
            kind: "text",
            body: `4.5.1. Where expressly offered by nowsim, the OTP Service is a Virtual Number functionality intended solely for receiving automated verification-related inbound communications, including one-time password (OTP) calls and/or one-time password (OTP) SMS, as specified in the applicable Product Description. The OTP Service does not support person-to-person voice conversations and does not permit outbound calls or outbound SMS unless such functionality is separately and expressly included in the applicable Product Description.`,
          },
          {
            kind: "text",
            body: `4.5.2. nowsim does NOT guarantee that any OTP Virtual Number will be accepted, recognized or supported by any third-party platform, verification system, two-factor authentication mechanism or other external service, nor does nowsim guarantee the delivery, timeliness or reliability of any OTP communications.`,
          },
          {
            kind: "text",
            body: `4.5.3. The OTP Service may be provided on a standalone or Add-On basis, as specified in the applicable Product Description.`,
          },
        ],
      },
      {
        title: "4.6. Inbound Calls Service",
        blocks: [
          {
            kind: "text",
            body: `4.6.1. Where expressly included in the applicable Product Description, the Inbound Calls Service enables the User to receive incoming voice calls through the nowsim Application on the Virtual Number. The Inbound Calls Service is subject to the applicable traffic limits, included allowances, territorial availability and other service-specific conditions set out in the applicable Product Description. The Inbound Calls Service operates only through the nowsim Application using VoIP functionality and does not use the device’s ordinary cellular calling functionality.`,
          },
          {
            kind: "text",
            body: `4.6.2. The Inbound Calls Service may be provided on a standalone or Add-On basis, as specified in the applicable Product Description.`,
          },
        ],
      },
      {
        title: "4.7. Outbound Calls Service",
        blocks: [
          {
            kind: "text",
            body: `4.7.1. Where expressly included in the applicable Product Description, the Outbound Calls Service enables the User to initiate outgoing voice calls through the nowsim Application from the Virtual Number to permitted destinations. The Outbound Calls Service is subject to the applicable traffic limits, included allowances, territorial availability, destination restrictions, blocked prefixes and other service-specific conditions set out in the applicable Product Description. The Outbound Calls Service operates only through the nowsim Application using VoIP functionality and does not use the device’s ordinary cellular calling functionality.`,
          },
          {
            kind: "text",
            body: `4.7.2. The Outbound Calls Service may be provided on a standalone or Add-On basis, as specified in the applicable Product Description.`,
          },
        ],
      },
      {
        title: "4.8. Inbound SMS Service",
        blocks: [
          {
            kind: "text",
            body: `4.8.1. Where expressly included in the applicable Product Description, the Inbound SMS Service enables the User to receive incoming SMS on the Virtual Number. The Inbound SMS Service is subject to the applicable traffic limits, message allowances, territorial availability and other service-specific conditions set out in the applicable Product Description. The Inbound SMS Service may be provided on a standalone or Add-On basis, as specified in the applicable Product Description.`,
          },
        ],
      },
      {
        title: "4.9. Outbound SMS Service",
        blocks: [
          {
            kind: "text",
            body: `4.9.1. Where expressly included in the applicable Product Description, the Outbound SMS Service enables the User to send outgoing SMS from the Virtual Number to permitted destinations. The Outbound SMS Service is subject to the applicable traffic limits, message allowances, territorial availability, destination restrictions and other service-specific conditions set out in the applicable Product Description. The Outbound SMS Service may be provided on a standalone or Add-On basis, as specified in the applicable Product Description.`,
          },
        ],
      },
      {
        title: "4.10. VPN Service",
        blocks: [
          {
            kind: "text",
            body: `4.10.1. Where available, nowsim may offer a VPN Service through the nowsim Application. The VPN Service requires the nowsim Application to be downloaded and installed on the User’s device and, unless expressly stated otherwise in the applicable Product Description, is not available as a desktop service and is limited to 1 (one) device per subscription.`,
          },
          {
            kind: "text",
            body: `4.10.2. The VPN Service is provided on a prepaid basis only, unless nowsim expressly states otherwise in the applicable Product Description.`,
          },
          {
            kind: "text",
            body: `4.10.3. The VPN Service may be provided on a standalone or Add-On basis, as specified in the applicable Product Description.`,
          },
          {
            kind: "text",
            body: `4.10.4. The available subscription options, supported countries or locations, tiers, technical parameters, usage conditions, restrictions and other service-specific conditions of the VPN Service shall be determined solely by nowsim and set out in the applicable Product Description. No specific server type, proxy type, routing method, protocol specification or other infrastructure characteristic shall be deemed included unless expressly stated in the applicable Product Description.`,
          },
        ],
      },
    ],
  },
  {
    title: "5. Use of nowsim Application",
    parts: [
      {
        title: "5.1. General",
        blocks: [
          {
            kind: "text",
            body: `5.1.1. To use the nowsim Application, nowsim Products and Services, You must register an Account by completing the registration form and providing the information requested. You must provide true, accurate, current and complete information, and keep it updated. As part of the registration process, You must provide an email address (which will serve as Your login), a password, and a valid payment method. Upon creation of the Account, nowsim will send a confirmation notice to the email address provided.`,
          },
          {
            kind: "text",
            body: `5.1.2. nowsim Products and Services may only be sold to and used by persons 18 years of age (or the age of legal majority in the User's country of residence, if higher). By creating an Account, You represent and warrant that You meet this age requirement.`,
          },
          {
            kind: "text",
            body: `5.1.3. You are fully responsible for the use of the nowsim Application, nowsim Products and Services, and the eSIM/SIM. Under no circumstances shall nowsim be liable for any loss, limitation of the functionalities available, expense or damage incurred or suffered by the User resulting from the User's misuse, fraud or non-conforming use of the nowsim Application, nowsim Products and Services and/or eSIM.`,
          },
          {
            kind: "text",
            body: `5.1.4. You are solely responsible for determining whether the access to, purchase, download, installation, possession, use or continued use of any nowsim Products and Services is lawful in the country, territory or jurisdiction in which You are located or from which You access or use such nowsim Products and Services. This applies, without limitation, to any local laws, regulations, licensing requirements, import or telecom restrictions, censorship rules, encryption controls, VPN restrictions or similar legal limitations that may apply in the relevant jurisdiction. nowsim does not represent or warrant that any nowsim Product or Service is permitted, lawful or compliant in every country or jurisdiction in which the User may be located at the time of access or use, and nowsim shall not be liable for the User’s use, attempted use or inability to use any nowsim Product or Service due to any such local legal or regulatory restrictions.`,
          },
        ],
      },
      {
        title: "5.2. Identity Verification and KYC",
        blocks: [
          {
            kind: "text",
            body: `5.2.1. nowsim may, at any time and at its reasonable discretion, or when required by applicable law, regulation or a request from a competent authority, require the User to provide documentation and information in order to verify the User's identity, legal capacity, residency status, or eligibility to use a particular nowsim Product or Service. All documents provided must be clear and legible.`,
          },
          {
            kind: "text",
            body: `5.2.2. You must provide nowsim with any identification, verification or other documentation upon nowsim's request, within the timeframe specified by nowsim. Failure to provide requested documentation within the specified timeframe or in requested form may result in suspension or restriction of Your Account or specific nowsim Products or Services, including deactivation of a Virtual Number.`,
          },
          {
            kind: "text",
            body: `5.2.3. Unless nowsim expressly requests otherwise, all documents required under Clauses 5.2.1 and 5.2.2 shall be submitted as digital copies (scan or photograph) via email or via the nowsim Application or another channel specified by nowsim.`,
          },
          {
            kind: "text",
            body: `5.2.4. nowsim may use third-party service providers, contractors or technology partners to perform identity verification, KYC, fraud prevention, sanctions screening and related compliance checks on its behalf. The User acknowledges and agrees that, for such purposes, nowsim may share the information and documentation provided under this Clause 5.2 with such third parties in accordance with applicable law and the Privacy Policy.`,
          },
          {
            kind: "text",
            body: `5.2.5. nowsim may, at any time and in its reasonable discretion, impose limitations on, suspend or terminate Your Account and use of nowsim Products and Services, without liability to You, if You fail to comply with the requirements set out in Clauses 5.2.1 and 5.2.2.`,
          },
        ],
      },
      {
        title: "5.3. Account Security",
        blocks: [
          {
            kind: "text",
            body: (
              <>
                5.3.1. You are responsible for maintaining the security and
                confidentiality of Your Account credentials (login, password and
                any other authentication data) and for all activities occurring
                under Your Account. You shall not share Your credentials with
                any third party. nowsim shall not be liable for any loss or
                damage arising from Your failure to comply with this Clause,
                subject to the limitations of liability set out in Section 12.
                You must notify nowsim immediately of any unauthorized use of
                Your Account, Login or Password or any other violation of Your
                security by contacting{" "}
                <a href={`mailto:${supportEmail}`} className={legalLink}>
                  {supportEmail}
                </a>
                .
              </>
            ),
          },
          {
            kind: "text",
            body: `5.3.2. nowsim reserves the right to refuse registration of, or to cancel, any Account at its discretion, including where nowsim reasonably suspects fraudulent, abusive or unauthorized activity.`,
          },
          {
            kind: "text",
            body: `5.3.3. You agree that all activities occurring under Your Account (including accepting the Terms, making purchases, activating services, and making payments) shall be deemed to have been performed by You, and You are solely responsible for such activities, unless they are the direct result of a Force Majeure Event.`,
          },
          {
            kind: "text",
            body: `5.3.4. nowsim shall not be liable for any loss or damage arising from Your failure to maintain the confidentiality of Your Account credentials or from unauthorized access to Your Account that is not attributable to nowsim.`,
          },
        ],
      },
      {
        title: "5.4. Account Termination and Inactivity",
        blocks: [
          {
            kind: "text",
            body: (
              <>
                5.4.1. You may request the termination of Your Account at any
                time by submitting a request to:{" "}
                <a href={`mailto:${supportEmail}`} className={legalLink}>
                  {supportEmail}
                </a>{" "}
                or using the Contact Support form. Upon termination, nowsim
                shall disconnect the User&apos;s access to Services and/or
                nowsim Products. Termination of the Account does not entitle the
                User to any refund for unused Virtual Number Rental Periods,
                Subscriptions, prepaid Data, YCOINS, or other prepaid services,
                except as expressly provided in Section 7.
              </>
            ),
          },
          {
            kind: "text",
            body: `5.4.2. If the User does not use the nowsim Application for any continuous period of 180 (one hundred eighty) days, nowsim reserves the right to deactivate or delete the User's Account and terminate all associated Services, without prior notice and without any refund, repayment or compensation. Any Virtual Numbers assigned to such Account shall be deactivated and returned to the numbering pool.`,
          },
        ],
      },
      {
        title: "5.5. Penalties",
        blocks: [
          { kind: "text", body: `5.5.1. In the event of:` },
          {
            kind: "list",
            items: [
              `(a) a material breach of any terms and restrictions set out in the Terms, nowsim is entitled, without prior notice and at its sole discretion, to suspend or terminate Your Account and any Products and Services associated with Your Account, and/or restrict, suspend or terminate Your access to and use of the nowsim Application and other nowsim Products and Services;`,
              `(b) a material breach under Clause 4.4.5, nowsim is entitled, without prior notice and at its sole discretion, to charge a contractual penalty of EUR 1,000.00 (one thousand euros) per breach; the User hereby authorizes nowsim to deduct this amount from the payment method specified in the User's Account or from the User's YCOINS balance.`,
            ],
          },
          {
            kind: "text",
            body: `5.5.2. Payment of the contractual penalty under Clause 5.5.1(b) shall not release the User from the obligation to compensate nowsim for any damages, losses, costs or expenses arising from or in connection with the breach, including claims by third parties, regulatory fines and reputational harm.`,
          },
          {
            kind: "text",
            body: `5.5.3. The User acknowledges that certain third-party services or platforms may restrict, block or otherwise limit the use of virtual, VoIP-based or non-geographic telephone numbers, including nowsim Virtual Numbers. nowsim does not guarantee the acceptance or functionality of a Virtual Number on any third-party service or platform. nowsim shall not be liable for any inability to use a Virtual Number on a third-party service or platform, or for any actions, penalties, suspensions, bans or other measures imposed by such service or platform in connection with the User's use of a Virtual Number, subject to the limitations of liability set out in Section 12.`,
          },
          {
            kind: "text",
            body: `5.5.4. The User acknowledges that the enforcement measures described in Clause 5.5.1 are contractual remedies applied in response to the User's breach. nowsim's liability for any loss arising from the application of such measures shall be governed by, and limited to, the provisions of Section 12.`,
          },
        ],
      },
      {
        title: "5.6. Emergency Services Limitation",
        blocks: [
          {
            kind: "text",
            body: `5.6.1. The emergency services limitation set out in Clause 3.8 applies in full to the Virtual Number Service. For the avoidance of doubt, no Virtual Number may be used to contact emergency services in any jurisdiction.`,
          },
        ],
      },
      {
        title: "5.7. Promotional Programs",
        blocks: [
          {
            kind: "text",
            body: `5.7.1. Promotional campaigns, promo codes, discounts, referral programs and any similar incentive programs offered by nowsim (collectively, "Promotional Programs") are provided solely for eligible Users and strictly in accordance with the terms, conditions and limitations applicable to each specific Promotional Program as may be published and amended from time to time.`,
          },
          {
            kind: "text",
            body: `5.7.2. Unless expressly stated otherwise in the applicable Promotional Program rules, Promotional Programs are intended exclusively for new Users and/or for use within the scope, duration and conditions of a particular promotion.`,
          },
          {
            kind: "text",
            body: `5.7.3. You may participate in Promotional Programs only in accordance with the applicable rules and limitations established by nowsim. Any participation beyond the permitted scope or contrary to the applicable rules is not allowed.`,
          },
          {
            kind: "text",
            body: `5.7.4. The following actions constitute abuse of Promotional Programs and are strictly prohibited (non-exhaustive list):`,
          },
          {
            kind: "list",
            items: [
              `(a) creating, using or controlling multiple Accounts by You, directly or indirectly, for the purpose of participation in Promotional Programs;`,
              `(b) using temporary, fictitious, misleading, third-party or otherwise inaccurate personal, registration or payment data;`,
              `(c) taking any actions aimed at circumventing, bypassing or manipulating the limitations, eligibility criteria or technical safeguards of Promotional Programs;`,
              `(d) engaging in any other actions or patterns of behaviour that nowsim reasonably determines to constitute abuse, misuse or violation of the rules of Promotional Programs.`,
            ],
          },
          {
            kind: "text",
            body: `5.7.5. Any violation or attempted violation of the rules governing Promotional Programs shall constitute a material breach of these ToS. nowsim reserves the right, at its discretion and without prior notice, to:`,
          },
          {
            kind: "list",
            items: [
              `(a) immediately suspend or terminate the User's Account and terminate the Agreement; or`,
              `(b) cancel, revoke or invalidate any bonuses, discounts, credits, promotional benefits or other advantages obtained by the User, without compensation or reimbursement. The application of these measures shall not limit nowsim's other rights or remedies under the Terms or applicable law.`,
            ],
          },
          {
            kind: "text",
            body: `5.7.6. nowsim shall have the right to independently determine whether Your actions constitute a violation or abuse of Promotional Programs and to apply the measures described in Clause 5.7.5 without prior notice to You.`,
          },
        ],
      },
      {
        title: "5.8. Product Duration and Allowances",
        blocks: [
          {
            kind: "text",
            body: `5.8.1. Each nowsim Product or Service is provided for the validity period, Subscription period or Rental Period specified in the applicable Product Description, commencing upon activation. Products may be purchased individually or together, or as a Bundle, and may have different activation dates, validity periods, and renewal terms.`,
          },
          {
            kind: "text",
            body: `5.8.2. The Product or Service is activated as displayed in the nowsim Application.`,
          },
          {
            kind: "text",
            body: `5.8.3. Any unused allowances (data, call minutes, SMS, VPN traffic or other included units) expire at the end of the applicable validity period, Subscription period or Rental Period and are NOT carried over, refunded, or compensated, unless expressly stated otherwise in the Product Description.`,
          },
        ],
      },
    ],
  },
  {
    title: "6. Payments, Fees and Top-Up",
    parts: [
      {
        title: "6.1. General",
        blocks: [
          {
            kind: "text",
            body: `6.1.1. All prices, fees and charges for nowsim Products and Services are as displayed in the nowsim Application, on the Website and/or in the applicable Product Description at the time of purchase. nowsim reserves the right to change prices, fees and pricing mechanics for future purchases at any time; however, such changes shall not affect purchases already completed, unless otherwise required by applicable law or expressly stated in the applicable Product Description.`,
          },
          {
            kind: "text",
            body: `6.1.2. nowsim performs a minimum charge of EUR 0.5 to verify each new card added by the User. This amount is refunded to the User’s balance in the form of EUR 0.5 in YCOINS.`,
          },
          {
            kind: "text",
            body: `6.1.3. Unless expressly stated otherwise in the applicable Product Description, all nowsim Products and Services are provided on a prepaid basis only. nowsim Products and Services are activated or made available only after nowsim has received the applicable payment in full.`,
          },
          {
            kind: "text",
            body: `6.1.4. The User may make payments using the payment methods made available by nowsim in the nowsim Application, on the Website or in the relevant checkout flow, which may include credit or debit card, YCOINS and other payment methods offered by nowsim from time to time. The availability of particular payment methods may vary depending on the relevant nowsim Product or Service, the User’s location, the applicable checkout flow or other criteria determined by nowsim or the relevant payment provider. nowsim reserves the right to add, remove or modify available payment methods without prior notice.`,
          },
          {
            kind: "text",
            body: `6.1.5. nowsim may make available an internal balance or loyalty-based payment functionality, including YCOINS, which the User may Top Up, hold and use toward the purchase of selected nowsim Products and Services, in whole or in part, subject to the relevant checkout flow, Product Description and any usage limitations communicated by nowsim at the time of purchase. The availability, redemption mechanics and treatment of YCOINS shall be governed by these Terms and the applicable Product Description, where relevant.`,
          },
        ],
      },
      {
        title: "6.2. Add-On and Bundle Payments",
        blocks: [
          {
            kind: "text",
            body: `6.2.1. nowsim Products and Services may be purchased individually, as Add-Ons to an eligible primary Product or Service. Where purchased together in a single transaction, such combination may constitute a Bundle. The applicable purchase conditions, eligible combinations and pricing for Add-Ons and Bundles are as specified in the applicable Product Description.`,
          },
          {
            kind: "text",
            body: `6.2.2. Unless nowsim expressly states otherwise in the applicable Product Description, an Add-On cannot be purchased, activated, upgraded, renewed, extended or supplemented on a standalone basis.`,
          },
          {
            kind: "text",
            body: `6.2.3. A Bundle constitutes a single transaction comprising a primary nowsim Product or Service and one or more Add-Ons. Each Add-On forming part of a Bundle is subject to the rules set out in Clause 6.2.2. The Bundle price is as specified in the applicable Product Description and may differ from the aggregate price of the individual components if purchased separately.`,
          },
        ],
      },
      {
        title: "6.3. eSIM and Data Plan Payments",
        blocks: [
          {
            kind: "text",
            body: `6.3.1. After registration of the Account, the User’s eSIM will not be preloaded with Data. The Data must be purchased separately by selecting the nowsim Data Plan offered via nowsim Application. After purchase, nowsim shall make available to You the QR code and/or activation details for installation of Your eSIM profile on Your device, as further described in the nowsim Application and the applicable installation instructions.`,
          },
          {
            kind: "text",
            body: `6.3.2. The eSIM profile may be installed on Your device using one of the following methods made available through the nowsim Application: (a) fast installation, which initiates the installation directly through the nowsim Application without requiring a second device; (b) QR code installation, by scanning the QR code provided by nowsim using a second device or the device’s camera where supported; or (c) manual installation, by entering the activation details provided by nowsim in Your device settings. If You are installing the eSIM on the same device from which You are accessing the QR code, You must use fast installation option or send the QR code to another device for scanning. Detailed installation instructions are available in the nowsim Application. Your eSIM profile details will be available in the Account and sent to the email address associated with the Account.`,
          },
          {
            kind: "text",
            body: `6.3.3. After payment, the eSIM will be loaded with the Data specified in the selected Data Plan and will be active in the countries or zones specified in the nowsim Application for that Data Plan. The User may control and disable certain countries from usage where this functionality is available.`,
          },
        ],
      },
      {
        title: "6.4. OTP Service Payments",
        blocks: [
          {
            kind: "text",
            body: `6.4.1. The fee for the OTP Service covers the assignment of a Virtual Number for the applicable Rental Period and the included allowances or limited inbound functionality, if any, as specified in the applicable Product Description. OTP Service is limited to automated verification-related inbound communications, including one-time password (OTP) calls and/or one-time password (OTP) SMS. The fee does not include any charges that may be imposed by third-party services, telecommunications operators or other parties.`,
          },
          {
            kind: "text",
            body: `6.4.2. If the User has enabled the subscription (auto-renewal) feature for an OTP Service, the Rental Period will be automatically renewed at the end of each period, provided that:`,
          },
          {
            kind: "list",
            items: [
              `(a) the User has sufficient funds (YCOINS or another accepted payment method – if any) on the Account; and`,
              `(b) the Virtual Number remains available and has not been withdrawn or restricted by nowsim, a Participating Member Operator or a regulatory authority.`,
            ],
          },
        ],
      },
    ],
  },
  {
    summary:
      "This page is still being published. Clauses from 6.4.3 onward, together with the remaining sections and the Effective Date, will be added shortly. For the complete Terms in the meantime, contact support@nowsim.com.",
  },
];

function Meta() {
  return (
    <dl className="grid gap-x-8 gap-y-4 rounded-card border border-hairline p-5 text-base text-muted sm:grid-cols-2 md:p-6">
      <div>
        <dt className="text-eyebrow uppercase tracking-[0.08em] text-ink/45">
          Provider
        </dt>
        <dd className="mt-2">
          GENESIS GROUP AG
          <br />
          CHE-135.623.633
          <br />
          Bahnhofstrasse 4, 6340 Baar, Switzerland
        </dd>
      </div>

      <div>
        <dt className="text-eyebrow uppercase tracking-[0.08em] text-ink/45">
          Support
        </dt>
        <dd className="mt-2">
          <a href={`mailto:${supportEmail}`} className={legalLink}>
            {supportEmail}
          </a>
        </dd>
      </div>
    </dl>
  );
}

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      lede={`These Terms of Service ("Agreement" and/or "ToS") are binding and govern the relationship between the User ("You" and/or "User") and GENESIS GROUP AG, CHE-135.623.633, legal address: Bahnhofstrasse 4, 6340 Baar, Switzerland (hereinafter, "nowsim").`}
      meta={<Meta />}
      sections={sections}
    />
  );
}
