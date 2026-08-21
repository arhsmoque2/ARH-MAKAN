# ARH-MAKAN · Staging State & Pre-Production Checks

> Written after the real-money DuitNow test drive of PR #10/#11 (customer,
> KDS, POS, admin surfaces opened simultaneously, real bank QR scanned,
> real transfer made). Captures what "staging" actually means for this
> app right now, and what's worth checking before it's put in front of a
> real store, real staff, and real customers.
>
> These are **checks, not gates** — things to look at and decide on, not
> a list this app is required to satisfy before anyone can touch it. If a
> change is requested that contradicts an item here, the item is probably
> the thing that needs updating, not the request. Treat this file the way
> you'd treat a pre-flight checklist someone hands you before their first
> flight, not a certification the plane needs to pass.

---

## 1. What "staging" means here right now

There's no separate staging *environment* — no separate config, no
feature-flag layer, no sandboxed payment rail. "Staging" currently means:
the same code, the same Cloudflare Workers deploy pipeline, and the same
Firebase RTDB root (`woodfire_kulim`) that production would use, just
being exercised deliberately before real customers show up. Worth keeping
in mind because it means:

- **Payments are real.** The DuitNow QR flow moves real money the moment
  a real bank-issued QR image is configured (`admin.js → qr_image_url`)
  and a customer scans and pays it. There's no test-mode payment rail —
  order creation is entirely client-side (`hub.createOrder`), so "did the
  order get created" and "did money actually move" are two separate
  questions that only a human (the cashier verifying the DuitNow proof in
  `pos/`) currently connects.
- **All four surfaces are open by URL, with no login.** `customer/`,
  `kds/`, `pos/`, and `admin/` have no authentication, no PIN, no
  role check anywhere in the code — confirmed by grepping all four
  surfaces and `shared/realtime-adapter.js` for auth/permission logic
  (none found). Whoever has a surface's URL has full read/write as that
  role. This is exactly what makes an end-to-end demo possible without
  provisioning logins for the owner, kitchen, and cashier separately —
  and also exactly what removes any access control once real customers
  are involved.
- **Demo auto-pay is opt-in per link.** The "⚡ Instant Test Pay (Demo)"
  button (auto-approves an order with no payment) is hidden unless the
  page is loaded with `?demo=1` (added in PR #11). A link handed to a
  real customer without that param can't trigger it, and the handler
  itself refuses to run without the flag even if invoked directly.
- **Data is live and shared.** Test orders placed during this rehearsal
  land in the same `woodfire_kulim` RTDB root and same `localStorage`
  namespaces that real orders would use. Nothing currently distinguishes
  "test order" from "real order" in the data model.

---

## 2. Checks worth running before real customers/staff depend on this

Each of these is phrased as something to look at, not something to
enforce. Some may already be fine for this store's actual context (a
single physically-controlled premises, staff on-site, owner comfortable
with the tradeoff) — the point is to have looked, not to have said yes
to all of them.

- **Access control.** Is it still true that `admin/`, `pos/`, and `kds/`
  have no login? If so — is that acceptable given how the URLs will
  actually be distributed (internal wifi only vs. anything indexable or
  guessable)? A PIN gate per surface is the lightest option if the
  answer is no; a full login is heavier than this app currently needs
  unless multi-location or remote staff access is planned.
- **Payment verification stays human.** Does `pos/pos.js`'s pending-orders
  filter (`status === 'awaiting_verification'`) still require a cashier
  to look at the uploaded receipt/proof and manually approve before an
  order proceeds? That manual check is currently the only thing standing
  between "customer says they paid" and "kitchen starts cooking" for the
  QR flow — worth confirming it hasn't been bypassed anywhere.
- **`?demo=1` never reaches a real customer link.** Whatever generates
  the table QR codes / takeaway links for actual use — does it ever
  append `?demo=1`? Worth a quick check of `admin.js`'s QR/link generator
  before print.
- **Test data vs. real data.** Is there a plan to purge or otherwise
  separate the orders/reviews/service-requests created during this
  rehearsal from what accumulates once real customers start ordering?
  (Purging Firebase RTDB and per-device `localStorage`/`sessionStorage`
  was intentionally left out of PR #11 — flagged as a separate ask.)
- **Menu accuracy.** Does `shared/mock-data/menu.json` reflect the
  store's actual current menu and prices? It's driving what customers
  see and get charged — worth a real menu diff, not just a code review.
- **Tax/service-charge rate.** `customer.js`'s `computeCartTotals()`
  hardcodes a 6% tax. Is 6% the correct SST/service-charge rate for this
  venue and order type, and is it meant to be a flat constant rather
  than configurable per item/category?
- **Abuse/rate limiting.** Order creation has no throttle or dedup check
  — is that fine for a single physical venue where a customer scans a
  table QR in person, or does the takeaway/web-ordering link being
  shareable change that calculus?
- **Backups.** Is there any export/backup of the Firebase RTDB data, or
  does losing that database mean losing order history entirely?
- **Secrets hygiene.** `GOTCHAS.md` #6 already covers this — worth
  reconfirming `wrangler.jsonc`/`wrangler.toml` still have no plaintext
  credentials before any public repo access is granted.
- **QR code targets.** Do the printed/generated table QR codes and
  takeaway links point at the final production URL, not a preview/staging
  deploy URL that might not stay up?

---

## 3. Not covered here

This file is about the app's own gating and data hygiene. It doesn't
cover business-side production concerns (business registration for
receipts, actual bank account verification, staff training, physical QR
placement) — those are the owner's/operator's calls, not something the
code can check for itself.
