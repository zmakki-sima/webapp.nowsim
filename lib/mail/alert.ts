import "server-only";

import { env } from "@/lib/env";
import { deliver, escapeHtml, FONT } from "@/lib/mail/send";
import type { OrderRecord } from "@/lib/payments/orders";
import { isDeployed } from "@/lib/stage";

/**
 * Where "paid but not delivered" lands (PAYMENT.md §13.5). Customer service
 * owns it: this is the address that has to act, not a shared inbox nobody is
 * accountable for. Overridable so staging can point somewhere harmless, but it
 * has a default — an unset variable must never mean "send the alert nowhere".
 */
const SUPERVISOR = process.env.ORDER_ALERT_EMAIL || "zmakki@sima-difc.com";

/** Mail runs outside a request, so absolute links come from the environment. */
const SITE = env.NEXT_PUBLIC_SITE_URL;

const INK = "#0a2233";
const MUTED = "#5a6b78";
const ALARM = "#b3261e";
const ALARM_TINT = "#fdeceb";
const HAIRLINE = "#e4e7e9";
const PAGE = "#f4f6f7";

/** Cents to "18.00 EUR". The record holds the smallest currency unit. */
function money(order: OrderRecord): string {
  return `${(order.amount / 100).toFixed(2)} ${order.currency.toUpperCase()}`;
}

function target(order: OrderRecord): string {
  return order.install.kind === "existing"
    ? `existing eSIM ${order.install.iccid} (${order.install.name})`
    : `${order.quantity} new eSIM${order.quantity === 1 ? "" : "s"}`;
}

/**
 * What the supervisor has to know to act, in the order they need it: how much
 * money is held, whose it is, what was owed, and what — if anything — was
 * actually delivered before the failure.
 */
function facts(order: OrderRecord): [string, string][] {
  const rows: [string, string][] = [
    [order.status === "fulfilled" ? "Paid" : "Money held", money(order)],
    ["Order", order.id],
    ["Status", order.status],
    ["Customer", order.email],
    ["Destination", order.destination],
    ["Ordered", target(order)],
    ["Plan", order.planId],
    [
      "Delivered so far",
      order.issued.length === 0
        ? "nothing"
        : order.issued.map((entry) => entry.iccid).join(", "),
    ],
  ];

  // Only present once the money has cleared, but that is exactly when this mail
  // is sent — and it is what a refund is issued against in the dashboard.
  if (order.paymentIntentId) {
    rows.push(["Stripe payment intent", order.paymentIntentId]);
  }

  return rows;
}

/**
 * Two different emergencies reach this mail, and confusing them wastes the
 * minutes it exists to save.
 *
 * `failed` — money taken, no card. Refunding is manual by decision, so the mail
 * names that as the next step.
 *
 * `fulfilled` — the card exists and the customer owns it; only the email did
 * not arrive. Refunding that would be a mistake: the fix is to get the details
 * to them, and they can already see the eSIM under /esims.
 */
function headline(order: OrderRecord): string {
  return order.status === "fulfilled"
    ? "eSIM delivered, customer not told"
    : `${money(order)} held, nothing delivered`;
}

function situation(order: OrderRecord): string {
  return order.status === "fulfilled"
    ? "The eSIM was issued and the customer owns it, but the email carrying it did not go out. They do not yet know they have it."
    : "Payment cleared and the eSIM could not be issued. No refund happens automatically, so this order stays open until a person closes it.";
}

function action(order: OrderRecord): string {
  return order.status === "fulfilled"
    ? "Do not re-buy and do not refund — the card exists. Resend the install details to the customer, or point them at their eSIMs page. The order is already correct."
    : "Check Yesim, then either issue the missing eSIM(s) by hand or refund the undelivered part from the Stripe dashboard. The refund event brings the order back in step on its own.";
}

function row([label, value]: [string, string], last: boolean): string {
  const gap = last ? "" : `border-bottom:1px solid ${HAIRLINE}`;

  return `<tr>
                    <td width="170" valign="top" style="${FONT};width:170px;padding:12px 16px;font-size:13px;color:${MUTED};${gap}">
                      ${escapeHtml(label)}
                    </td>
                    <td valign="top" style="${FONT};padding:12px 16px;font-size:14px;font-weight:700;color:${INK};word-break:break-all;${gap}">
                      ${escapeHtml(value)}
                    </td>
                  </tr>`;
}

