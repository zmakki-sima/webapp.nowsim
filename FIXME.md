# FIXME — pre-production cleanup

Audit of the repo ahead of launch, grouped A–I. Each item carries a file
reference and a status. Statuses are:

- `open` — not triaged yet
- `pending` — deliberately deferred, with the reason recorded
- `done` — fixed

The codebase is clean on the usual hygiene axes: no `any`, no `@ts-ignore`, no
`eslint-disable`, no TODO/FIXME comments in source, no commented-out code, no
empty catch blocks, no unused dependencies, no secrets in tracked files. What
follows is leftovers and unfinished features, not code rot.

---

## A. Blockers

Ship-stoppers. Not cleanup.

### A1. Checkout takes no money but advertises Stripe — `pending` 🔴

> Working on the payment feature separately.

[`components/sections/checkout/PaymentStep.tsx:58-68`](components/sections/checkout/PaymentStep.tsx) — the
`Pay {total}` button has no `onClick`, no `form`, and no `type="submit"`.
[`components/ui/Pressable.tsx:45`](components/ui/Pressable.tsx) defaults `type`
to `"button"`, so the primary checkout CTA is inert.

Compounding it, the surrounding copy makes a security claim the app cannot
honour. [`PaymentStep.tsx:36`](components/sections/checkout/PaymentStep.tsx)
states _"Card details are entered on Stripe's secure page"_ and renders
`FaStripe`, `FaCcVisa`, `FaCcMastercard`, `FaCcAmex`, `FaCcApplePay`. There is
no `stripe` dependency in `package.json`, no webhook route, and no `new_esim`
purchase call anywhere. Same claim repeats at
[`components/sections/destinations/PlanPicker.tsx:266`](components/sections/destinations/PlanPicker.tsx)
("Secure payment guaranteed").

Either finish the integration or gate `/checkout` behind a coming-soon state.
Shipping an inert button under a Stripe badge is a misrepresentation, not just
dead code.

### A2. "Delete account" button does nothing — `pending` 🔴

> Waiting on the account-deletion API.

[`components/layout/AccountAction.tsx:247-254`](components/layout/AccountAction.tsx) —
renders a live, danger-styled button with no handler. GDPR-adjacent: a user who
clicks it will reasonably believe their account was deleted.

Until the API exists, prefer disabling the button over leaving it live.

### A3. Terms of Service is truncated and publicly routed — `pending` 🔴

> Fresh document coming from the legal sector.

[`app/(site)/terms-of-service/page.tsx:755`](<app/(site)/terms-of-service/page.tsx>) —
final block reads _"This page is still being published. Clauses from 6.4.3
onward, together with the remaining sections and the Effective Date, will be
added shortly."_ No Effective Date anywhere on the page.

### A4. Two 404 links inside Terms — `pending` 🔴

> Will be resolved with the legal-sector rewrite.

- [`app/(site)/terms-of-service/page.tsx:52`](<app/(site)/terms-of-service/page.tsx>) → `https://nowsim.com/cof/`
- [`app/(site)/terms-of-service/page.tsx:67`](<app/(site)/terms-of-service/page.tsx>) → `https://nowsim.com/acceptable-use-policy/`

Neither has a page under `app/`.

### A5. `AUTH_EMAIL_FROM` fails open to Resend's sandbox sender — `done` 🟢

**The configured value is correct.** `.env.local` sets
`AUTH_EMAIL_FROM="nowsim <hello@mail.nowsim.com>"`. The defect is the _shape of
the fallback_, at [`lib/auth/env.ts:16`](lib/auth/env.ts):

```ts
AUTH_EMAIL_FROM: z.string().min(1).default("nowsim <onboarding@resend.dev>"),
```

`.env.local` is gitignored and is not deployed — the value must be re-entered in
the host's environment settings. If it is missing or misspelled there,
`authEnv()` validates successfully, the app boots normally, and the sender is
silently swapped for Resend's shared sandbox address.

Every neighbouring auth variable fails closed. This one does not:

