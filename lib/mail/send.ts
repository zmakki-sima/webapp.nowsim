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
