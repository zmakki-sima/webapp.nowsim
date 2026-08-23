import "server-only";

import { LOGO_CID, logoAttachment } from "@/lib/mail/logo";
import { deliver, escapeHtml, FONT } from "@/lib/mail/send";

const BRAND = "#5f47eb";
const BRAND_TINT = "#efecfd";
const INK = "#0a2233";
const MUTED = "#5a6b78";
const FAINT = "#8a97a0";
const HAIRLINE = "#e6e2f7";
const PAGE = "#f1eefc";
const FOOTER = "#f7f5fe";

function body(email: string, code: string, minutes: number) {
  const year = new Date().getUTCFullYear();

  const text = [
    "Verify your email address",
    `Your nowsim confirmation code is: ${code}`,
    `Use this temporary code to finish signing in. It expires in ${minutes} minutes and can be used once.`,
    "If you received this email in error, you can safely ignore it. Nobody can sign in without the code.",
    `Account email: ${email}`,
    `Copyright © ${year} nowsim. All rights reserved.`,
  ].join("\n\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:${PAGE}">
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
                <h1 style="${FONT};margin:0;font-size:22px;font-weight:700;line-height:1.25;letter-spacing:-0.02em;color:${INK}">
                  Verify your email address
                </h1>
              </td>
            </tr>

            <tr>
              <td style="${FONT};padding:20px 40px 0;font-size:15px;line-height:1.5;color:${INK}">
                Dear traveller, your nowsim confirmation code is:
              </td>
            </tr>

            <tr>
              <td style="padding:20px 40px 0">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="${FONT};background:${BRAND_TINT};padding:16px 28px;font-size:28px;font-weight:400;letter-spacing:0.3em;color:${BRAND}">
                      ${code}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="${FONT};padding:24px 40px 0;font-size:15px;line-height:1.6;color:${INK}">
                Use this temporary code to finish signing in on the nowsim website.
                It expires in ${minutes} minutes and can be used once.
              </td>
            </tr>

            <tr>
              <td style="${FONT};padding:36px 40px 0;font-size:13px;line-height:1.6;color:${FAINT}">
                If you received this email in error, you can safely ignore it.
                Nobody can sign in without the code.
              </td>
            </tr>

            <tr>
              <td style="${FONT};padding:18px 40px 0;font-size:13px;line-height:1.6;color:${MUTED}">
                Account email:
                <span style="color:${BRAND};font-weight:700">${escapeHtml(email)}</span>
              </td>
            </tr>

            <tr>
              <td style="padding:36px 0 0">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background:${HAIRLINE};height:1px;line-height:1px;font-size:0">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="${FONT};background:${FOOTER};padding:26px 40px;font-size:12px;line-height:1.6;color:${FAINT}">
                Copyright © ${year} nowsim. All rights reserved.
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

export async function sendOtpEmail(
  email: string,
  code: string,
  expiresIn: number,
): Promise<void> {
  const minutes = Math.round(expiresIn / 60);
  const { text, html } = body(email, code, minutes);

  const sent = await deliver({
    to: email,
    subject: `${code} is your nowsim confirmation code`,
    text,
    html,
    attachments: [logoAttachment()],
  });

  if (sent) return;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "RESEND_API_KEY is missing. Refusing to sign anyone in without delivering the code.",
    );
  }

  console.info(
    `\n  nowsim OTP for ${email}: ${code}  (expires in ${minutes}m)\n`,
  );
}