| Variable          | Missing in prod                                         | Result     |
| ----------------- | ------------------------------------------------------- | ---------- |
| `SESSION_SECRET`  | throws at[`lib/auth/env.ts:37`](lib/auth/env.ts)        | Loud       |
| `RESEND_API_KEY`  | throws at[`lib/auth/mailer.ts:135`](lib/auth/mailer.ts) | Loud       |
| `AUTH_EMAIL_FROM` | boots fine                                              | **Silent** |

Why the fallback address in particular is dangerous: Resend restricts
`onboarding@resend.dev` to delivering **only to the address that owns the Resend
account**. With the default active:

- Signing in during a smoke test works — the tester _is_ the account owner.
- Every real customer is rejected by Resend →
  [`lib/mail/send.ts:51`](lib/mail/send.ts) throws `"Resend refused the message"` → caught at [`app/actions/auth.ts:84`](app/actions/auth.ts) → the
  user sees a generic sign-in failure.

The result is a total sign-in outage that passes manual verification, because
the only account it works for is the one doing the verifying. Deliverability is
a secondary concern: mail from `resend.dev` would be filtered far harder than
`mail.nowsim.com`, which already has known filtering issues at some domains.

**Fix** — make it fail like its neighbours:

```ts
AUTH_EMAIL_FROM: z
  .string()
  .min(1, "AUTH_EMAIL_FROM is required, e.g. `nowsim <hello@mail.nowsim.com>`")
  .refine(
    (value) => !value.includes("resend.dev"),
    "AUTH_EMAIL_FROM must use a verified nowsim domain, not the Resend sandbox",
  ),
```

Then confirm the variable is set in the production environment.

### A6. Yesim API token travels in the URL query string — `open` 🟡

**Not a live exploit, and nothing leaks to the browser.**
[`lib/api/yesim.ts:1`](lib/api/yesim.ts) is `import "server-only"`, so the token
never reaches client code. In-process redaction is sound — all three throw paths
were traced:

- `fetch` rejection → caught, `redactToken(String(cause))`
- `!response.ok` → throws with `path`, not the URL
- JSON parse failure → caught, redacted

The exposure is entirely outside the process, at
[`lib/api/yesim.ts:35`](lib/api/yesim.ts) (`url.searchParams.set("token", …)`):

1. **Yesim's access logs.** Every request writes the token in plaintext to their
   web server logs, permanently. Not auditable, not revocable from our side.
   Inherent to their API design.
2. **Any TLS-terminating hop** — host egress proxy, WAF, corporate middlebox.
   Request bodies and headers are normally not logged; URLs almost always are.
   That asymmetry is the whole argument for header auth.
3. **Tracing / APM.** Next.js ships OpenTelemetry instrumentation that records
   `http.url` on outgoing fetch spans. Dormant today — there is no
   `instrumentation.ts` — but adding Sentry, Datadog, or Vercel observability
   starts flowing the tokenised URL to a third party. Decide before enabling it,
   not after.

Severity: **moderate**. Log accumulation across systems we do not control, not a
remotely reachable vulnerability.

Actions:

- **Ask Yesim this question** — blocks the rest of this item:

  > Does your API accept the API token in a request **header** — either
  > `Authorization: Bearer <token>` or `X-API-Key: <token>` — instead of as the
  > `?token=` query parameter? We want to keep the token out of URL access logs.
  > If a header is supported, please confirm which one and whether the
  > `?token=` parameter can then be omitted entirely.

  Many providers with a `?token=` API support a header and simply do not
  document it. If they do, it is a two-line change in `urlFor`/`request`.

- If they do not, rotate the token before launch — it has been through dev logs
  and shell history — and do not enable URL-capturing tracing without a
  scrubber.

**Related one-liner — `done` 🟢.** [`lib/api/yesim.ts:33-43`](lib/api/yesim.ts)
used to set the token and _then_ apply caller params, so a caller passing
`params: { token: … }` would have silently replaced the credentials. No caller
did this, but the order is now flipped — caller params first, token written
last, so the credentials always win. See **F6**.

