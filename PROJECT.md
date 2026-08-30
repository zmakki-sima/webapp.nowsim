# nowsim — what this project is

A quick guide in plain English. No developer background needed.

Written from the code, not from the older planning notes.

---

## 1. What it is

**nowsim is an online shop that sells travel data plans.**

You're going abroad and you don't want a huge phone bill or a plastic SIM from
an airport kiosk. You come to nowsim, pick where you're going, choose how much
data and for how many days, pay by card, and a QR code arrives by email. You
scan it and your phone has mobile data in that country.

Nothing is ever shipped, so someone can buy at 2am from anywhere and be online a
minute later.

## 2. What an eSIM is

A normal SIM is a plastic chip you push into your phone. An **eSIM** is the same
thing downloaded instead of posted. Most phones from the last few years take one.

One useful detail, because the site is built around it: an eSIM is a *card*, and
a *plan* is written onto that card. The card stays on the phone permanently. So
a returning customer has a choice — get a brand-new card, or write the new plan
onto a card they already installed. The site supports both, and the second one
matters because it means no re-scanning a QR code at the airport.

## 3. Where the plans come from

**nowsim owns no mobile network.** It resells.

A company called **Yesim** owns the network deals and the eSIM technology. nowsim
has a partner account, and everything the customer sees comes from Yesim live
over the internet: the country and plan list, the wholesale price, the eSIM
itself (created at the moment of purchase), and how much data is left on it.

nowsim's job is the shop around it — the website, the customer-facing prices, the
accounts, the payment and the relationship with the buyer.

**The margin.** Yesim quotes two prices per plan: what nowsim pays, and the
recommended retail price. The site always shows the retail one. The gap is the
margin.

**Israel is excluded.** Plans covering Israel are filtered out of the catalog
before it's ever displayed, checked four ways — by country name, and by two
different country-code formats. A deliberate business decision, enforced in code.

## 4. What a customer can do

- **Browse destinations** — around 150 countries plus regional bundles (Europe,
  Asia Pacific, Latin America) and global plans, each with its own page.
- **Compare plans** — data, days, price.
- **Check their phone is compatible** — a searchable list from Yesim, covering
  phones, tablets, watches, laptops and even cars.
- **See prices in their currency** — Euro, US Dollar, UAE Dirham, Bahraini Dinar.
- **Sign in by email** — no password. They type their address, get a 6-digit
  code, type it back.
- **Pay by card** on Stripe's own page.
- **See their eSIMs** — what's active, data remaining, and the QR code to install.
- **See past purchases.**
- **Follow install guides** — step-by-step with phone screenshots, iPhone and
  Android, QR and manual.

## 5. How a purchase works

```
pick a plan → sign in → server recalculates the price
   → Stripe's payment page → customer pays
   → Stripe phones our server back ("paid")
   → we buy the eSIM from Yesim → QR code emailed
```

Four decisions in that chain are deliberate, and each one exists because money is
at stake:

**The browser is never trusted with the price.** It sends only *which* plan and
*how many*. The server looks up the price again itself. Otherwise someone could
edit the page and buy a €50 plan for €1.

**The eSIM is only bought once Stripe confirms the money cleared**, through a
direct server-to-server message rather than the customer's browser. Close the tab
the instant you pay and the eSIM still arrives.

**Stripe's message is checked twice over.** It must carry a cryptographic
signature proving it's really from Stripe — anyone can find the address, and a
forged "order 123 is paid" would be a free eSIM. Then the amount and currency
Stripe actually collected are compared against what was ordered; a mismatch is
never fulfilled.

**Nothing is ever bought twice.** This is the hardest part, because Yesim offers
no way to say "only do this if you haven't already" — asking twice creates two
eSIMs and charges twice. So there are four separate guards: repeat messages from
Stripe are recognised and ignored, orders only move forward from the status
they're expected to be in, and every single card is written down the moment it
exists — so a crash halfway through an order for three never re-buys the first
two.

## 6. The failure that actually matters

Payment succeeds, then buying the eSIM from Yesim fails — Yesim is down, or the
plan was withdrawn mid-purchase.

The customer has paid and has nothing. The order is marked `failed`, which is the
one state that needs a human, and an alert is raised. Refunds are deliberately
**not** automatic: the published policy is request-and-review within 15 business
days, so a person issues them from the Stripe dashboard.

