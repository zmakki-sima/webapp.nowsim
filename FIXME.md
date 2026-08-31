# FIXME — what's left

---

## To go live

In order. 1–4 are waiting on other people, so start them today.

1. **Ask Yesim if the API takes the token in a header.** Yes: a two-line change.
   No: rotate the token before launch. The token currently travels in the URL, so
   it lands in logs we don't control. [`yesim.ts:40`](lib/api/yesim.ts) 🔴
2. **Start Stripe account activation.** Legal entity, bank account, tax details,
   ID verification. Their review takes calendar time. [`PAYMENT.md`](PAYMENT.md)
   §10 🟡
3. **Get the legal pages finished.** Terms end with "This page is still being
   published" and have no Effective Date; two links inside them
   (`nowsim.com/cof/`, `nowsim.com/acceptable-use-policy/`) go nowhere. Stripe
   requires real legal pages to activate.
   [`terms-of-service/page.tsx:52,67,755`](app/(site)/terms-of-service/page.tsx) 🟡
4. **Get real numbers from marketing, or remove them.** Three different unsourced
   review scores: 4.8 ([`TrustBar.tsx:20`](components/common/TrustBar.tsx)), 4.9
   ([`About.tsx:64`](components/sections/main/About.tsx)), 4.7 with 97,400+
   reviews ([`PlanPicker.tsx:261`](components/sections/destinations/PlanPicker.tsx)).
   Plus "1,657,382,391 Gigabytes delivered"
   ([`About.tsx:74`](components/sections/main/About.tsx)) 🟡
5. **Decide currency settlement.** The Stripe account is CHF, prices are EUR.
   Stripe converts at their rate and takes a fee, so payouts won't match the
   sticker price. [`PAYMENT.md`](PAYMENT.md) §13.1
6. **Confirm the Stripe account is the right one.** Connect is enabled and the
   account is named "Swan sandbox" — Connect means money routes to *other*
   accounts. [`PAYMENT.md`](PAYMENT.md) §13.2
7. **Run the sandbox test matrix** — 14 scenarios, none run yet. This is also the
   only thing that proves the paid-but-undelivered alert actually fires.
   [`PAYMENT.md`](PAYMENT.md) §9
8. **Fix or hide the delete-account button.** Live, red, no handler — a user who
   clicks it will think their account was deleted.
   [`AccountAction.tsx:259`](components/layout/AccountAction.tsx) *(waiting on
   the deletion API)*
9. **Add security headers** before taking real card traffic. No CSP, HSTS,
   `X-Content-Type-Options`, `Referrer-Policy` or `Permissions-Policy`; no
   `headers()` block and no `serverActions.allowedOrigins`.
   [`next.config.ts`](next.config.ts)
10. **Stop sending the customer's email as a URL parameter** to `new_user`. Same
    logging problem as the Yesim token. [`user.ts:8`](lib/auth/user.ts)
11. **Fix the FAQ's compatibility-check promise** — "We check compatibility at
    checkout, so you'll know before you pay." No such check exists.
    [`Faq.tsx:23`](components/common/Faq.tsx)
12. **Confirm the dev-only logging guards hold.** A live OTP and email
    ([`mailer.ts:140`](lib/auth/mailer.ts)) and an ICCID and email
    ([`esim.ts:885,910`](lib/mail/esim.ts)) print behind a production guard.
13. **Set `NOWSIM_STAGE=live` in production, redeploy, then open `/robots.txt`.**
    It must say `Allow: /`. If it says `Disallow: /`, the site is invisible to
    Google. Prerendered at build time, so a variable change alone won't do it.
14. **Buy one eSIM yourself with a real card**, confirm it arrives, then refund
    it. Never let a customer be the first live test.

---

## Not blocking launch

- **Country hero images cover only ~64%** (95 of ~148). The set runs a→`morocco`
  then jumps to `united-states`; everything between falls back to a generic
  image. [`heroes.ts:57`](lib/heroes.ts)
- **All 9 error boundaries throw the error away**, so every client-side crash
  vanishes with no way to report it. [`app/error.tsx`](app/error.tsx),
  [`app/global-error.tsx`](app/global-error.tsx), plus 7 per-section ones.
  [`app/error.tsx`](app/error.tsx) is also nearly unreachable and duplicates
  [`app/(site)/error.tsx`](app/(site)/error.tsx) word for word.
- **`/purchases` is missing from `PROTECTED`** ([`proxy.ts:12`](proxy.ts)). Not a
  security hole — the data layer returns nothing without a session — but
  signed-out users see an empty page instead of a redirect.
- **Duplication.** Three near-identical search dialogs sharing layout, filter
  logic and scroll container —
  [`CoverageDialog.tsx`](components/sections/destinations/CoverageDialog.tsx),
  [`NetworkDialog.tsx`](components/sections/destinations/NetworkDialog.tsx),
  [`DeviceDialog.tsx`](components/sections/destinations/DeviceDialog.tsx);
  device filtering duplicated between `DeviceDialog` and
  `DeviceExplorer`; destination search built twice (`DestinationSearch`,
  `NextTripFinder`); card style tokens copy-pasted between `EsimCard` and
  `PurchaseCard`; `function Empty()` duplicated in `EsimList` and `PurchaseList`;
  auth form constants copy-pasted between `EmailSignIn` and `ConfirmIdentity`.
- **Docs / tooling.** [`README.md`](README.md) is still Next.js boilerplate;
  `YESIM_API_BASE` undocumented in [`.env.example`](.env.example);
  [`scripts/hero-names.mjs`](scripts/hero-names.mjs) is orphaned;
  `next-env.d.ts` was hand-edited; no tests, no CI, no `.github/`, no Dockerfile,
  no `vercel.json`. Decide whether [`PLAN.md`](PLAN.md) ships — it records 4
  unresolved high-severity `npm audit` findings in `sharp`/libvips needing Next
  16.3.0, and the project is pinned to 16.2.12.
