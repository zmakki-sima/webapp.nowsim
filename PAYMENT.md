# PAYMENT.md — Stripe integration, start to finish

Plain-English plan for wiring Stripe into nowsim checkout. Written for a
non-developer.

> **The code is built and working** as of 2026-08-27. Everything below §1 is
> reference: how the system works, the test checklist, and the go-live steps.

## What's left

- **Run the sandbox test matrix** (§9). None of it has been run yet — including
  the alert email, which has never been sent for real.
- **Decide currency settlement** (§13.1) — the Stripe account is CHF, prices are
  EUR. Affects every payout.
- **Confirm the Stripe account itself** (§13.2) — Connect and a "Swan sandbox"
  account are still unexplained.
- **Security headers** before real card traffic — `FIXME.md`.
- **Go live** (§10) — Stripe's account review takes real calendar time, so start
  it before everything else is finished.

**Out of scope:** automatic refunds. The published refund policy is
request-and-review within 15 business days, so a person issues refunds from the
Stripe dashboard; the webhook already listens for `charge.refunded` and updates
the order to match.

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

| Term                                            | Plain meaning                                                                                        |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Sandbox / test mode**                   | A fake Stripe. Fake cards, fake money. What your screenshot shows.                                   |
| **Live mode**                             | Real cards, real money. Completely separate keys and dashboard.                                      |
| **Publishable key** (`pk_test_…`)      | Public ID. Safe in the browser. Not a secret.                                                        |
| **Secret key** (`sk_test_…`)           | Password to your Stripe account.**Server only. Never in git, never in the browser.**           |
| **Checkout Session**                      | One attempt to pay for one order. We create it; Stripe hosts the page.                               |
| **Webhook**                               | Stripe phoning our server to report what happened. The only source of truth.                         |
| **Webhook signing secret** (`whsec_…`) | Proves the phone call is really Stripe and not a stranger.                                           |
| **Fulfilment**                            | Everything we do*after* money clears: buy the eSIM, email it.                                      |
| **Idempotency**                           | "Doing it twice has the same effect as doing it once." Stops double charges and double eSIMs.        |
| **SCA / 3-D Secure**                      | The bank's "approve in your banking app" step. Legally required in Europe. Stripe handles it for us. |
| **Chargeback / dispute**                  | Customer tells their bank "I didn't buy this." Money is pulled back plus a fee.                      |

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
                                            → a human refunds from the dashboard
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
8. **Success and cancel pages** — `/checkout/success` reads the order record and shows real status; `/checkout/failed` is Stripe's `cancel_url`, and offers the same checkout back (the order record stores the query string that rebuilds it).
9. **Alerting** — if fulfilment fails after payment, a human must find out in minutes, not from an angry customer.

---

## 6. Duplicate protection, in three layers

Stripe *will* send the same webhook more than once. This is by design, not a bug.

- **Layer 1 — creating the session.** An idempotency key on the create call means a double-click produces one session, not two.
- **Layer 2 — the webhook.** Every event has a unique id. First thing we do: try to record that id in Redis. Already recorded → we have seen this event → stop immediately.
- **Layer 3 — fulfilment.** The order record is only advanced from `paid` to `fulfilled` once. If Yesim's purchase endpoint accepts an idempotency key of its own, use it too — this needs confirming with Yesim (§12).

---

## 7. When things go wrong (the part most integrations skip)