function body(order: OrderRecord, detail: string) {
  const rows = facts(order);
  const stamp = new Date().toISOString();

  const text = [
    "ORDER NEEDS ATTENTION",
    headline(order),
    situation(order),
    `What failed: ${detail}`,
    ...rows.map(([label, value]) => `${label}: ${value}`),
    `Raised at: ${stamp}`,
    `WHAT TO DO. ${action(order)}`,
    `Order in Stripe: https://dashboard.stripe.com/payments/${order.paymentIntentId ?? ""}`,
    `Customer's eSIMs: ${SITE}/esims`,
    "This is an automated alert from nowsim fulfilment. Nobody else was told.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:${PAGE}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE}">
      <tr>
        <td align="center" style="padding:28px 12px">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#ffffff">

            <tr>
              <td style="background:${ALARM};height:4px;line-height:4px;font-size:0">&nbsp;</td>
            </tr>

            <tr>
              <td style="padding:32px 32px 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="${FONT};background:${ALARM_TINT};padding:8px 14px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${ALARM}">
                      Order needs attention
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px 0">
                <h1 style="${FONT};margin:0;font-size:24px;font-weight:700;line-height:1.25;letter-spacing:-0.02em;color:${INK}">
                  ${escapeHtml(headline(order))}
                </h1>
              </td>
            </tr>

            <tr>
              <td style="${FONT};padding:14px 32px 0;font-size:15px;line-height:1.6;color:${INK}">
                ${escapeHtml(situation(order))}
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="${FONT};background:${ALARM_TINT};padding:14px 16px;font-size:14px;line-height:1.6;color:${INK}">
                      <strong style="font-weight:700">What failed.</strong>
                      ${escapeHtml(detail)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 32px 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${HAIRLINE}">
                  ${rows
                    .map((entry, index) => row(entry, index === rows.length - 1))
                    .join("\n                  ")}
                </table>
              </td>
            </tr>

            <tr>
              <td style="${FONT};padding:22px 32px 0;font-size:14px;line-height:1.6;color:${INK}">
                <strong style="font-weight:700">What to do.</strong>
                ${escapeHtml(action(order))}
              </td>
            </tr>

            <tr>
              <td style="${FONT};padding:18px 32px 0;font-size:14px;line-height:1.9;color:${MUTED}">
                ${
                  order.paymentIntentId
                    ? `<a href="https://dashboard.stripe.com/payments/${escapeHtml(order.paymentIntentId)}" style="${FONT};color:${ALARM};font-weight:700;text-decoration:none">Open the payment in Stripe</a><br />`
                    : ""
                }
                <a href="${SITE}/esims" style="${FONT};color:${ALARM};font-weight:700;text-decoration:none">The customer's eSIMs</a>
              </td>
            </tr>

            <tr>
              <td style="padding:26px 32px 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr><td style="height:1px;background:${HAIRLINE};line-height:1px;font-size:0">&nbsp;</td></tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="${FONT};padding:16px 32px 32px;font-size:12px;line-height:1.7;color:${MUTED}">
                Automated alert from nowsim fulfilment · raised ${escapeHtml(stamp)}<br />
                The customer has not been told. Nobody else received this.
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
 * Mails the supervisor that money is held and nothing arrived.
 *
 * Throws on failure — every caller is inside fulfilment's own catch, which logs
 * the console line regardless. Swallowing here would hide a broken alert
 * channel, which is worse than the failure it is reporting.
 */
export async function sendOrderAlertEmail(
  order: OrderRecord,
  detail: string,
): Promise<void> {
  const { text, html } = body(order, detail);

  const sent = await deliver({
    to: SUPERVISOR,
    subject: `[nowsim] ${headline(order)} — order ${order.id}`,
    text,
    html,
  });

  if (sent) return;

  // No key configured. On a deployment that is the alert channel being down,
  // and silence is the one outcome this whole file exists to prevent.
  if (isDeployed) {
    throw new Error(
      `RESEND_API_KEY is missing. Cannot alert ${SUPERVISOR} about order ${order.id}.`,
    );
  }

  console.info(`\n  order alert for ${order.id} would be mailed to ${SUPERVISOR}\n`);
}

export { SUPERVISOR as ORDER_ALERT_TO };
