# PAYMENT.md — Stripe integration, start to finish

Plain-English plan for wiring Stripe into nowsim checkout. Written for a
non-developer. No code has been written yet — this is the map before the build.

Closing this closes **A1** in [`FIXME.md`](FIXME.md), the top launch blocker.

---

## 0. The one-paragraph version

A customer picks an eSIM plan, signs in, and clicks **Pay**. Our server (not the
browser) works out the real price, asks Stripe to open a secure payment page, and
sends the customer there. The customer types their card into **Stripe's** page,
never ours. When the money actually clears, Stripe calls our server back on a
private line ("webhook") and says *"order 123 is paid."* Only then do we buy the
eSIM from Yesim and email it to the customer. Everything else — the success page,
the browser, the customer clicking things — is decoration and cannot be trusted.

---

## 1. Vocabulary (read once, everything below makes sense)

| Term | Plain meaning |
| --- | --- |
| **Sandbox / test mode** | A fake Stripe. Fake cards, fake money. What your screenshot shows. |
| **Live mode** | Real cards, real money. Completely separate keys and dashboard. |
| **Publishable key** (`pk_test_…`) | Public ID. Safe in the browser. Not a secret. |
| **Secret key** (`sk_test_…`) | Password to your Stripe account. **Server only. Never in git, never in the browser.** |
| **Checkout Session** | One attempt to pay for one order. We create it; Stripe hosts the page. |
| **Webhook** | Stripe phoning our server to report what happened. The only source of truth. |
| **Webhook signing secret** (`whsec_…`) | Proves the phone call is really Stripe and not a stranger. |
| **Fulfilment** | Everything we do *after* money clears: buy the eSIM, email it. |
| **Idempotency** | "Doing it twice has the same effect as doing it once." Stops double charges and double eSIMs. |
| **SCA / 3-D Secure** | The bank's "approve in your banking app" step. Legally required in Europe. Stripe handles it for us. |
| **Chargeback / dispute** | Customer tells their bank "I didn't buy this." Money is pulled back plus a fee. |

---

## 2. Which integration style — and why

Stripe offers two shapes. We take the first.

**A. Stripe-hosted Checkout (chosen).**
- Customer leaves our site briefly and pays on `checkout.stripe.com`.
- Card numbers never touch our servers, our logs, or our code.
- Apple Pay, Google Pay, 3-D Secure, receipts, translations, saved cards — all free, all maintained by Stripe.
- Puts us in **PCI SAQ A**, the lightest compliance tier that exists. This is the single biggest reason.
- Our checkout page already promises exactly this: *"Card details are entered on Stripe's secure page"* — [`PaymentStep.tsx:36`](components/sections/checkout/PaymentStep.tsx). No copy change needed.

**B. Embedded Payment Element (rejected for launch).**
- Card fields sit inside our page. Prettier, more work, heavier compliance, more ways to leak.
- Revisit after launch if the redirect hurts conversion. It is a swap, not a rewrite.

---

## 3. The golden rules

Break these and you get fraud, double charges, or free eSIMs.

1. **The server decides the price.** The browser may send *what* was picked (plan, quantity), never *how much*. Today's total comes from [`lib/order.ts`](lib/order.ts) on the server — keep it that way. Otherwise a customer edits the page and buys a €50 plan for €0.50.
2. **Payment is confirmed by the webhook, never by the browser.** A customer can close the tab, lose signal, or type the success URL by hand. The success page says "thanks", it never grants anything.
3. **Nothing is delivered before money clears.** No eSIM purchase, no email, until Stripe confirms paid.
4. **Every step must survive being run twice.** Stripe deliberately re-sends webhooks. Two deliveries must not mean two eSIMs.
5. **Secrets live in the hosting environment, never in the repo.** Same discipline as `YESIM_API_TOKEN` today.
6. **Test mode and live mode never mix.** `sk_test_` keys with live traffic (or the reverse) fail loudly — which is good, but only if we notice.

---

## 4. How the money actually flows

