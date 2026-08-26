# nowsim. What's left to go live

Everything in this file is outstanding. Done work is not listed.

The site builds clean today: 176 pages prerender, typecheck and lint pass, the catalog
is live from Yesim, and email OTP sign-in works end to end. **It cannot take money.**

---

## Reference

**Base:** `https://partners-api.yesim.biz/<endpoint>?token=<YESIM_API_TOKEN>`

| Endpoint                     | Use                                             |
| ---------------------------- | ----------------------------------------------- |
| `GET /user`                  | Account page                                    |
| `GET /new_esim`              | Issue the eSIM.**Only from the Stripe webhook** |
| `GET /orders`                | Order history                                   |
| `GET /sim_info`              | eSIM status and data remaining                  |
| `GET /balance`               | Partner float. See the balance guard           |
| `POST /set_notification_url` | Yesim pushes eSIM status changes to us          |

**Pricing. Use `retail_price`, never `price`.** `price` is the partner rate we are
billed. `planPrice()` in `lib/api/mappers.ts` is the only place a customer-facing price
is built.

`Plan.id` is the API's 32-char hex id and is **the value `/new_esim` needs**. It must
survive into the order.

`/issue_esim` is Yesim's bulk endpoint. **It does not work and is scrapped.**
`/new_esim` is the only provisioning call: one call, one eSIM. A quantity of `n`
is `n` calls. Adding a plan to a card the customer already owns is a separate
add-plan-by-ICCID endpoint that **overwrites** the plan on that card.

### Answer before starting payments

- [ ] Exact parameters and response shape for `/new_esim` and for add-plan-by-ICCID.
- [ ] Does Yesim email the QR itself, or must we?
- [ ] What a failure looks like: an HTTP error, or a `200` carrying an error field?
- [ ] Does a repeated `/new_esim` with the same values double-charge us?
- [ ] Is `/balance` a prepaid float that can run dry, or post-paid invoicing?

---

## 1. Blocks launch

- [ ] **Disable the Pay button until Stripe is wired.** `PaymentStep.tsx` renders a
      button with no handler. Signed out it is correctly disabled; signed in it goes
      live, says "Pay €X", and silently does nothing when clicked.
- [x] **Compress `public/videos/hero.mp4`.** It is 35 MB. 90% of all static assets. Autoplays with `preload="auto"` and has no poster frame. Target under 3 MB and add
      a poster.
- [ ] **Terms of Service, Privacy Policy, cardholder-credential page** written, hosted
      and linked. Currently `href="#"` in `lib/auth/providers.ts`.
- [ ] **Refund and support policy published.** The FAQ already promises "if a plan never
      connects, we refund it" against a policy that does not exist.
- [ ] **Resolve the last `href="#"`**. The FAQ's "How it works" CTA (`Faq.tsx:81`). The
      footer and social links now all point somewhere.

---

## 2. Payments and fulfillment (Stripe)

```
pick plan → createOrder (server re-prices) → PaymentIntent
         → customer pays → Stripe webhook → GET /new_esim → Yesim emails the QR
```

**The client never sends a price.** It sends a plan id and a quantity; the server looks
the price up again.

### Taking the payment

- [ ] Server action `createOrder({ planId, quantity })`. `verifySession()`, re-read the
      plan from the catalog, compute the total server-side, clamp to `MAX_ESIMS`. Call
      `refreshSession()` here directly rather than through the `touchSession` action.
- [ ] PaymentIntent with an **idempotency key** so a double-click cannot charge twice.
      Put `planId`, `quantity` and `yesimUserId` in the metadata.
- [ ] Return only the `client_secret` to the browser.
- [ ] Mount Stripe's Payment Element so card data never touches our DOM (PCI SAQ-A).
- [ ] Rewrite `/checkout` to take an order id, not a query-string bill of goods.
      `resolveOrder` in `lib/order.ts` is replaced.

### Fulfilling the order

- [ ] `app/api/webhooks/stripe/route.ts`. Read the **raw** body, verify the signature
      with `constructEvent`, store the event id in Redis to reject replays.
