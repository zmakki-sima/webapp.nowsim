# FIXME — what's left

Checked against the code on 2026-08-27. Anything already fixed has been removed
from this file.

---

## Blockers — must be fixed before launch

- **Delete account button does nothing.** It's live, red, and has no handler — a
  user who clicks it will think their account was deleted.
  [`AccountAction.tsx:259`](components/layout/AccountAction.tsx) *(waiting on
  the deletion API) 🟡*
- **Terms of Service is unfinished and public.** Ends with "This page is still
  being published." No Effective Date.
  [`terms-of-service/page.tsx:755`](app/(site)/terms-of-service/page.tsx)
  *(waiting on legal) 🟡*
- **Two dead links inside Terms** — `nowsim.com/cof/` and
  `nowsim.com/acceptable-use-policy/`. Neither page exists.
  [`page.tsx:52,67`](app/(site)/terms-of-service/page.tsx) *(waiting on legal) 🟡*
- **Three different review scores on the same site**, all unsourced: 4.8
  Trustpilot ([`TrustBar.tsx:20`](components/common/TrustBar.tsx)), 4.9 App Store
  ([`About.tsx:64`](components/sections/main/About.tsx)), 4.7 with 97,400+
  reviews ([`PlanPicker.tsx:261`](components/sections/destinations/PlanPicker.tsx)).
  Plus "1,657,382,391 Gigabytes delivered"
  ([`About.tsx:74`](components/sections/main/About.tsx)) *(waiting on marketing) 🟡*
- **FAQ promises a compatibility check that doesn't exist** — "We check
  compatibility at checkout, so you'll know before you pay."
  [`Faq.tsx:23`](components/common/Faq.tsx) *(waiting on copy)* 🟡
- **Yesim API token travels in the URL**, so it lands in logs we don't control.
  [`yesim.ts:40`](lib/api/yesim.ts) — blocked on one question to Yesim: *does
  your API accept the token in a header instead of `?token=`?* If yes, it's a
  two-line change. If no, rotate the token before launch. 🔴🔴🔴🔴🔴

## Payments

The Stripe integration is built and working. What's left:

- **A real alert channel — highest priority.** When payment clears but the eSIM
  can't be issued, the failure only reaches `console.error`.
  [`fulfil.ts:130`](lib/payments/fulfil.ts). Refunds are manual by decision, so
  there's no safety net — an unread alert means we keep a customer's money.
- **Run the sandbox test matrix** — see [`PAYMENT.md`](PAYMENT.md) §9. None of it
  has been run.
- **Decide currency settlement** — the Stripe account is CHF, prices are EUR.
- **Confirm the Stripe account** — Connect and a "Swan sandbox" account are
  unexplained.
- **Go live** — Stripe's account review takes real calendar time; start early.

## Content

- **Country hero images cover only ~64%** (95 of ~148). The set runs a→`morocco`
  then jumps to `united-states`; everything between falls back to a generic
  image. [`heroes.ts:57`](lib/heroes.ts)

## SEO

- **No `robots.ts` and no `sitemap.ts`** — even though
  [`proxy.ts:38`](proxy.ts) already excludes them from its matcher.
- **No `metadataBase`** in [`app/layout.tsx`](app/layout.tsx) — share and
  canonical URLs will point at `localhost` in production.
- **No Open Graph or Twitter metadata and no share image.** Every link shared on
  social media renders bare.
- **Stray empty `{}`** at [`app/layout.tsx:55`](app/layout.tsx).

## Correctness

- **All 9 error boundaries throw the error away.** Each receives it and never
  uses it, so every client-side crash vanishes with no way to report it.
  [`app/error.tsx`](app/error.tsx), [`app/global-error.tsx`](app/global-error.tsx),
  plus 7 per-section ones.
- **[`app/error.tsx`](app/error.tsx) is nearly unreachable** — `(site)`,
  `(account)` and `checkout` each have their own — and its contents duplicate
  [`app/(site)/error.tsx`](app/(site)/error.tsx) word for word.
- **Google sign-in is listed but not implemented.**
  [`providers.ts:4,18`](lib/auth/providers.ts) names `google` while only email
  works. Remove the entry.
- **`/purchases` is missing from `PROTECTED`** ([`proxy.ts:12`](proxy.ts)). Not a
  security hole — the data layer returns nothing without a session — but
  signed-out users see an empty page instead of a redirect.
- **Dev-only logging prints personal data** — a live OTP and email
  ([`mailer.ts:140`](lib/auth/mailer.ts)), an ICCID and email
  ([`esim.ts:885,910`](lib/mail/esim.ts)). Both sit behind a production guard;
  just confirm those guards hold before launch.

## Duplication

Tidy-ups, not bugs. Safe to defer.

- **Three near-identical search dialogs** — Coverage, Network and Device share
  layout, filter logic and scroll container.
  [`CoverageDialog.tsx`](components/sections/destinations/CoverageDialog.tsx),
  [`NetworkDialog.tsx`](components/sections/destinations/NetworkDialog.tsx),
  [`DeviceDialog.tsx`](components/sections/destinations/DeviceDialog.tsx)
