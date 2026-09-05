import "server-only";

import { env } from "@/lib/env";
import { installHref } from "@/lib/install";
import { LOGO_CID, logoAttachment } from "@/lib/mail/logo";
import {
  deliver,
  escapeHtml,
  FONT,
  preheader,
  type Attachment,
} from "@/lib/mail/send";
import { isDeployed } from "@/lib/stage";
import type { Esim } from "@/lib/types";

const DATA_URI = /^data:image\/(png|jpeg|gif);base64,(.+)$/i;

/** Mail runs outside a request, so absolute links come from the environment. */
const SITE = env.NEXT_PUBLIC_SITE_URL;

/** The HTML points at the QR attachment with src="cid:...". */
const QR_CID = "nowsim-esim-qr";

const BRAND = "#5f47eb";
const BRAND_TINT = "#efecfd";
const INK = "#0a2233";
const MUTED = "#5a6b78";
const FAINT = "#8a97a0";
const HAIRLINE = "#e6e2f7";
const DASHED = "#cfc6f2";
const PAGE = "#f1eefc";
const FOOTER_TINT = "#f7f5fe";

const link = `${FONT};color:${BRAND};font-weight:700;text-decoration:none`;

function qrAttachment(qrImage: string | undefined): Attachment | undefined {
  const match = qrImage?.match(DATA_URI);

  if (!match) return undefined;

  return {
    filename: `nowsim-esim-qr.${match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase()}`,
    content: match[2],
    contentId: QR_CID,
  };
}

type Credentials = {
  /** Apple asks for the address and the code separately. */
  smdp?: string;
  code?: string;
  /** Android takes the whole LPA line, colon and dollars included. */
  full: string;
};

/**
 * An activation code arrives as one LPA string, "LPA:1$smdp.io$K2-...". Apple's
 * manual form wants it split; Android's wants it whole. Anything that is not an
 * LPA line is passed through untouched rather than guessed at.
 */
function credentials(activationCode: string | undefined): Credentials | undefined {
  if (!activationCode) return undefined;

  const parts = activationCode.split("$");

  if (!/^LPA:/i.test(activationCode) || parts.length < 3) {
    return { code: activationCode, full: activationCode };
  }

  return { smdp: parts[1], code: parts[2], full: activationCode };
}

type Step = {
  title: string;
  /** One per line under the title: paths first, then the note. */
  lines: string[];
};

/**
 * Installing and switching on are two jobs, so they are two sections, and each
 * step carries both platform paths instead of splitting the mail per phone.
 * The paths match the site guides in lib/install.ts.
 */
const installSteps: Step[] = [
  {
    title: "Open the Add eSIM screen",
    lines: [
      "iPhone and iPad: Settings → Mobile Data → Add eSIM",
      "Android: Settings → Network & internet → SIMs → Add eSIM",
    ],
  },
  {
    title: "Scan the QR code from this email",
    lines: [
      "Point the camera at the code on the other screen and follow the on-screen instructions.",
    ],
  },
  {
    title: "On iPhone, select ‘Abroad’, then ‘Data Only’",
    lines: [
      "The plan is for travel outside your country, and it carries internet only. Calls and SMS are not included.",
    ],
  },
  {
    title: "Let the plan download",
    lines: ["Stay on Wi-Fi until the download finishes."],
  },
  {
    title: "Label the new plan ‘nowsim’",
    lines: [
      "It makes the line easy to find later. You can rename it in Settings at any time.",
    ],
  },
];

const activationSteps: Step[] = [
  {
    title: "Turn the nowsim line on",
    lines: [
      "iPhone and iPad: Settings → Mobile Data → nowsim → Turn On This Line",
      "Android: Settings → Network & internet → SIMs → nowsim",
      "After enabling, go back and reopen the screen to refresh the plan.",
    ],
  },
  {
    title: "Turn on Data Roaming",
    lines: [
      "On the nowsim line only, in the same screen.",
      "nowsim runs on partner networks, so the line stays offline without roaming.",
    ],
  },
  {
    title: "Send mobile data over nowsim",
    lines: [
      "Pick nowsim as the SIM used for mobile data.",
      "On iPhone, switch off Allow Mobile Data Switching so your home number is never charged.",
    ],
  },
];