```
Customer clicks "Pay €14.00"
        │
        ▼
Our server: rebuild the order from scratch, compute the real total,
            create a Stripe Checkout Session, stamp it with who + what
        │
        ▼
Customer is redirected to Stripe's page → types card → bank may ask for 3-D Secure
        │
        ├── Card declined ──► Stripe shows the error, customer retries. We do nothing.
        │
        └── Payment succeeds
                 │
                 ├──► Customer lands on /checkout/success  ("Thanks! Your eSIM is on its way.")
                 │     (cosmetic only — grants nothing)
                 │
                 └──► Stripe calls our webhook: "checkout.session.completed, paid"
                            │
                            ▼
                      Have we already handled this event?  ── yes ──► stop, reply OK
                            │ no
                            ▼
                      Buy the eSIM from Yesim (new_esim, for this user + plan)
                            │
                            ├── success ──► email the eSIM, mark order fulfilled, reply OK
                            │
                            └── failure ──► record it, alert us, reply "retry later"
                                            → refund if we cannot deliver
```

---

## 5. What gets built

Roughly nine pieces. Each is small.

1. **The Stripe library** — add the official `stripe` package to [`package.json`](package.json). Currently absent.
2. **Environment variables** — three new secrets, validated at boot in [`lib/env.ts`](lib/env.ts), each one **failing loudly if missing**. This mirrors the lesson already learned in `FIXME.md` A5: a silent fallback caused an invisible outage. No defaults, no fallbacks.
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (needed for return URLs — currently validated by nothing, see `FIXME.md` F5)
3. **A "start payment" server action** — runs when **Pay** is clicked. It:
   - checks the customer is signed in (the button is already gated on this, [`CheckoutFlow.tsx:17`](components/sections/checkout/CheckoutFlow.tsx));
   - rebuilds the order server-side from the URL parameters via `resolveOrder`, ignoring any price the browser claims;
   - creates a one-off Checkout Session for that exact amount, tagged with the customer's account, the Yesim user id, the plan id and the quantity;
   - sends an idempotency key so a double-click cannot create two sessions;
   - returns the Stripe URL to redirect to.
4. **Wire up the dead button** — [`PaymentStep.tsx:58-68`](components/sections/checkout/PaymentStep.tsx) currently has no click handler at all. Add the handler, a loading state, and an error message.
5. **The webhook** — a new route, e.g. `app/api/stripe/webhook/route.ts`. It must:
   - read the **raw, untouched** request body (signature checking fails otherwise);
   - verify Stripe's signature — reject anything unsigned with `400`;
   - ignore any event type it does not care about;
   - reply `200` fast; do the slow work carefully (see §7).
6. **Fulfilment** — the piece that turns a paid order into a delivered eSIM: call Yesim's purchase endpoint, then `sendEsimEmail` ([`lib/mail/esim.ts:699`](lib/mail/esim.ts)). **This is the part still missing its spec — see §12.**
7. **An order record** — a small row per order so we can answer "did this get delivered?" Redis is already a dependency (`@upstash/redis`, used by auth). Store: Stripe session id, account, plan, amount, status (`pending` → `paid` → `fulfilled` / `failed`), the Yesim result, timestamps.
8. **Success and cancel pages** — `/checkout/success` reads the order record and shows real status; `/checkout/cancel` (or return to checkout) for abandonment.
9. **Alerting** — if fulfilment fails after payment, a human must find out in minutes, not from an angry customer.

---

## 6. Duplicate protection, in three layers

Stripe *will* send the same webhook more than once. This is by design, not a bug.

- **Layer 1 — creating the session.** An idempotency key on the create call means a double-click produces one session, not two.
- **Layer 2 — the webhook.** Every event has a unique id. First thing we do: try to record that id in Redis. Already recorded → we have seen this event → stop immediately.
- **Layer 3 — fulfilment.** The order record is only advanced from `paid` to `fulfilled` once. If Yesim's purchase endpoint accepts an idempotency key of its own, use it too — this needs confirming with Yesim (§12).

---

## 7. When things go wrong (the part most integrations skip)