### A7. Contradictory review scores in a single session — `pending` 🔴

> Marketing/legal copy will be supplied.

Three different ratings are reachable without leaving the site, all unsourced:

- [`components/common/TrustBar.tsx:20`](components/common/TrustBar.tsx) — "Trustpilot score 4.8 out of 5!"
- [`components/sections/main/About.tsx:64-67`](components/sections/main/About.tsx) — 4.9 "Out of 5.0 on the App Store & Google Play"
- [`components/sections/destinations/PlanPicker.tsx:261`](components/sections/destinations/PlanPicker.tsx) — "4.7 (97,400+ reviews)"

Plus [`About.tsx:74`](components/sections/main/About.tsx) — `1,657,382,391`
"Gigabytes delivered on nowsim".

### A8. FAQ claims a compatibility check that does not exist — `pending` 🔴

> Copy will be supplied.

[`components/common/Faq.tsx:23`](components/common/Faq.tsx) — _"We check
compatibility at checkout, so you'll know before you pay."_ No such check
exists; `DeviceDialog` lives on the destination page instead.

---

## B. Dead code

Zero-risk deletions.

- [x] **B1.** ~~`components/sections/main/Benefits.tsx` — 122 lines, never imported. Its copy describes a **virtual-number product** ("Local number", "Unlimited calling, SMS, and text included"), not the data eSIM this app sells.~~ Deleted in `5170b78`. 🟢
- [x] **B2.** ~~`components/sections/main/EveryMoment.tsx` — 58 lines, never imported.~~ Deleted in `5170b78`. 🟢
- [x] **B3.** ~~Four dead functions, each confirmed to occur exactly once in `app/`, `components/`, `lib/`: `isHelpTopic`, `getHelpArticles` ([`lib/help.ts`](lib/help.ts)); `isInstallPlatform`, `getInstallGuides` ([`lib/install.ts`](lib/install.ts)).~~ All four deleted. 🟢

  Verified before deleting: a repo-wide `git grep` over every tracked file —
  not just `app/`/`components/`/`lib/` — returned only their own definition
  lines. No orphaned types were left behind; `typecheck` and `lint` both pass.

  ⚠️ `getInstallGuide` (singular, [`lib/install.ts:188`](lib/install.ts)) was
  **kept** — it is live, consumed by
  [`app/(site)/help/[guide]/page.tsx`](<app/(site)/help/[guide]/page.tsx>) and
  `readInstallShots`.

- [x] **B4.** ~~~25 symbols exported but referenced only within their own file — the `export` keyword is the dead part, not the symbol.~~ Cleaned. 🟢 (`proxy.ts` `config` left alone — required Next.js convention.)

  **`lib/api/` done.** `export` dropped from `currencySchema`, `csv`,
  `planSchema`, `deviceTypeSchema`, `esimSchema`, `orderSchema`
  ([`lib/api/schemas.ts`](lib/api/schemas.ts)) and `regionName`, `countryName`,
  `kindOf` ([`lib/api/mappers.ts`](lib/api/mappers.ts)). Each is still used
  inside its own file — only the keyword went. `ApiUser` was the one genuinely
  unused symbol and was deleted outright.

  **`lib/auth/` and `Breadcrumb` done.** `export` dropped from `Crumb`
  ([`components/ui/Breadcrumb.tsx:6`](components/ui/Breadcrumb.tsx)), `AuthEnv`
  ([`lib/auth/env.ts:38`](lib/auth/env.ts)), `RequestResult` and `VerifyResult`
  ([`lib/auth/otp.ts`](lib/auth/otp.ts)), `Decoded`
  ([`lib/auth/token.ts:50`](lib/auth/token.ts)). Types are erased at compile
  time, so this is a zero-runtime change — `typecheck`, `lint`, and a full
  `build` all pass unchanged. `lib/data/` had no local-only exported types.

  **Closed, not outstanding:** `PressableProps`
  ([`components/ui/Pressable.tsx:33`](components/ui/Pressable.tsx)), `TabItem`
  ([`components/ui/Tabs.tsx:20`](components/ui/Tabs.tsx)), and `AuthProvider`
  ([`lib/auth/providers.ts:6`](lib/auth/providers.ts)) stay exported by
  decision. These are the prop types of shared UI primitives; exporting them is
  the convention, so the next component that wraps a `Pressable` or `Tabs` can
  extend them. The original audit swept them in with genuinely dead code — they
  do not belong in that bucket. **Do not re-flag.**