const fastSteps: string[] = [
  "Open this email on the iPhone that will use the eSIM.",
  "Tap <strong style=\"font-weight:700;color:#0a2233\">Install eSIM in one tap</strong> in the card at the end of this email.",
  "Follow the prompts iOS shows you. Do not interrupt the process while the plan downloads.",
];

function divider(inset = true): string {
  return `<tr>
              <td style="padding:32px ${inset ? "40px" : "0"} 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr><td style="height:1px;background:${HAIRLINE};line-height:1px;font-size:0">&nbsp;</td></tr>
                </table>
              </td>
            </tr>`;
}

function sectionHead(number: number, title: string): string {
  return `<tr>
              <td style="padding:28px 40px 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="28" style="${FONT};background:${BRAND};color:#ffffff;font-size:14px;font-weight:700;text-align:center;width:28px;height:28px;line-height:28px;border-radius:14px">${number}</td>
                    <td style="${FONT};padding-left:12px;font-size:19px;font-weight:700;letter-spacing:-0.01em;color:${INK}">${title}</td>
                  </tr>
                </table>
              </td>
            </tr>`;
}

/** Tinted bar that opens one of the three install routes. */
function methodHead(title: string, note: string, top = 30): string {
  return `<tr>
              <td style="padding:${top}px 40px 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="${FONT};background:${BRAND_TINT};padding:12px 16px;font-size:16px;font-weight:700;letter-spacing:-0.01em;color:${INK}">
                      ${title}
                      <span style="${FONT};font-size:13px;font-weight:400;color:${MUTED}">&nbsp;${note}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;
}

function subLine(text: string): string {
  return `<span style="display:block;font-weight:400;line-height:1.6;color:${MUTED};padding-top:4px">
                        ${text}
                      </span>`;
}

function stepRow(step: Step, index: number, last: boolean): string {
  const gap = last ? "" : "padding-bottom:16px";

  return `<tr>
                    <td width="26" valign="top" style="${FONT};width:26px;font-size:14px;line-height:1.5;color:${BRAND};font-weight:700;${gap}">${index + 1}.</td>
                    <td style="${FONT};font-size:14px;line-height:1.5;color:${INK};font-weight:700;${gap}">
                      ${escapeHtml(step.title)}
                      ${step.lines.map((line) => subLine(escapeHtml(line))).join("\n                      ")}
                    </td>
                  </tr>`;
}

/** A step with no title of its own, for the short 1-tap list. */
function plainRow(text: string, index: number, last: boolean): string {
  const gap = last ? "" : "padding-bottom:12px";

  return `<tr>
                    <td width="26" valign="top" style="${FONT};width:26px;font-size:14px;line-height:1.5;color:${BRAND};font-weight:700;${gap}">${index + 1}.</td>
                    <td style="${FONT};font-size:14px;line-height:1.6;color:${MUTED};${gap}">
                      ${text}
                    </td>
                  </tr>`;
}

function stepList(rows: string[], top = 16): string {
  return `<tr>
              <td style="padding:${top}px 40px 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  ${rows.join("\n                  ")}
                </table>
              </td>
            </tr>`;
}

/** Bordered panel. The last three blocks of the mail are all built from this. */
function card(inner: string, top = 16): string {
  return `<tr>
              <td style="padding:${top}px 40px 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${HAIRLINE};border-radius:12px;background:#ffffff">
                  ${inner}
                </table>
              </td>
            </tr>`;
}

function cardTitle(title: string, note?: string): string {
  return `<tr>
                    <td align="center" style="${FONT};padding:20px 24px 0;font-size:15px;font-weight:700;color:${INK}">
                      ${title}
                      ${note ? `<span style="font-weight:400;color:${MUTED}">&nbsp;${note}</span>` : ""}
                    </td>
                  </tr>`;
}

/**
 * Left-aligned card title, for a card holding a single value rather than a
 * centred figure. Centring a short label above a full-width tinted box leaves
 * the two reading as unrelated blocks.
 */
function cardTitleLeft(title: string, note?: string): string {
  return `<tr>
                    <td align="left" style="${FONT};padding:20px 24px 0;font-size:15px;font-weight:700;color:${INK}">
                      ${title}
                      ${note ? `<span style="font-weight:400;color:${MUTED}">&nbsp;${note}</span>` : ""}
                    </td>
                  </tr>`;
}

/**
 * A single labelled value, label stacked over value on one left edge.
 *
 * The two-column dataRow below is for a label that heads several lines of
 * values; with one short value it strands the label and the value at opposite
 * sides of the box.
 */
function stackedRow(label: string, text: string): string {
  return `<tr>
                    <td style="padding:14px 24px 20px">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${FOOTER_TINT}">
                        <tr>
                          <td style="${FONT};padding:14px 18px;font-size:13px;line-height:1.6;color:${MUTED}">
                            ${label}
                            <span style="display:block;font-size:15px;font-weight:700;color:${INK};word-break:break-all;padding-top:3px">${escapeHtml(text)}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>`;
}

/** One labelled column of copyable values inside the manual card. */
function dataRow(label: string, values: string, last: boolean): string {
  return `<tr>
                    <td style="padding:${last ? "10px 24px 20px" : "18px 24px 0"}">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${FOOTER_TINT}">
                        <tr>
                          <td width="140" valign="top" style="${FONT};width:140px;padding:16px 0 16px 18px;font-size:14px;font-weight:700;color:${INK}">
                            ${label}
                          </td>
                          <td valign="top" style="${FONT};padding:16px 18px;font-size:13px;line-height:1.6;color:${MUTED}">
                            ${values}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>`;
}

function value(text: string): string {
  return `<span style="display:block;font-size:14px;font-weight:700;color:${INK};word-break:break-all;padding-top:2px">${escapeHtml(text)}</span>`;
}

function hint(text: string): string {
  return `<span style="display:block;padding-top:10px;font-size:12px;color:${FAINT}">${text}</span>`;
}

function stepsText(steps: Step[]): string[] {
  return steps.map((step, index) =>
    [`${index + 1}. ${step.title}`, ...step.lines.map((line) => `   ${line}`)].join(
      "\n",
    ),
  );
}

function body(esim: Esim, email: string, hasQr: boolean) {
  const year = new Date().getUTCFullYear();
  const heading = esim.plan
    ? `Let’s get your ${esim.plan.destination} eSIM running`
    : "Let’s get your eSIM running";
  const shape = esim.plan
    ? `${esim.plan.data} · ${esim.plan.days} day${esim.plan.days === 1 ? "" : "s"}`
    : "";
  const creds = credentials(esim.activationCode);
  const iosGuide = `${SITE}${installHref("ios")}`;
  const androidGuide = `${SITE}${installHref("android")}`;

  const text = [
    heading,
    shape,
    "Thanks for your order. If this is your first eSIM, you need to install it and switch it on. It is easier than it sounds. Follow the steps below; your QR code and activation details are at the end of this email.",
    "BEFORE YOU START. Stay on Wi-Fi through the whole install. An eSIM installs once, on one device. A failed or repeated attempt cannot be undone.",
    "You can install anywhere: at home before you fly, or after you land. Installing does not start your plan.",
    "1. INSTALLATION",
    "Please note: an eSIM can be installed only once, and only on one device. Keep the phone on Wi-Fi until the plan finishes downloading.",
    esim.iosTapLink
      ? `FAST INSTALLATION (iPhone, iOS 17.4 and later)\nOpen this email on the iPhone that will use the eSIM and tap the 1-tap link: ${esim.iosTapLink}`
      : "",
    ["INSTALLATION VIA QR CODE", ...stepsText(installSteps)].join("\n"),
    creds
      ? [
          "MANUAL INSTALLATION",
          "iPhone and iPad: tap Enter Details Manually, then use the values below. Leave the confirmation code empty.",
          "Android: tap Need help?, then Enter it manually, and paste the activation code.",
        ].join("\n")
      : `MANUAL INSTALLATION\nOpen ${SITE}/esims and tap Install details for the values to type in.`,
    `Step-by-step guides with screenshots: ${iosGuide} and ${androidGuide}`,
    "2. ACTIVATION",
    "Once the eSIM is installed, three settings switch it on.",
    ...stepsText(activationSteps),
    "Once roaming is on, it can take 5 to 10 minutes to find a network the first time.",
    hasQr
      ? "SCAN THE QR CODE. The code is attached to this email. Scan it from the phone that will use the eSIM. On iPhone with iOS 17.4 or later, press and hold the code and pick Add eSIM."
      : `Open ${SITE}/esims and tap Install details to get your QR code.`,
    creds?.smdp
      ? `ENTER THE DATA MANUALLY\nApple devices — SM-DP+ address: ${creds.smdp}, activation code: ${creds.code}\nAndroid devices — activation code: ${creds.full}`
      : creds
        ? `ENTER THE DATA MANUALLY\nActivation code: ${creds.full}`
        : "",
    "Keep this email to yourself. Anyone holding the activation code can install this eSIM, and it only installs once.",
    `Stuck at any step? Read ${SITE}/help or write to support@nowsim.com from this address. We answer fast.`,
    "Safe travels, the nowsim team",
    `Sent to ${email}`,
    `Copyright © ${year} nowsim. All rights reserved.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:${PAGE}">
    ${preheader("Install your eSIM and switch it on in a few steps")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE}">
      <tr>
        <td align="center" style="padding:32px 12px">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#ffffff">

            <tr>
              <td style="background:${BRAND};height:4px;line-height:4px;font-size:0">&nbsp;</td>
            </tr>

            <tr>
              <td style="padding:40px 40px 0">
                <img src="cid:${LOGO_CID}" alt="nowsim" width="150" height="25" style="display:block;width:150px;height:25px;border:0;outline:none;text-decoration:none" />
              </td>
            </tr>

            <tr>
              <td style="padding:36px 40px 0">
                <h1 style="${FONT};margin:0;font-size:26px;font-weight:700;line-height:1.2;letter-spacing:-0.02em;color:${INK}">
                  ${escapeHtml(heading)}
                </h1>
              </td>
            </tr>

            ${
              shape
                ? `<tr>
              <td style="padding:14px 40px 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="${FONT};background:${BRAND_TINT};padding:10px 18px;border-radius:999px;font-size:16px;font-weight:700;letter-spacing:-0.01em;color:${BRAND};white-space:nowrap">
                      ${escapeHtml(shape)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`
                : ""
            }

            <tr>
              <td style="${FONT};padding:20px 40px 0;font-size:15px;line-height:1.65;color:${INK}">
                Thanks for your order. If this is your first eSIM, you need to
                install it and switch it on. It is easier than it sounds. Follow
                the steps below; your QR code and activation details are at the
                end of this email.
              </td>
            </tr>

            <tr>
              <td style="padding:24px 40px 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="${FONT};background:${BRAND_TINT};padding:14px 18px;font-size:14px;line-height:1.6;color:${INK}">
                      <strong style="font-weight:700">Before you start.</strong>
                      Stay on Wi-Fi through the whole install. An eSIM installs
                      <strong style="font-weight:700">once</strong>, on
                      <strong style="font-weight:700">one device</strong>. A
                      failed or repeated attempt cannot be undone.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="${FONT};padding:16px 40px 0;font-size:14px;line-height:1.6;color:${MUTED}">
                You can install anywhere: at home before you fly, or after you
                land. Installing does not start your plan.
              </td>
            </tr>

            ${divider()}
            ${sectionHead(1, "Installation")}

            <tr>
              <td style="${FONT};padding:14px 40px 0;font-size:14px;line-height:1.6;color:${MUTED}">
                <strong style="font-weight:700;color:${INK}">Please note:</strong>
                an eSIM can be installed only once, and only on one device. Keep
                the phone on Wi-Fi until the plan finishes downloading.
              </td>
            </tr>

            <tr>
              <td style="${FONT};padding:16px 40px 0;font-size:14px;line-height:1.6;color:${MUTED}">
                There ${esim.iosTapLink ? "are three ways" : "are two ways"} to add your nowsim eSIM. Pick
                whichever suits the phone in your hand.
              </td>
            </tr>

            ${
              esim.iosTapLink
                ? `${methodHead("Fast installation", "iPhone, iOS 17.4 and later", 24)}
            ${stepList(fastSteps.map((step, index) => plainRow(step, index, index === fastSteps.length - 1)))}`
                : ""
            }

            ${methodHead("Installation via QR code", "iPhone, iPad, and Android", esim.iosTapLink ? 30 : 24)}

            <tr>
              <td style="${FONT};padding:14px 40px 0;font-size:14px;line-height:1.6;color:${MUTED}">
                ${
                  hasQr
                    ? `You need a second screen for this: open the QR code at the end of
                this email on a laptop or another phone, then scan it with the
                phone that will use the eSIM.`
                    : `Open <a href="${SITE}/esims" style="${link}">My eSIMs</a> on a laptop or
                another phone to show the QR code, then scan it with the phone
                that will use the eSIM.`
                }
              </td>
            </tr>

            ${stepList(
              installSteps.map((step, index) =>
                stepRow(step, index, index === installSteps.length - 1),
              ),
            )}

            ${methodHead("Manual installation", "when the QR code cannot be scanned")}

            <tr>
              <td style="${FONT};padding:14px 40px 0;font-size:14px;line-height:1.6;color:${MUTED}">
                Open the same Add eSIM screen and type the details in by hand.
                ${
                  creds
                    ? "They are in the last card at the end of this email."
                    : `Open <a href="${SITE}/esims" style="${link}">My eSIMs</a> and tap Install details to see them.`
                }
                <span style="display:block;padding-top:8px">
                  <strong style="font-weight:700;color:${INK}">iPhone and iPad:</strong>
                  tap Enter Details Manually, paste the SM-DP+ address and the
                  activation code, and leave the confirmation code empty.
                </span>
                <span style="display:block;padding-top:6px">
                  <strong style="font-weight:700;color:${INK}">Android:</strong>
                  tap Need help?, then Enter it manually, and paste the
                  activation code.
                </span>
              </td>
            </tr>

            <tr>
              <td style="padding:26px 40px 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="${FONT};background:${BRAND_TINT};padding:16px 18px;font-size:14px;line-height:1.7;color:${INK}">
                      <strong style="font-weight:700">More information</strong>
                      <span style="display:block;padding-top:6px;color:${MUTED}">
                        Step-by-step guides with screenshots:
                        <a href="${iosGuide}" style="${link}">iOS devices</a>
                        and
                        <a href="${androidGuide}" style="${link}">Android devices</a>.
                      </span>
                      <span style="display:block;padding-top:6px;color:${MUTED}">
                        Not sure your phone takes an eSIM? Check the
                        <a href="${SITE}/help/esim-compatible-devices" style="${link}">compatible devices</a>
                        list, or read the
                        <a href="${SITE}/help" style="${link}">help centre</a>.
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            ${divider()}
            ${sectionHead(2, "Activation")}

            <tr>
              <td style="${FONT};padding:14px 40px 0;font-size:14px;line-height:1.6;color:${MUTED}">
                Once the eSIM is installed, three settings switch it on. Do these
                when you land, or before you fly — either works.
              </td>
            </tr>

            ${stepList(
              activationSteps.map((step, index) =>
                stepRow(step, index, index === activationSteps.length - 1),
              ),
            )}

            <tr>
              <td style="${FONT};padding:20px 40px 0;font-size:14px;line-height:1.6;color:${MUTED}">
                Once roaming is on, it can take 5 to 10 minutes to find a network
                the first time.
              </td>
            </tr>

            <tr>
              <td style="padding:26px 40px 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="${FONT};background:${BRAND_TINT};padding:18px;font-size:14px;line-height:1.65;color:${INK}" align="center">
                      Stuck at any step? Read the
                      <a href="${SITE}/help" style="${link}">help centre</a>
                      or write to
                      <a href="mailto:support@nowsim.com" style="${link}">support@nowsim.com</a>
                      from this address. We answer fast.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="${FONT};padding:26px 40px 0;font-size:15px;line-height:1.6;color:${INK}" align="center">
                Safe travels,<br />
                <strong style="font-weight:700">the nowsim team</strong>
              </td>
            </tr>

            ${divider()}

            ${
              hasQr
                ? card(
                    `${cardTitle("Scan the QR code")}
                  <tr>
                    <td align="center" style="padding:16px 24px 0">
                      <img src="cid:${QR_CID}" width="200" height="200" alt="eSIM QR code" style="display:block;width:200px;height:200px;border:1px solid ${DASHED}" />
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="${FONT};padding:14px 24px 20px;font-size:13px;line-height:1.6;color:${MUTED}">
                      On iPhone with iOS 17.4 or later, press and hold the QR
                      code and pick
                      <strong style="font-weight:700;color:${INK}">Add eSIM</strong>.
                    </td>
                  </tr>`,
                    28,
                  )
                : `<tr>
              <td style="${FONT};padding:28px 40px 0;font-size:14px;line-height:1.6;color:${MUTED}" align="center">
                Open <a href="${SITE}/esims" style="${link}">My eSIMs</a> and tap
                Install details to get your QR code.
              </td>
            </tr>`
            }

            ${
              esim.iosTapLink
                ? card(
                    `${cardTitle("1-Tap installation", "for iOS")}
                  <tr>
                    <td align="center" style="${FONT};padding:8px 24px 0;font-size:13px;line-height:1.6;color:${MUTED}">
                      Open this email on the iPhone that will use the eSIM, then
                      tap the button.
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding:16px 24px 0">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="${FONT};background:${BRAND};padding:15px 30px;border-radius:999px">
                            <a href="${escapeHtml(esim.iosTapLink)}" style="${FONT};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none">
                              Install eSIM in one tap
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="${FONT};padding:12px 24px 20px;font-size:13px;line-height:1.6;color:${FAINT}">
                      Works on iPhone only, from the phone that will use the eSIM.
                    </td>
                  </tr>`,
                  )
                : ""
            }

            ${
              creds
                ? card(
                    `${cardTitle("Or enter the data manually")}
                  <tr>
                    <td align="center" style="${FONT};padding:8px 24px 0;font-size:13px;line-height:1.6;color:${MUTED}">
                      Copy these values into the matching fields in your phone’s
                      Settings.
                    </td>
                  </tr>

                  ${
                    creds.smdp
                      ? `${dataRow(
                          "Apple devices",
                          `SM-DP+ address
                            ${value(creds.smdp)}
                            <span style="display:block;padding-top:10px">Activation code</span>
                            ${value(creds.code ?? creds.full)}
                            ${hint("Leave the confirmation code empty.")}`,
                          false,
                        )}

                  ${dataRow(
                    "Android devices",
                    `Activation code
                            ${value(creds.full)}
                            ${hint("Paste the whole line, LPA: included.")}`,
                    true,
                  )}`
                      : dataRow(
                          "All devices",
                          `Activation code
                            ${value(creds.full)}
                            ${hint("On iPhone, leave the confirmation code empty.")}`,
                          true,
                        )
                  }`,
                  )
                : ""
            }

            <tr>
              <td style="${FONT};padding:24px 40px 0;font-size:13px;line-height:1.6;color:${FAINT}">
                Keep this email to yourself. Anyone holding the activation code
                can install this eSIM, and it only installs once.
              </td>
            </tr>

            ${divider(false)}

            <tr>
              <td style="background:${FOOTER_TINT};padding:26px 40px">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="${FONT};font-size:13px;line-height:1.8;color:${MUTED};padding-bottom:14px" align="center">
                      <a href="${SITE}" style="${FONT};color:${MUTED};text-decoration:none">Website</a> &nbsp;·&nbsp;
                      <a href="${SITE}/help" style="${FONT};color:${MUTED};text-decoration:none">Help centre</a> &nbsp;·&nbsp;
                      <a href="${SITE}/esims" style="${FONT};color:${MUTED};text-decoration:none">My eSIMs</a>
                    </td>
                  </tr>

                  <tr>
                    <td style="${FONT};font-size:12px;line-height:1.7;color:${FAINT};padding-bottom:12px" align="center">
                      Sent to <span style="color:${BRAND};font-weight:700">${escapeHtml(email)}</span>
                    </td>
                  </tr>

                  <tr>
                    <td style="${FONT};font-size:12px;line-height:1.7;color:${FAINT}" align="center">
                      Copyright © ${year} nowsim. All rights reserved.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { text, html };
}

