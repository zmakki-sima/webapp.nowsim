/**
 * How long a customer waits between install mails for the same eSIM. The
 * server holds the lock; the card reads it too, so its spent button comes back
 * exactly when a second send would go through.
 *
 * Kept out of the action file because `"use server"` modules may only export
 * async functions.
 */
export const ESIM_MAIL_COOLDOWN_SECONDS = 60;