That makes the alert the only safety net — and today it only writes to the server
log. Wiring it to something a person actually watches is the single most important
piece of unfinished engineering in the project.

## 7. Some things the code does that aren't obvious

**QR codes hide themselves.** Signing in lets you see your eSIMs, but the
activation QR code is stripped out unless you've re-entered an emailed code
within the last 10 minutes. A stolen laptop with a live session gets the account,
not the eSIMs.

**Prices are converted at fixed rates, not live ones.** Deliberate — a live rate
could tick between the price on the plan card and the price on the payment page,
and the customer would see two different numbers.

**The Bahraini Dinar gets special handling.** It has three decimal places instead
of two, and Stripe rejects certain three-decimal amounts, so prices are rounded to
a step Stripe will accept rather than being silently altered at the till.

**Very cheap plans can't be sold.** Card fees cost more than the smallest plans
are worth, so Stripe refuses anything under roughly half a franc — 54 of the 1,520
plans. The customer gets a clear message rather than an error.

**The catalog survives Yesim going down.** The plan list is slow to fetch (16–35
seconds) so it's cached and refreshed quietly in the background every 30 minutes.
If a refresh fails, the last good copy keeps being served — for up to a week.

**Most pages are built in advance.** Around 176 pages are generated at build time,
so they're fast and cheap. Only accounts and checkout run live.

## 8. The tech stack

| Piece | What it is | Why it's here |
| --- | --- | --- |
| **Next.js 16** + **React 19** | The web framework | Builds most pages ahead of time for speed, runs live code for accounts and checkout |
| **TypeScript** | JavaScript with type checking | Catches whole categories of mistake before anything ships |
| **Tailwind CSS v4** | Styling | Design written alongside the markup |
| **Stripe** | Payments | Cards are typed on Stripe's page, never nowsim's — the lightest compliance tier there is |
| **Yesim Partner API** | eSIM supplier | Catalog, eSIMs, data balances, device list |
| **Upstash Redis** | Small fast store | Login codes, rate limits, orders, duplicate-payment guards |
| **Resend** | Email | Login codes and the eSIM QR emails |
| **Jose** | Encrypted session cookies | Proves who's signed in with no login database |
| **Zod** | Data validation | Nothing from Yesim, the browser, or even the server's own config is trusted before it's checked |
| **Vercel** | Hosting | Where it runs |

**No traditional database.** Deliberate. Customers and eSIMs live at Yesim; nowsim
keeps only short-lived things in Redis. Unpaid orders delete themselves after a
day. Less to run, and far less personal data to protect.

**Sessions are encrypted, not just signed** — the cookie's contents can't be read
even by whoever holds it. They idle out after 14 days, expire absolutely at 90,
and can be revoked on sign-out.

## 9. How the code is organised

| Folder | What's in it |
| --- | --- |
| `app/` | The pages — one folder per web address — plus checkout and the Stripe webhook |
| `app/actions/` | Things the browser can ask the server to do: sign in, start a payment |
| `components/` | Reusable interface pieces — buttons, dialogs, page sections |
| `lib/api/` | Talking to Yesim and translating its data into ours |
| `lib/auth/` | Sign-in: email codes, sessions, rate limits |
| `lib/payments/` | Stripe, order records, and buying the eSIM after payment |
| `lib/data/` | Fetching and caching the catalog, eSIMs and purchases |
| `lib/mail/` | The emails, including the QR code one |
| `public/` | Images, video, install screenshots |

## 10. Where it stands

Built and working: the catalog is live from Yesim, sign-in works end to end, and
Stripe checkout is wired up and functioning in test mode.

It has **not** taken a real payment yet. Most of what's left isn't code — legal
copy, marketing sign-off on review scores, Stripe's account review, missing
destination photography. The genuine engineering gaps are the alert channel
(§6), security headers, and search-engine basics: there's no `sitemap.ts` or
`robots.ts`, and no link-preview images, across all 176 pages.

- **[FIXME.md](FIXME.md)** — the current to-do list, and the file to trust.
- **[PAYMENT.md](PAYMENT.md)** — payments in full, plus the test checklist and
  go-live steps. Also written for non-developers.

*This file describes the project. It is not the task list.*