/**
 * The mail for a plan written onto an eSIM the customer already installed.
 *
 * Deliberately not the mail above. There is nothing to install, no QR code to
 * scan and no activation code to keep secret — the profile is already on the
 * phone. Install instructions here would read as a mistake, and worse, would
 * invite someone to try installing a card that can only ever be installed once.
 *
 * The activation steps stay: a line left over from an earlier trip may still be
 * switched off or have roaming disabled.
 */
function topUpBody(esim: Esim, email: string) {
  const year = new Date().getUTCFullYear();
  const heading = esim.plan
    ? `Your ${esim.plan.destination} plan is on your eSIM`
    : "Your new plan is on your eSIM";
  const shape = esim.plan
    ? `${esim.plan.data} · ${esim.plan.days} day${esim.plan.days === 1 ? "" : "s"}`
    : "";
  const tail = esim.iccid.slice(-6);

  const opening =
    "Thanks for your order. This plan was added to the eSIM already on your device, so there is nothing to install and no QR code to scan. Any plan that was on that eSIM before has been replaced.";

  const text = [
    heading,
    shape,
    opening,
    `Added to the eSIM ending ${tail}. Full ICCID: ${esim.iccid}`,
    "CHECK IT IS SWITCHED ON",
    "If you have not used this eSIM for a while, these three settings may need turning back on.",
    ...stepsText(activationSteps),
    "Once roaming is on, it can take 5 to 10 minutes to find a network the first time.",
    `You can see this plan any time at ${SITE}/esims.`,
    `Stuck at any step? Read ${SITE}/help or write to support@nowsim.com from this address. We answer fast.`,
    "Safe travels, the nowsim team",
    `Sent to ${email}`,
    `Copyright © ${year} nowsim. All rights reserved.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:${PAGE}">
    ${preheader("Nothing to install - your new plan is ready to use")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE}">
      <tr>
        <td align="center" style="padding:32px 12px">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#ffffff">

            <tr>
              <td style="background:${BRAND};height:4px;line-height:4px;font-size:0">&nbsp;</td>
            </tr>

            <tr>
              <td style="padding:40px 40px 0">
                <img src="cid:${LOGO_CID}" alt="nowsim" width="150" height="25" style="display:block;width:150px;height:25px;border:0;outline:none;text-decoration:none" />
              </td>
            </tr>

            <tr>
              <td style="padding:36px 40px 0">
                <h1 style="${FONT};margin:0;font-size:26px;font-weight:700;line-height:1.2;letter-spacing:-0.02em;color:${INK}">
                  ${escapeHtml(heading)}
                </h1>
              </td>
            </tr>

            ${
              shape
                ? `<tr>
              <td style="padding:14px 40px 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="${FONT};background:${BRAND_TINT};padding:10px 18px;border-radius:999px;font-size:16px;font-weight:700;letter-spacing:-0.01em;color:${BRAND};white-space:nowrap">
                      ${escapeHtml(shape)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`
                : ""
            }

            <tr>
              <td style="${FONT};padding:20px 40px 0;font-size:15px;line-height:1.65;color:${INK}">
                ${opening}
              </td>
            </tr>

            ${card(
              `${cardTitleLeft("Added to the eSIM ending", escapeHtml(tail))}
                  ${stackedRow("ICCID", esim.iccid)}`,
              24,
            )}

            ${sectionHead(1, "Check it is switched on")}

            <tr>
              <td style="${FONT};padding:12px 40px 0;font-size:14px;line-height:1.65;color:${MUTED}">
                If you have not used this eSIM for a while, these three settings
                may need turning back on.
              </td>
            </tr>

            ${stepList(
              activationSteps.map((step, index) =>
                stepRow(step, index, index === activationSteps.length - 1),
              ),
            )}

            <tr>
              <td style="${FONT};padding:16px 40px 0;font-size:13px;line-height:1.6;color:${FAINT}">
                Once roaming is on, it can take 5 to 10 minutes to find a network
                the first time.
              </td>
            </tr>

            ${divider(false)}

            <tr>
              <td style="background:${FOOTER_TINT};padding:26px 40px">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="${FONT};font-size:13px;line-height:1.8;color:${MUTED};padding-bottom:14px" align="center">
                      <a href="${SITE}" style="${FONT};color:${MUTED};text-decoration:none">Website</a> &nbsp;·&nbsp;
                      <a href="${SITE}/help" style="${FONT};color:${MUTED};text-decoration:none">Help centre</a> &nbsp;·&nbsp;
                      <a href="${SITE}/esims" style="${FONT};color:${MUTED};text-decoration:none">My eSIMs</a>
                    </td>
                  </tr>

                  <tr>
                    <td style="${FONT};font-size:12px;line-height:1.7;color:${FAINT};padding-bottom:12px" align="center">
                      Sent to <span style="color:${BRAND};font-weight:700">${escapeHtml(email)}</span>
                    </td>
                  </tr>

                  <tr>
                    <td style="${FONT};font-size:12px;line-height:1.7;color:${FAINT}" align="center">
                      Copyright © ${year} nowsim. All rights reserved.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { text, html };
}

/** No QR attachment — the eSIM is already on the phone. */
export async function sendPlanAddedEmail(
  email: string,
  esim: Esim,
): Promise<void> {
  const { text, html } = topUpBody(esim, email);

  const sent = await deliver({
    to: email,
    subject: esim.plan
      ? `Your ${esim.plan.destination} plan is on your eSIM`
      : "Your new plan is on your eSIM",
    text,
    html,
    attachments: [logoAttachment()],
  });

  if (sent) return;

  if (isDeployed) {
    throw new Error(
      "RESEND_API_KEY is missing. Cannot mail the plan confirmation.",
    );
  }

  console.info(`\n  nowsim plan on ${esim.iccid} would be mailed to ${email}\n`);
}

export async function sendEsimEmail(email: string, esim: Esim): Promise<void> {
  const qr = qrAttachment(esim.qrImage);
  const { text, html } = body(esim, email, Boolean(qr));

  const sent = await deliver({
    to: email,
    subject: esim.plan
      ? `Your ${esim.plan.destination} eSIM is ready to install`
      : "Your nowsim eSIM is ready to install",
    text,
    html,
    attachments: qr ? [logoAttachment(), qr] : [logoAttachment()],
  });

  if (sent) return;

  if (isDeployed) {
    throw new Error(
      "RESEND_API_KEY is missing. Cannot mail the eSIM install details.",
    );
  }

  console.info(`\n  nowsim eSIM ${esim.iccid} would be mailed to ${email}\n`);
}