---

## C. Repo weight

`public/` was **205 MB**, now **159 MB** (C1 + C2 done).

| Item                              | Size          | Note                           |
| --------------------------------- | ------------- | ------------------------------ |
| ~~`public/videos/hero.mp4`~~      | ~~34.1 MB~~   | Deleted. 🟢                    |
| `public/videos/hero.webm`         | 2.2 MB        | Re-encoded from 13.9 MB. 🟢    |
| `public/images/countries/`        | ~148 MB total | 95 JPGs, many 1.8–2.4 MB each. |
| ~~`lib/api/__fixtures__/`~~       | ~~911 KB~~    | Deleted. 🟢                    |
| ~~`preview/`~~                    | ~~76 KB~~     | Deleted. 🟢                    |

- [x] **C1.** ~~Delete `public/videos/hero.mp4`.~~ Deleted. 🟢 [`Hero.tsx`](components/sections/main/Hero.tsx) referenced only `hero.webm`, with no `<source>` fallback. 34 MB reclaimed.
- [x] **C2.** ~~Re-encode `hero.webm`. 13.9 MB is a large above-the-fold download.~~ Done. 🟢 **13.9 MB → 2.2 MB (−84%).**

  Two-pass VP9, 800k target: `1440×800 @30fps` → `1280×712 @24fps`, audio stripped
  (the element is `muted`). Duration unchanged at 22.5 s. The clip is a 4×4 video
  mosaic sitting behind a 70 % `bg-ink/70` overlay
  ([`Hero.tsx:28`](components/sections/main/Hero.tsx)), so the quality budget is
  generous — residual softness in a few tiles is not visible through the scrim.

  Also added [`public/videos/hero-poster.webp`](public/videos/hero-poster.webp)
  (46 KB, 960 px) as the `poster`, so the hero paints immediately instead of
  showing a black box while the video buffers.

  ⚠️ `preload` was changed `"auto"` → `"metadata"`, but **this is not what saved
  the bytes.** Browsers ignore `preload` entirely when `autoPlay` is set — the
  video downloads regardless. The size win is the re-encode; the perceived win is
  the poster. Do not expect `preload` to defer anything here.

- [ ] **C3.** Compress `public/images/countries/`. These are unoptimized source photographs; `next/image` handles delivery, but they still inflate the repo and the deploy bundle. Largest: `barbados.jpg` 2.4 MB, `italy.jpg` 2.2 MB, `czech-republic.jpg` 2.1 MB. **In progress** — being handled separately.
- [x] **C4.** ~~Remove `lib/api/__fixtures__/plans.json` (905 KB) and `plans.sample.json` (6 KB).~~ Both removed via `git rm`. 🟢

  ⚠️ **This deletes the intended test input.** [`PLAN.md:186-189`](PLAN.md) (not
  `:112` — the original reference was wrong) specifies Vitest coverage for the
  mappers running against `plans.json`: 1520 real plans, no network, and four
  specific traps that only this capture exposes — `data: "Unlimited"`,
  `old_id: null`, the `UNLIM_UAE_7D` / `St. Kitts` grouping, and the
  `japan` / `japan-region` collision. Removed by explicit decision anyway.

  **Recovery when those tests are written:** `git checkout 2ede650 -- lib/api/__fixtures__/`
  restores the exact capture with its four traps intact. `npm run probe` also
  rewrites `plans.json` — [`scripts/probe-yesim.mjs:40`](scripts/probe-yesim.mjs)
  does `mkdir(…, { recursive: true })`, so the deleted directory is recreated —
  but a fresh probe reflects Yesim's catalogue *today* and is not guaranteed to
  still contain those edge cases. Prefer the `git checkout` path.