| Situation | What we do |
| --- | --- |
| Card declined | Stripe handles it on their page. No webhook fires for us. Nothing to do. |
| Customer abandons the payment page | Session expires by itself. Order stays `pending`. Nothing charged. |
| Webhook arrives twice | Second one is dropped by the event-id check. |
| **Paid, but Yesim purchase fails** | The dangerous one. We hold their money with nothing delivered. Reply to Stripe with an error so it retries; alert immediately; if it still fails, **refund automatically** and email an apology. Never leave it silent. |
| Paid, eSIM bought, email fails | The eSIM exists — do **not** re-buy. Retry the email; the customer can also see it under `/esims`. |
| Our server is down when Stripe calls | Stripe retries for up to ~3 days with backoff. This is why the webhook — not the browser — is the source of truth. |
| Customer disputes the charge | Listen for the dispute event, alert a human, and respond in the dashboard with the delivery evidence within the deadline. |
| Refund issued in the Stripe dashboard | Listen for the refund event and mark the order refunded, so our records match Stripe's. |

Events worth listening to: `checkout.session.completed`, `checkout.session.async_payment_failed`, `charge.refunded`, `charge.dispute.created`. Ignore the rest.

---

## 8. Security checklist

- Card numbers never reach our servers. Hosted Checkout — that is the whole point.
- Secret key: server-only file, never imported into a component, never logged, never in git. The repo already enforces the pattern with `import "server-only"`.
- Webhook signature verified on **every** request. Without it, anyone who guesses the URL can post "this order is paid" and receive free eSIMs. This is the single most attacked spot in any Stripe integration.
- Raw body preserved for the signature check.
- Amounts always in the smallest unit (cents). Our `Money` type already stores cents ([`lib/money.ts`](lib/money.ts)) — no conversion, no rounding drift.
- Currency taken from our catalog, never from user input.
- The webhook route must be excluded from any auth redirect logic in [`proxy.ts`](proxy.ts) — Stripe is not a logged-in user.
- Rate-limit the "start payment" action so nobody can spam session creation.
- Rotate the Yesim token before launch (`FIXME.md` A6) — while adding secrets, do the whole set once.
- Turn on **Stripe Radar** rules and require CVC and postal code checks.
- Enable HTTPS-only and the missing security headers (`FIXME.md` I1) before taking real card traffic.

---

## 9. Testing before real money

**Local setup.** Install the Stripe CLI, log in, then run its listener so Stripe's test events reach your laptop:
`stripe listen --forward-to localhost:3000/api/stripe/webhook`. It prints a `whsec_…` secret — that is your local `STRIPE_WEBHOOK_SECRET`.

**Test cards** (any future expiry such as `12/34`, any 3-digit CVC — 4 digits for Amex — any name and postal code):

| Purpose | Number |
| --- | --- |
| Succeeds — Visa | `4242 4242 4242 4242` |
| Succeeds — Visa debit | `4000 0566 5566 5556` |
| Succeeds — Mastercard | `5555 5555 5555 4444` |
| Succeeds — Amex (4-digit CVC) | `3782 822463 10005` |
| Succeeds — Discover | `6011 1111 1111 1117` |
| Generic decline | `4000 0000 0000 0002` |
| Insufficient funds | `4000 0000 0000 9995` |
| Expired card | `4000 0000 0000 0069` |
| Incorrect CVC | `4000 0000 0000 0127` |
| **Requires 3-D Secure** | `4000 0025 0000 3155` |

Do not skip the last one. European cards will hit that screen constantly in real life.

**Scenarios to run, all in sandbox:**

- [ ] Happy path — pay, land on success, eSIM email arrives, order shows under `/esims` and `/purchases`.
- [ ] Each decline card — clear error, no order created, no email.
- [ ] 3-D Secure card — the authentication screen appears and completes.
- [ ] Abandon the Stripe page and go back — no charge, no order.
- [ ] Double-click **Pay** — one session, one charge.
- [ ] Replay a webhook with the CLI — no second eSIM, no second email.
- [ ] Post a fake unsigned request to the webhook — rejected with `400`.
- [ ] Force Yesim to fail — alert fires, refund happens, order marked failed.
- [ ] Try to pay while signed out — blocked.
- [ ] Tamper with the price in the URL — server ignores it and charges the catalog price.
- [ ] Refund from the dashboard — order flips to refunded.

---

## 10. Going live

Only after §9 is fully green.

