"use client";

import "./globals.css";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col items-center justify-center gap-6 px-6 text-center">
        <title>Something went wrong - nowsim</title>

        <h1 className="text-h2 font-extrabold tracking-[-0.03em]">
          We lost the signal
        </h1>

        <p className="max-w-[46ch] text-base text-muted">
          Something went wrong before the page could load. Try again. If it
          keeps happening, come back in a moment.
        </p>

        <button
          type="button"
          onClick={() => unstable_retry()}
          className="cursor-pointer rounded-full bg-brand px-6 py-3.5 text-base font-medium text-white hover:bg-brand-soft"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