- [x] **C5.** ~~Remove `preview/` — `esim-email.html`, `esim-email.rendered.html`, `esim-email.rendered.txt`, `otp-email.html`.~~ Removed via `git rm`. 🟢

  Design-time snapshots from `28a6727` and `2dfcb64`, referenced by no code. The
  live templates are generated in [`lib/mail/esim.ts`](lib/mail/esim.ts), so these
  copies could only drift out of step with the real emails, and no npm script
  regenerated them. Deleting removes a stale source of truth, not just 76 KB.

- [x] **C6.** ~~Delete `tsconfig.tsbuildinfo` (153 KB) from the working tree.~~ **Closed — not doing.** 🟢

  Not a repo-weight item. It is `tsc --noEmit`'s incremental cache, already
  covered by [`.gitignore:43`](.gitignore) (`*.tsbuildinfo`), never tracked, never
  deployed, and regenerated by the next `typecheck`. Deleting it frees space on
  one developer's machine and slows the next run. **Do not re-flag.**

---

## D. Content gaps

- [ ] **D1.** Country hero coverage is ~64%. 95 images for ~148 catalog countries. The set runs alphabetically a→`morocco`, then jumps to `united-states.jpg` — every destination from "mo…" to "tu…" falls back to `/images/fallback.jpg` via [`lib/heroes.ts:57`](lib/heroes.ts).
- [ ] **D2.** Android QR guide is missing step-1 screenshots. `public/images/help/install-android/qr/` starts at `step2-1.webp`, so step 1 renders `<Placeholder>` ([`components/sections/install/InstallSteps.tsx:26`](components/sections/install/InstallSteps.tsx)). The other three guide directories are complete — iOS manual, iOS QR, and Android manual all resolve.
- [ ] **D3.** Store buttons at [`components/layout/Footer.tsx:56-57`](components/layout/Footer.tsx) link to App Store and Google Play listings for an app that appears nowhere else in the repo. Verify the listings are live before launch.

---

## E. SEO / metadata

- [ ] **E1.** No `app/robots.ts` and no `app/sitemap.ts` — yet [`proxy.ts:38`](proxy.ts) already excludes `sitemap.xml` and `robots.txt` from its matcher. The config anticipates files that do not exist.
- [ ] **E2.** No `metadataBase` in [`app/layout.tsx:38`](app/layout.tsx). Relative OG and canonical URLs will resolve against `localhost` in production builds.
- [ ] **E3.** No `openGraph` or `twitter` metadata anywhere, and no `opengraph-image`. Every shared link renders bare.
- [ ] **E4.** Stray empty JSX expression `{}` at [`app/layout.tsx:55`](app/layout.tsx).

Positive: root metadata is real, 15 routes export `metadata`/`generateMetadata`,
`app/icon.svg` is present, and there is no `"Create Next App"` string anywhere.

---

## F. Correctness / consistency