| Situation                                | What we do                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card declined                            | Stripe handles it on their page. No webhook fires for us. Nothing to do.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Customer abandons the payment page       | Session expires by itself. Order stays`pending`. Nothing charged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Webhook arrives twice                    | Second one is dropped by the event-id check.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Paid, but Yesim purchase fails** | The dangerous one. We hold their money with nothing delivered. The order is marked`failed`, recording exactly which cards were delivered and which are owed, and **an alert email goes to customer service immediately** (§13.5). A person then refunds the undelivered part from the Stripe dashboard and emails an apology, inside the 15-business-day window the [refund policy](app/(site)/refund-policy/page.tsx) promises. Refunding automatically is deliberately **out of scope** — the published policy is request-and-review, not automatic, so the code must not promise more than the policy does. This makes the alert channel load-bearing: with no automatic safety net, an unread alert means we keep a customer's money. |
| Paid, eSIM bought, email fails           | The eSIM exists — do**not** re-buy and do **not** refund. The order stays `fulfilled`, because it is, and the alert email says so in its own words: resend the details, or point the customer at `/esims`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Our server is down when Stripe calls     | Stripe retries for up to ~3 days with backoff. This is why the webhook — not the browser — is the source of truth.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Customer disputes the charge             | Listen for the dispute event, alert a human, and respond in the dashboard with the delivery evidence within the deadline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Refund issued in the Stripe dashboard    | Listen for the refund event and mark the order refunded, so our records match Stripe's.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

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

| Purpose                        | Number                  |
| ------------------------------ | ----------------------- |
| Succeeds — Visa               | `4242 4242 4242 4242` |
| Succeeds — Visa debit         | `4000 0566 5566 5556` |
| Succeeds — Mastercard         | `5555 5555 5555 4444` |
| Succeeds — Amex (4-digit CVC) | `3782 822463 10005`   |
| Succeeds — Discover           | `6011 1111 1111 1117` |
| Generic decline                | `4000 0000 0000 0002` |
| Insufficient funds             | `4000 0000 0000 9995` |
| Expired card                   | `4000 0000 0000 0069` |
| Incorrect CVC                  | `4000 0000 0000 0127` |
| **Requires 3-D Secure**  | `4000 0025 0000 3155` |

Do not skip the last one. European cards will hit that screen constantly in real life.

**Scenarios to run, all in sandbox:**

- [ ] Happy path — pay, land on success, eSIM email arrives, order shows under `/esims` and `/purchases`.
- [ ] Each decline card — clear error, no order created, no email.
- [ ] 3-D Secure card — the authentication screen appears and completes.
- [ ] Abandon the Stripe page and go back — no charge, no order.
- [ ] Double-click **Pay** — one session, one charge.
- [ ] Replay a webhook with the CLI — no second eSIM, no second email.
- [ ] Post a fake unsigned request to the webhook — rejected with `400`.
- [ ] Force Yesim to fail — the alert email arrives at `ORDER_ALERT_EMAIL`
  within a minute, order marked `failed`, and both the mail and the order
  record name which cards were delivered and which are owed. Then refund
  the undelivered part by hand from the dashboard and confirm the order
  flips to refunded.
- [ ] Force the eSIM email to fail on an order Yesim did fulfil — the alert
  says *delivered, customer not told* and tells the reader **not** to
  refund. Getting this backwards would refund a customer who has a working
  eSIM.
- [ ] Unset `RESEND_API_KEY` and force a failure — the `[ALERT UNDELIVERED]`
  console line appears and fulfilment still does not throw.
- [ ] Try to pay while signed out — blocked.
- [ ] Tamper with the price in the URL — server ignores it and charges the catalog price.
- [ ] Refund from the dashboard — order flips to refunded.

---

## 9b. Deploying to staging (`nowsim.vercel.app`)

The step between "works on my laptop behind `stripe listen`" and "takes real
money". Same code, same test keys, but reached over the public internet — so
Stripe talks to the URL directly and the CLI tunnel is retired.

**What changes from local:** nothing in the code. The tunnel is replaced by a
real URL, and the CLI's signing secret by one the dashboard mints. Test mode
throughout — no real card is ever charged here.

### Why `NOWSIM_STAGE` exists

`NODE_ENV` is `production` for *every* `next build`, staging included, so it
cannot tell the two apart. Left as the only signal, a staging deploy would be
required to carry `sk_live_` — real cards on a test site. `lib/stage.ts` splits
that into three named modes, and **unset means `staging`, never `live`**: a
half-configured deploy must not be able to take real money by omission.