- [ ] **Fulfill in the webhook, never on the browser redirect.** A customer who closes
      the tab after paying must still get their eSIM.
- [ ] Fulfillment = `GET /new_esim` with the session's `user_id` and the plan's hex `id`,
      once per purchased quantity.
- [ ] Success page polls order status, showing pending until the webhook lands.

### The failure mode that will actually bite

Stripe can succeed while `/new_esim` fails. Bad partner balance, Yesim downtime, a plan
withdrawn between browsing and paying. The customer has been charged and has nothing.

- [ ] **Check `GET /balance` before creating the PaymentIntent.** If the float cannot
      cover the order, do not take the money.
- [ ] Alert when the balance drops below a threshold.
- [ ] Retry `/new_esim` with backoff. If it still fails: refund automatically, email the
      customer, alert yourselves.
- [ ] Log every order's state transitions.
- [ ] `POST /set_notification_url` so Yesim reports eSIM state changes.

**Done when:** a test card completes end to end and the eSIM arrives; a replayed webhook
issues nothing extra; a hand-edited price changes nothing; and a forced `/new_esim`
failure refunds instead of swallowing the money.

---

## 3. Auth. Remaining

- [ ] **Verify the Resend sending domain (SPF/DKIM)** or codes land in spam.
- [ ] **Google sign-in.** `app/api/auth/google/route.ts` + `callback/route.ts`. OIDC
      with PKCE, `state` and `nonce` in short-lived httpOnly cookies. Verify `iss`,
      `aud`, `exp`, `nonce` against Google's JWKS. Exact redirect-URI allowlist.
      **Reject any token whose email is not verified**, or someone signs in with an
      unverified account carrying a customer's address and receives their eSIMs.
      Flip `ready: true` in `lib/auth/providers.ts`.
- [ ] **Decide what "Delete account" does.** The button in `AccountAction.tsx` is a
      placeholder with no handler. Yesim exposes no user-deletion endpoint, so closing an
      account can only clear the session and our Redis keys. The upstream user survives
      and a later sign-in with the same address reuses it. GDPR erasure needs an answer
      from Yesim.
- [ ] `proxy.ts` at the project root for optimistic cookie-presence redirects only.
      (Next 16 renamed Middleware to Proxy.) **Not** the authorization check. That
      stays `verifySession()` inside each data function.
- [ ] Order history reading `GET /orders`. `GET /user` is done. `/esims` renders it
      (`lib/data/esims.ts`). Plan names there depend on `active_plan_id` matching a
      catalog `id` or `old_id`; older eSIMs report neither and render without a name.
- [ ] Add a per-IP verify limit. Attempts are capped per code (5) and per address via the
      send limit, which works out at 25 guesses an hour.

---

## 4. Security hardening

- [ ] CSP with a per-request nonce, set in `proxy.ts`.
- [ ] Headers: `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`,
      `Permissions-Policy`.
- [ ] `serverActions.allowedOrigins` set for production.
- [ ] Rate limiting on order creation and the webhook endpoint.
- [ ] Structured logs with no PII and no tokens. Audit that `redactToken` covers every
      path that can log a Yesim URL, including uncaught error handlers.
- [ ] **Rotate `YESIM_API_TOKEN` before launch**. The dev one has been in terminals,
      shell history and `.next/cache`.
- [ ] `experimental.taint: true`, taint the account object.
- [ ] Resolve `npm audit`: 4 high in `sharp`/libvips. The fix wants next 16.3.0, outside
      the pinned range. Needs a deliberate decision.
- [ ] Document secret rotation. Confirm no secret is committed (`git log -p` scan).

---

## 5. Content and correctness

- [ ] **Pick one rating and use it everywhere.** Three contradict each other on a single
      visit: Trustpilot 4.8 (`TrustBar.tsx`), App Store 4.9 (`About.tsx`), 4.7 with
      97,400 reviews (`PlanPicker.tsx`). Plus an unsourced "1,657,382,391 GB delivered".
      Unsubstantiated review claims are an advertising-law problem in the EU.
