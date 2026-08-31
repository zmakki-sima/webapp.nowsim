"use client";

import { useEffect } from "react";

/**
 * Every `error.tsx` boundary gets handed the error that broke the page, and
 * without this hook every one of them dropped it on the floor — the user saw
 * "something broke" and we saw nothing at all.
 *
 * A crash on the client is the one class of bug that never reaches the server
 * logs by itself, so this is the only place it can be caught. For a Server
 * Component error the `message` is deliberately scrubbed in production, and
 * `digest` is the hash that ties it back to the real stack in the server log —
 * which makes the digest the useful half, not an afterthought.
 *
 * Today this only reaches the browser console. That is already the difference
 * between a reproducible report and a shrug, and it is the single seam to route
 * into a reporting service when there is one.
 */
export function useReportError(
  error: Error & { digest?: string },
  boundary: string,
) {
  useEffect(() => {
    console.error(`[${boundary}] ${error.message}`, {
      digest: error.digest,
      error,
    });
  }, [error, boundary]);
}