- **Device filtering duplicated** between
  [`DeviceDialog.tsx:29`](components/sections/destinations/DeviceDialog.tsx) and
  [`DeviceExplorer.tsx:17`](components/sections/devices/DeviceExplorer.tsx)
- **Destination search built twice** —
  [`DestinationSearch.tsx`](components/sections/main/DestinationSearch.tsx) and
  [`NextTripFinder.tsx`](components/sections/main/NextTripFinder.tsx). The former
  also hand-rolls its own `<input>` instead of using the shared
  [`SearchField`](components/ui/SearchField.tsx).
- **Card style tokens copy-pasted** between
  [`EsimCard.tsx`](components/sections/esims/EsimCard.tsx) and
  [`PurchaseCard.tsx`](components/sections/purchases/PurchaseCard.tsx)
- **`function Empty()` duplicated** in
  [`EsimList.tsx`](components/sections/esims/EsimList.tsx) and
  [`PurchaseList.tsx`](components/sections/purchases/PurchaseList.tsx) —
  identical but for the icon and two strings
- **Auth form constants copy-pasted** between
  [`EmailSignIn.tsx`](components/auth/EmailSignIn.tsx) and
  [`ConfirmIdentity.tsx`](components/sections/esims/ConfirmIdentity.tsx), and the
  OTP input block is re-implemented rather than shared

## Docs / tooling

- **[`README.md`](README.md) is still Next.js boilerplate** — wrong entry file,
  wrong font (says Geist; the project uses Satoshi and Figtree), and a Vercel
  tracking link.
- **`YESIM_API_BASE` is undocumented** in [`.env.example`](.env.example). Minor —
  it has a default.
- **[`scripts/hero-names.mjs`](scripts/hero-names.mjs) is orphaned** — no npm
  script runs it, and it writes to a folder that doesn't exist.
- **`next-env.d.ts` was hand-edited** despite its "do not edit" notice. It's
  gitignored, so the edit vanishes on regeneration. Check whether it's needed; if
  so, move it into `tsconfig.json`.
- **No tests, no CI, no `.github/`, no Dockerfile, no `vercel.json`.** `lint` and
  `typecheck` exist but nothing enforces them.
- **Decide whether [`PLAN.md`](PLAN.md) ships.** It also records 4 unresolved
  high-severity `npm audit` findings in `sharp`/libvips needing Next 16.3.0 — the
  project is pinned to 16.2.12.

## Security hardening

- **No security headers at all** — no CSP, HSTS, `X-Content-Type-Options`,
  `Referrer-Policy` or `Permissions-Policy`. There's no `headers()` block in
  [`next.config.ts`](next.config.ts).
- **No `serverActions.allowedOrigins`.**
- **Personal data in a POST URL** — [`user.ts:8`](lib/auth/user.ts) sends the
  customer's email as a URL parameter to `new_user`. Same logging problem as the
  Yesim token above.

---

## Do not re-flag

Checked and deliberately closed:

- **OTP guessing limits.** 6-digit cryptographic codes (1,000,000
  possibilities), 5 guesses per code, 5 codes per email/hour, 20 per IP/hour,
  5-minute expiry, `timingSafeEqual` comparison. That's ~100 guesses/hour against
  a million. A per-IP cap on failed guesses would add nothing.
- **`AUTH_EMAIL_FROM` sandbox default.** The `onboarding@resend.dev` value in
  `.env.example` is correct for local dev; production refuses to boot with it
  ([`env.ts:14-21`](lib/auth/env.ts)).
- **Automatic refunds.** Out of scope — the published refund policy is
  request-and-review, so a person refunds from the Stripe dashboard.
- **Exported prop types** on shared UI primitives (`PressableProps`, `TabItem`,
  `AuthProvider`) stay exported — that's the convention.
- **`tsconfig.tsbuildinfo`** — local build cache, gitignored, never deployed.
- **`preload="metadata"` on the hero video** defers nothing; browsers ignore
  `preload` when `autoPlay` is set. The size win came from the re-encode.
- **API test fixtures** were deleted by decision. If mapper tests get written,
  restore with `git checkout 2ede650 -- lib/api/__fixtures__/` rather than
  re-running `npm run probe`.

## Verified clean

- [`next.config.ts`](next.config.ts) — no build-error suppression; image host is
  one exact domain.
- Auth — real per-request authorization, session revocation, sliding expiry,
  correct middleware scoping.
- [`revalidate/route.ts`](app/api/revalidate/route.ts) — constant-time
  comparison, fails closed.
- Accessibility — no raw `<img>`, every image has alt text, no
  `dangerouslySetInnerHTML`.
- Dependencies — all wired, nothing to remove.
- Secrets — no env file is tracked by git.
- Hygiene — no `any`, no `@ts-ignore`, no `eslint-disable`, no TODO comments, no
  commented-out code.