- [ ] **Fix the FAQ.** It says compatibility is checked at checkout; the device dialog is
      on the destination page.
- [ ] **Shoot or license the destination photos.** The plumbing is in: `lib/heroes.ts`
      resolves `public/images/{countries,regions,global}/<slug>.<ext>` and falls back to
      `fallback.jpg`. The folders are still empty, so every page shows the fallback.
      Expected file names are listed in each folder's `.txt` (148 countries, 11 regions,
      2 global); regenerate with `node --env-file=.env.local scripts/hero-names.mjs`.
      Those `.txt` files sit under `public/` and are publicly served. Move them if that
      matters.
- [ ] Rewrite `README.md`. Still create-next-app boilerplate referencing Geist and
      `app/page.tsx`.
- [ ] Decide the upstream naming overrides: `MIDDLE EAST` is uppercase and `LATAM` / `SEA`
      are abbreviations, and they render as Yesim writes them. `CIS` now maps to `Eurasia`.
- [ ] Confirm the duplicate destinations are intentional. Grouping the live catalog by
      kind produces `LATAM` alongside `Latin America`, `Asia` alongside `Asia Pacific` and
      `SEA`, and `Japan` as both a country and a region. Each gets its own page, its own
      hero photo and its own SEO surface.
- [ ] **Stale-on-error.** A catalog failure after the cache expires renders `error.tsx`.
      Decide whether to serve the last good copy instead.

---

## 6. SEO

- [ ] `sitemap.ts` and `robots.ts`. None exist, across 176 prerendered pages.
- [ ] `metadataBase`, canonical URLs, Open Graph images. Link previews are blank today.

---

## 7. Quality gates

- [ ] CI runs `typecheck`, `lint`, `build` on every PR.
- [ ] Vitest for `lib/`: money formatting, session encrypt/decrypt, and the mappers
      against `lib/api/__fixtures__/plans.json`. 1520 real plans, no network. Cover the
      traps that fixture exposed: `data: "Unlimited"`, `old_id: null`, the
      `UNLIM_UAE_7D` / `St. Kitts` grouping, and the `japan` / `japan-region` collision.
- [ ] Playwright for the two flows that matter: browse → pick plan → checkout, and
      sign-in → pay.
- [ ] Error monitoring (Sentry or equivalent) for server and client.

---

## 8. Deployment

- [ ] **Un-ignore `.env.example`**. The `.env*` rule in `.gitignore` swallows it, so the
      template `lib/env.ts` tells people to copy is not in the repo. Add `!.env.example`.
      It is also missing `YESIM_API_BASE` and `REVALIDATE_SECRET`.
- [ ] Production domain + TLS.
- [ ] Separate env var values per environment. They are set on Vercel today, but preview
      and production share the one Yesim token and session secret.
- [ ] Staging environment mirroring production.
- [ ] Stripe live keys, webhook endpoint registered, signing secret set.
- [ ] Analytics. Uptime monitoring on the site and on the Yesim API.
- [ ] **Balance alerting live before the first real order.**
- [ ] Backup and rollback plan.

---

## 9. Final pass

- [ ] Lighthouse: performance, accessibility, SEO, best practices.
- [ ] Keyboard and screen reader pass on the dialogs and checkout.
- [ ] Real devices: iOS Safari, Android Chrome.
- [ ] Live payment smoke test with a real card, then refund it.

---

## Order of work

| Work                            | Est.     | Blocked by |
| ------------------------------- | -------- | ---------- |
| Blocks launch (§1)              | 1 day    |            |
| Payments and fulfillment (§2)   | 5–6 days |            |
| Auth remainder (§3)             | 2–3 days |            |
| Security hardening (§4)         | 2 days   | §2         |
| Content, SEO (§5, §6)           | 1–2 days |            |
| Quality gates (§7)              | 1 day    |            |
| Deployment, final pass (§8, §9) | 2–3 days | §4         |

§1, §5, §6 and §7 are blocked by nothing and can start immediately.