- `isLive` — guards money and customer-facing identity: the `sk_live_`
  requirement, the verified mail sender.
- `isDeployed` — guards anything about being on the internet rather than a
  laptop: secure `__Host-` cookies, a stated site URL, no silent mail failures.

### Steps

1. **Set the environment variables** in Vercel → Project → Settings →
   Environment Variables. Everything in `.env.example`, plus:
   - `NOWSIM_STAGE=staging`
   - `NEXT_PUBLIC_SITE_URL=https://nowsim.vercel.app`
   - `STRIPE_SECRET_KEY` — the **test** key, `sk_test_…`
   - `AUTH_EMAIL_FROM` — may stay on the Resend sandbox here; it only reaches
     the Resend account owner, which is who a staging sign-in should reach.
   - `ORDER_ALERT_EMAIL` — point it somewhere harmless so test failures do not
     page the supervisor.
2. **Deploy.** Vercel only picks up new variables on the *next* build, so a
   variable added after a deploy needs a redeploy to take effect. This is the
   step that most often looks like a code bug and is not.
3. **Create the webhook endpoint** — Stripe dashboard in **test mode** →
   Developers → Webhooks → Add endpoint →
   `https://nowsim.vercel.app/api/stripe/webhook`. Subscribe to exactly the four
   events the route handles: `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`, `charge.refunded`,
   `charge.dispute.created`.
4. **Copy that endpoint's signing secret** into `STRIPE_WEBHOOK_SECRET` and
   redeploy. It is **not** the same value `stripe listen` printed locally.
5. **Re-run the §9 checklist against the deployed site.** Its "Send test event"
   button and the delivery log show the exact response the route gave, which is
   the fastest way to read a failure.

### If it fails

- **`400 Invalid signature`** — nearly always the wrong secret: the CLI's value
  left in place, or a test-mode secret against a live endpoint. The raw-body
  handling is already correct (`request.text()` before any parsing), so suspect
  the secret first.
- **`500 Handler failed`** — the route deliberately releases its idempotency
  claim so Stripe's retry can succeed; check the function logs for the cause.
- **Redis is shared with local dev** unless staging gets its own Upstash
  database. Order records and OTPs will mingle. Give staging its own if that
  matters.

### Later, moving to `nowsim.com`

Additive, and the code does not change:

1. Add the domain in Vercel and point DNS at it.
2. Add a **second** webhook endpoint, `https://nowsim.com/api/stripe/webhook`,
   in the **live-mode** dashboard — live mode has its own endpoints and its own
   secrets, entirely separate from test.
3. Set `NOWSIM_STAGE=live`, `NEXT_PUBLIC_SITE_URL=https://nowsim.com`, the
   `sk_live_` key, that endpoint's secret, and a verified `AUTH_EMAIL_FROM`.
4. Work through §10 before the first real charge.

Keeping staging alive on test keys after the domain moves is worth it: it stays
the place to test a change without touching real money.

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

## 12. Provisioning — decided

Confirmed by the account owner. Not open questions any more.

**`new_esim` is the only provisioning call.** It creates one eSIM with one plan
attached. `issue_esim` is Yesim's bulk endpoint, it does not work, and it is
scrapped — it must not appear anywhere in the codebase.

**Quantity `n` means `n` separate `new_esim` calls.** There is no bulk path. Each
call yields its own card, so the order record tracks them individually: if call 2
of 3 fails, one eSIM was delivered and two are owed, and the refund is for two —
not for the whole order.

**Adding a plan to an eSIM the customer already owns** uses a separate
add-plan-by-ICCID endpoint. It **overwrites** whatever plan is on that card,
including any data still left on it. The upside is that the customer skips
installation entirely — the profile is already on their phone. Expired cards are
valid targets; a removed one is not.