- [ ] **F1.** All 9 error boundaries discard the error. [`app/error.tsx:12`](app/error.tsx), [`app/global-error.tsx:6`](app/global-error.tsx), and the 7 per-segment boundaries each declare `error: Error & { digest?: string }` in props and then never destructure or use it. Every client-side crash is swallowed with no report path.
- [ ] **F2.** [`app/error.tsx`](app/error.tsx) is close to unreachable — `(site)`, `(account)`, and `checkout` each carry their own boundary — and [`app/error.tsx:20-22`](app/error.tsx) duplicates [`app/(site)/error.tsx:19-21`](<app/(site)/error.tsx>) verbatim.
- [ ] **F3.** Google sign-in is advertised but not implemented. [`lib/auth/providers.ts:18`](lib/auth/providers.ts) lists `google` in `providerNames`, while `authProviders` ships email only. Remove the entry until the provider exists.
- [ ] **F4.** `/purchases` is absent from `PROTECTED` in [`proxy.ts:12`](proxy.ts) (only `/esims` is listed). Not a vulnerability — [`lib/data/purchases.ts`](lib/data/purchases.ts) returns `null` without a session — but unauthenticated users get a rendered empty page instead of a redirect, inconsistent with `/esims`.
- [ ] **F5.** `NEXT_PUBLIC_SITE_URL` is validated by nothing. Present in `.env.example`, absent from `.env.local`, missing from both [`lib/env.ts`](lib/env.ts) and [`lib/auth/env.ts`](lib/auth/env.ts). Its only consumer falls back silently: [`lib/mail/esim.ts:11`](lib/mail/esim.ts) — `process.env.NEXT_PUBLIC_SITE_URL ?? "https://nowsim.com"`. A wrong value ships bad links in customer eSIM emails with no error. Same failure shape as A5.
- [x] **F6.** ~~Caller `params` can override the API token~~ — fixed. `urlFor` now applies caller params first and writes `token` last, so credentials always win. See **A6**.
- [ ] **F7.** Dev-only console output prints PII. [`lib/auth/mailer.ts:140`](lib/auth/mailer.ts) prints a live OTP and the user's email; [`lib/mail/esim.ts:721`](lib/mail/esim.ts) prints an ICCID and email. Both sit behind a production throw ([`mailer.ts:135`](lib/auth/mailer.ts), [`esim.ts:715`](lib/mail/esim.ts)) so they cannot fire in production — verify those guards hold before launch.

---

## G. Duplication

Refactor candidates. None are bugs.

- [ ] **G1.** Three near-identical search dialogs — same `Dialog` + `SearchField tone="dark"` + `useMemo` filter + identical 4-class scroll container: [`CoverageDialog.tsx:51-56`](components/sections/destinations/CoverageDialog.tsx), [`NetworkDialog.tsx:51-56`](components/sections/destinations/NetworkDialog.tsx), [`DeviceDialog.tsx:54-58`](components/sections/destinations/DeviceDialog.tsx). Coverage and Network are the tightest pair — both call `filterCountries`, and `NetworkDialog.tsx:20-23` exists only to map `string[]` into `{ name }[]` so it can reuse the country filter.
- [ ] **G2.** Device list logic is byte-identical at [`DeviceDialog.tsx:26-31`](components/sections/destinations/DeviceDialog.tsx) and [`DeviceExplorer.tsx:14-19`](components/sections/devices/DeviceExplorer.tsx) (`deviceQuery` → `filterDeviceGroups`). Empty-state copy is the same sentence in two voices.
- [ ] **G3.** Destination search is built twice: [`DestinationSearch.tsx:33-38`](components/sections/main/DestinationSearch.tsx) and [`NextTripFinder.tsx:25-35`](components/sections/main/NextTripFinder.tsx) both construct `createSearchIndex(destinations)` and submit to `/destinations?q=…`. `DestinationSearch.tsx:109-138` also hand-rolls an `<input>` instead of using [`components/ui/SearchField.tsx`](components/ui/SearchField.tsx), which every other search surface adopted in `73affea`.
- [ ] **G4.** Card style tokens copy-pasted between [`EsimCard.tsx`](components/sections/esims/EsimCard.tsx) and [`PurchaseCard.tsx`](components/sections/purchases/PurchaseCard.tsx): `pill`, `spec`, `factLabel`, `factValue`, and `function Fact` (identical except `PurchaseCard` adds `break-all`).
- [ ] **G5.** `function Empty()` duplicated at [`EsimList.tsx:8-28`](components/sections/esims/EsimList.tsx) and [`PurchaseList.tsx:8-28`](components/sections/purchases/PurchaseList.tsx) — identical markup and classes, differing only in icon and two strings. The surrounding `<h1>` + conditional `<ul>` wrapper is duplicated too.
- [ ] **G6.** Auth form constants copy-pasted: `const field` is character-identical at [`EmailSignIn.tsx:60`](components/auth/EmailSignIn.tsx) and [`ConfirmIdentity.tsx:12`](components/sections/esims/ConfirmIdentity.tsx); `const button` is a near-copy. The OTP input block is re-implemented at [`ConfirmIdentity.tsx:77-92`](components/sections/esims/ConfirmIdentity.tsx). `ConfirmIdentity` already imports `darkTone` from `EmailSignIn` — these should follow.

