# FIXME — what's left

## To go live
1. **Ask Yesim: can the API take the token in a header?** 🔴
   Right now the token is put in the web address, so it gets written into logs
   we don't own. [`yesim.ts:40`](lib/api/yesim.ts)
   - Yes → two-line change.
   - No → rotate the token before launch.

2. **Start Stripe account activation.** 🟡
   Needs company details, bank account, tax info, ID check. Stripe's review
   takes real calendar days. [`PAYMENT.md`](PAYMENT.md) §10

3. **Finish the legal pages.** 🟡
   Stripe won't activate without them.
   [`terms-of-service/page.tsx`](app/\(site\)/terms-of-service/page.tsx)
   - Line 755 still says "This page is still being published".
   - No Effective Date at the end.
   - Two dead links: `nowsim.com/cof/` (line 52) and
     `nowsim.com/acceptable-use-policy/` (line 67).

4. **Get real review numbers from marketing, or delete them.** 🟡
   Four made-up figures, three of them contradicting each other:
   - 4.8 — [`TrustBar.tsx:20`](components/common/TrustBar.tsx)
   - 4.9 — [`About.tsx:71`](components/sections/main/About.tsx)
   - 4.7 (97,400+ reviews) — [`PlanPicker.tsx:262`](components/sections/destinations/PlanPicker.tsx)
   - "1,657,382,391 Gigabytes delivered" — [`About.tsx:87`](components/sections/main/About.tsx)


### Money decisions
5. **Pick a settlement currency.** The Stripe account is CHF, the prices are
   EUR. Stripe converts at its own rate and charges a fee, so what lands in the
   bank won't match the price on the page. [`PAYMENT.md`](PAYMENT.md) §13

6. **Check we're using the right Stripe account.** Connect is switched on and
   the account is called "Swan sandbox". Connect means money gets routed to
   *other* accounts. [`PAYMENT.md`](PAYMENT.md) §13

7. **Run the sandbox test matrix.** 14 scenarios, none run yet. It's also the
   only proof that the "paid but not delivered" alert email actually fires.
   [`PAYMENT.md`](PAYMENT.md) §9


### Code fixes
8. **Fix or hide the "Delete account" button.** Still live, still red, still has
   no click handler. Anyone who presses it will think their account is gone.
   [`AccountAction.tsx:257`](components/layout/AccountAction.tsx)
   *(blocked on the deletion API)*

9. **Add security headers before taking real cards.** [`next.config.ts`](next.config.ts)
   has no `headers()` block at all — so no CSP, HSTS, `X-Content-Type-Options`,
   `Referrer-Policy` or `Permissions-Policy` — and no
   `serverActions.allowedOrigins`.

10. **Stop putting the customer's email in the web address** when calling
    `new_user`. Same logging leak as the Yesim token.
    [`user.ts:8`](lib/auth/user.ts)

11. **Fix the FAQ's false promise.** It says "We check compatibility at
    checkout, so you'll know before you pay." There is no such check.
    [`Faq.tsx:23`](components/common/Faq.tsx)


### Last steps on launch day
12. **Set `NOWSIM_STAGE=live`, redeploy, then open `/robots.txt`.**
    It must read `Allow: /`. If it reads `Disallow: /`, Google can't see the
    site. The file is built at deploy time, so changing the variable alone does
    nothing. [`robots.ts`](app/robots.ts)

13. **Buy one eSIM yourself with a real card**, check it arrives, then refund
    it. A customer should never be the first live test.

---

## Not blocking launch
- **Country photos cover about 2 in 3 destinations.** 95 photos on disk for
  ~148 countries; the rest show a generic placeholder. Adding a file is all it
  takes — [`heroes.ts`](lib/heroes.ts) now scans the folder, so there's no list
  to update.

- **Repeated code.** Nothing broken, just more places to change later:
  - Three near-identical search dialogs —
    [`CoverageDialog`](components/sections/destinations/CoverageDialog.tsx),
    [`NetworkDialog`](components/sections/destinations/NetworkDialog.tsx),
    [`DeviceDialog`](components/sections/destinations/DeviceDialog.tsx).
    They share `Dialog` and `SearchField`, but the layout and scroll container
    are copied three times.
  - Destination search built twice:
    [`DestinationSearch`](components/sections/main/DestinationSearch.tsx) and
    [`NextTripFinder`](components/sections/main/NextTripFinder.tsx). The
    matching logic is shared; the UI is not.
  - Card style tokens copy-pasted between
    [`EsimCard`](components/sections/esims/EsimCard.tsx) and
    [`PurchaseCard`](components/sections/purchases/PurchaseCard.tsx).
  - `function Empty()` written twice, in
    [`EsimList`](components/sections/esims/EsimList.tsx) and
    [`PurchaseList`](components/sections/purchases/PurchaseList.tsx).
  - `field` and `button` constants copied from
    [`EmailSignIn`](components/auth/EmailSignIn.tsx) into
    [`ConfirmIdentity`](components/sections/esims/ConfirmIdentity.tsx), which
    already imports `lightTone` from it.

- **Docs and tooling.**
  - [`README.md`](README.md) is still the Next.js starter text.
  - No tests, no CI, no `.github/`, no Dockerfile, no `vercel.json`.
