import "server-only";

import { Resend } from "resend";

import { authEnv } from "@/lib/auth/env";

let client: Resend | null = null;

export const FONT = "font-family:Arial,Helvetica,sans-serif";

/**
 * Where an answer lands. `AUTH_EMAIL_FROM` is a send-only mailbox on the mail
 * subdomain, so without this header a customer who hits reply on a sign-in or
 * delivery mail writes into nothing. Same address the mails already print in
 * their own footer, so the two never disagree.
 */
export const REPLY_TO = "support@nowsim.com";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * The grey second line under the subject in an inbox row or a phone
 * notification. Without one, a client scrapes the top of the mail instead and
 * the preview reads as a run-on of the logo alt text, the heading and the
 * first paragraph. Hidden in every client that renders the mail, so the
 * visible email is unchanged — this only writes the preview line.
 *
 * The trailing padding is what stops the client scraping body text to fill the
 * rest of the line: zero-width joiners and soft hyphens draw nothing but still
 * count as characters.
 */
export function preheader(text: string): string {
  const pad = "&#847;&zwnj;&nbsp;&#8199;&shy;".repeat(30);

  return `<div style="display:none;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff">${escapeHtml(text)}${pad}</div>`;
}

/**
 * `contentId` turns the file into an inline part the HTML can reference with
 * `src="cid:<contentId>"`. Without it the file only rides along as a download.
 */
export type Attachment = {
  filename: string;
  content: string;
  contentId?: string;
};

export type Message = {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: Attachment[];
};

export async function deliver(message: Message): Promise<boolean> {
  const env = authEnv();

  if (!env.RESEND_API_KEY) return false;

  client ??= new Resend(env.RESEND_API_KEY);

  const { error } = await client.emails.send({
    from: env.AUTH_EMAIL_FROM,
    replyTo: REPLY_TO,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
    attachments: message.attachments,
  });

  if (error) {
    throw new Error(
      `Resend refused the message: ${error.name}. ${error.message}`,
    );
  }

  return true;
}