---

## H. Docs / tooling

- [ ] **H1.** [`README.md`](README.md) is untouched `create-next-app` boilerplate. It references `app/page.tsx` (the real entry is `app/(site)/page.tsx`), claims the project uses the **Geist** font (it uses self-hosted Satoshi and Figtree via `next/font/local`), and carries a Vercel link tagged `utm_campaign=create-next-app-readme`.
- [ ] **H2.** [`.env.example`](.env.example) has drifted. It documents `NEXT_PUBLIC_SITE_URL` but **omits `REVALIDATE_SECRET` and `YESIM_API_BASE`**, both read by [`lib/env.ts`](lib/env.ts). Without `REVALIDATE_SECRET`, [`app/api/revalidate/route.ts`](app/api/revalidate/route.ts) returns 503 permanently.
- [ ] **H3.** [`scripts/hero-names.mjs`](scripts/hero-names.mjs) is orphaned — no npm script wires it (only `probe` exists), and it writes to a `docs/hero-names/` directory that does not exist.
- [ ] **H4.** `next-env.d.ts` was hand-edited to add `import "./.next/types/routes.d.ts";` despite the "should not be edited" notice. It is gitignored, so the edit is lost on regeneration. Confirm whether this is load-bearing; if so it belongs in `tsconfig.json`.
- [ ] **H5.** No tests, no CI, no `.github/`, no Dockerfile, no `vercel.json`. `lint` and `typecheck` scripts exist but nothing enforces them.
- [ ] **H6.** Decide whether [`PLAN.md`](PLAN.md) (11.7 KB internal pre-launch TODO) ships in the repo. It also records 4 unresolved high-severity `npm audit` findings in `sharp`/libvips whose fix requires Next 16.3.0 — the project is pinned to 16.2.12.

---

## I. Security hardening

Not present yet. None are regressions.

- [ ] **I1.** No CSP, no HSTS, no `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy` — there is no `headers()` block in [`next.config.ts`](next.config.ts).
- [ ] **I2.** No `serverActions.allowedOrigins`.
- [ ] **I3.** No per-IP OTP verify limit. Currently ~25 guesses/hour per address (`PLAN.md:124`).
- [ ] **I4.** PII in a POST query string — [`lib/auth/user.ts:7-9`](lib/auth/user.ts) sends `email` as a URL parameter to `new_user`. Same log-exposure argument as A6.

---

## Verified clean — no action

- [`next.config.ts`](next.config.ts) — no `typescript.ignoreBuildErrors`, no `eslint.ignoreDuringBuilds`, no `images.unoptimized`, and `remotePatterns` is a single exact host (`cdn.yesim.app`), not a wildcard.
- Auth design — real authorization per data function via `verifySession()` in [`lib/auth/dal.ts:9`](lib/auth/dal.ts); [`proxy.ts:18`](proxy.ts) is correctly scoped to an optimistic cookie-presence redirect only. Session revocation, sliding expiry, and `sid` tracking all present.
- [`app/api/revalidate/route.ts`](app/api/revalidate/route.ts) — SHA-256 then `timingSafeEqual`, fails closed with 503 when unconfigured.
- Accessibility — no raw `<img>` in any React component (the 3 hits are HTML email templates, where `next/image` does not apply); every `<Image>` has an `alt`; no `dangerouslySetInnerHTML`.
- Dependencies — all 9 runtime deps and all devDependencies are wired. Nothing to remove.
- Secrets — `.gitignore:31` covers `.env*`; `git ls-files` confirms no env file is tracked.