1. **Activate the Stripe account** — legal entity, address, bank account, tax details, ID verification. This takes real time; start it early.
2. **Statement descriptor** — set what customers see on their bank statement, e.g. `NOWSIM ESIM`. A confusing descriptor is the number-one cause of disputes.
3. **Branding** — logo and colours on the Checkout page and on emailed receipts.
4. **Turn on Stripe's email receipts.**
5. **Create the live webhook endpoint** in the live dashboard pointing at the production URL. It has its **own** signing secret — different from the test one.
6. **Put the live secrets in the production environment only.** Never in `.env.local`, never in git, never in Slack.
7. **Legal pages must be real before the first live charge** — this is a Stripe activation requirement and a consumer-law one: a refund policy, complete Terms, and a contact address. `FIXME.md` A3 and A4 are open on exactly this.
8. **VAT / sales tax** — selling digital services across borders has tax obligations that depend on the customer's country. Decide with an accountant whether to enable **Stripe Tax** and whether displayed prices include tax. Do not guess.
9. **Radar rules on, alerts on, dashboard access limited** to people who need it, each with two-factor.
10. **First live transaction: buy one yourself with a real card**, confirm the eSIM arrives, then refund it. Never let a customer be the first live test.
11. **Watch the first day** — dashboard open, alerts live, someone able to refund quickly.

**Rollback plan:** if payments misbehave after launch, put `/checkout` behind a coming-soon state (the fallback `FIXME.md` A1 already proposes) rather than leaving a half-working payment flow up.

---

## 11. Suggested order of work

| Phase | Outcome | Rough size |
| --- | --- | --- |
| 1 | Package added, env vars wired and failing loudly, keys in `.env.local` | Small |
| 2 | Pay button creates a session and redirects to Stripe; payment succeeds; nothing is delivered yet | Medium |
| 3 | Webhook verified and de-duplicated; order records written; success/cancel pages real | Medium |
| 4 | Real fulfilment: Yesim purchase + eSIM email, with the refund-on-failure path | Medium — **blocked on §12** |
| 5 | Alerts, dispute and refund handling, rate limiting, security headers | Small |
| 6 | Full test matrix in sandbox | Half a day of clicking |
| 7 | Live activation and first real transaction | Depends on Stripe's review |

Phases 1–3 can start immediately. Phase 4 cannot.

---

## 12. Open questions — answers needed before code

Four are blocking. Please get these answered.

1. **🔴 Yesim purchase contract (blocks phase 4).** We currently only *read* from Yesim — plans, orders, eSIMs. Nothing anywhere in the codebase buys one. Needed from Yesim:
   - the exact endpoint and parameters to buy a plan for a given user;
   - what it returns (ICCID, activation code, QR);
   - whether calling it twice with the same reference is safe, or whether it double-charges;
   - **how we are billed** — is our partner balance debited at purchase time? If so, a low balance means paid customers get no eSIM, and balance monitoring becomes mandatory.
2. **🔴 Currency mismatch.** Your Stripe account is in **CHF**. Our catalog prices are **EUR or USD** ([`lib/money.ts:1`](lib/money.ts)). Charging EUR into a CHF account works, but Stripe converts at their rate and takes a conversion fee, so payouts will not match the sticker price. Decide: sell in CHF, or accept the conversion, or add a second settlement currency.
3. **🟡 Stripe Connect.** Your dashboard shows Connect enabled, connected accounts, and CHF 100 of Connect payment volume, under an account named **Swan sandbox**. Connect means money is being routed to *other* accounts. If nowsim's payments must flow through a connected account or a platform, the setup changes materially. Confirm whether this account is meant to be a plain merchant account or part of a Connect platform — and whether the Swan account is even the right one to use.
4. **🟡 Guest checkout.** Today the Pay button is locked until sign-in. Keep it that way for launch — it gives us a Yesim user id and an email to deliver to. Confirm.
5. **🟢 Refund policy.** eSIMs are hard to "return" once activated. Written policy needed: refundable before activation, not after? Partial? This feeds both the Terms and the automatic-refund logic.
6. **🟢 Alert channel.** Where should "paid but not delivered" alerts land — email, Slack, something else?

---

## 13. What this does *not* cover

Deliberately out of scope for launch: saved cards, subscriptions or auto-renew (the page explicitly promises none — [`PaymentStep.tsx:76`](components/sections/checkout/PaymentStep.tsx)), promo codes, multi-currency pricing, invoicing, and the embedded Payment Element. Each is additive later.