**The customer picks new-vs-existing before paying, not after.** By the time the
webhook runs they are long gone, so the choice is captured at checkout and
carried in the Stripe session metadata. Built in
[`InstallChoiceDialog.tsx`](components/sections/checkout/InstallChoiceDialog.tsx),
opened by the Pay button, fed by the `listInstallTargets` server action
([`app/actions/checkout.ts`](app/actions/checkout.ts)).

**Adding to an existing eSIM is a quantity-of-one operation.** One card cannot be
overwritten three times, so orders above one eSIM skip the dialog and always
issue new cards.

**The catalog is priced in EUR; the customer may be billed in another currency.**
This changed after the section was first written. [`lib/money.ts`](lib/money.ts)
now supports `EUR`, `USD`, `BHD` and `AED`, with EUR as the base — nothing is
stored in a display currency, and conversion happens at the last moment, either
when a price is painted or when Stripe is told what to charge
([`checkout.ts:209`](app/actions/checkout.ts)). The browser sends only the
currency *code*; the server does the conversion, so a tampered code can change
which currency is billed, never the amount.

**Yesim's behaviour is now confirmed and encoded** in
[`lib/payments/provision.ts`](lib/payments/provision.ts). The answers, for the
record:

- `new_esim` takes `user_id` and `plan_id`; both are always sent (omitting
  `plan_id` yields a blank card with nothing to sell).
- `add_plan_iccid` takes `iccid`, `plan_id` and a free-text `payment_id`. Sending
  the *same* plan already on the card **adds** to it; sending a *different* plan
  **replaces** it.
- Failures come back as `200` with an error in the body, not an HTTP error
  status — so success is judged on the body, and an unparseable reply counts as
  a failure.
- **Neither call is idempotent.** Yesim offers no reference that makes a repeat
  safe, which is why every success is banked to the order record the moment it
  happens and nothing retries on its own.
- Yesim does **not** return the QR image from `new_esim`; the account is read
  back afterwards to collect it for the email.

---

## 13. Open questions

- **🔴 Currency settlement.** The Stripe account is in **CHF**, prices are
  **EUR**. Charging EUR into a CHF account works, but Stripe converts at their
  rate and takes a fee, so payouts will not match the sticker price. Decide:
  sell in CHF, accept the conversion, or add EUR as a second settlement
  currency.
- **🟡 Stripe Connect.** The dashboard shows Connect enabled, connected
  accounts, and CHF 100 of Connect payment volume, under an account named **Swan
  sandbox**. Connect means money is being routed to *other* accounts. Confirm
  whether this is meant to be a plain merchant account or part of a Connect
  platform — and whether the Swan account is even the right one to use.
- **🟡 Guest checkout.** Today the Pay button is locked until sign-in. Keep it
  that way for launch — it gives us a Yesim user id and an email to deliver to.
  Confirm.

*Answered: the alert channel is **email to customer service**, sent through the
existing Resend account to `zmakki@sima-difc.com`. Overridable with
`ORDER_ALERT_EMAIL`, but it defaults to that address — an unset variable must
never mean the alert goes nowhere. Built in
[`lib/mail/alert.ts`](lib/mail/alert.ts), sent from `alert()` in
[`fulfil.ts`](lib/payments/fulfil.ts), which still writes its console line first
so a broken mailer cannot erase the record. The mail names the money held, the
customer, what was ordered, which cards were delivered, the Stripe payment
intent, and the next step — refund by hand for a `failed` order, resend the
details for a `fulfilled` one that only missed its email.*

*Answered: the refund policy is live at
[`/refund-policy`](app/(site)/refund-policy/page.tsx) — 30 days, only if not
activated/used/expired, request-and-review within 15 business days, back to the
original payment method, amounts of €10 or less as Ycoins.*

---

## 14. What this does *not* cover

Deliberately out of scope for launch: saved cards, subscriptions or auto-renew
(the page explicitly promises none —
[`PaymentStep.tsx`](components/sections/checkout/PaymentStep.tsx)), promo codes,
invoicing, and the embedded Payment Element. Each is additive later.

Multi-currency pricing was originally listed here too, but has since been built
— see §12.
