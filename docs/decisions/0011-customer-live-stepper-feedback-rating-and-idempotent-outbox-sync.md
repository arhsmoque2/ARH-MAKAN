# ADR-0011: Customer Live Stepper, 5-Star Feedback, Idempotent Outbox Sync, and POS Split Tender

## Status
Accepted (2026-08-19)

## Context
Following comprehensive competitive evaluation of leading open-source F&B point-of-sale architectures (`Kasirku`, `ai-point-of-sale`, `QR-Menu`, `URY`, `BiteBase`, `Modern Cafe Billing`), we evaluated candidate capabilities against our existing architecture and identified high-value patterns to absorb into `ARH-MAKAN`.

## Decision
1. **Customer Live Order Stepper & Tracking HUD (`customer/` — from Kasirku)**:
   - Replaced static confirmation with a reactive live order tracking sheet (`Placed` $\rightarrow$ `Cooking` $\rightarrow$ `Ready` $\rightarrow$ `Served`).
   - Driven reactively via `BroadcastChannel` events whenever line items or orders are bumped on KDS.
2. **Post-Dining 5-Star Review & Feedback System (`customer/` & `devcon/` — from QR-Menu)**:
   - Interactive 1–5 star rating modal with 1-tap compliment chips (`🍔 Super Juicy Burgers`, `⚡ Fast Kitchen`, `🍟 Crispy Fries`, `🥤 Awesome Shakes`, `👨‍🍳 Friendly Staff`).
   - Telemetry fed live into DevCon's Customer Sentiment & Review feed.
3. **Idempotent Outbox Mutation Retry Queue (`shared/realtime-adapter.js` — from POS S360T)**:
   - Outbox queue in `localStorage` with UUID `idempotency_key` tracking.
   - Mutations queued during offline network states and automatically flushed upon reconnection without data loss or duplicate charges.
4. **Cashier POS Split-Tender & Shift Z-Report (`pos/` — from URY / Modern Cafe)**:
   - Multi-tender payment workflow allowing partial cash tender + partial DuitNow QR / Card balance on a single bill.
   - 1-click Shift Z-Report thermal printing formatted via ESC/POS engine.
5. **Kitchen Station Load Barometer & Tone Pitch Shift (`kds/` & `shared/audio-engine.js` — from URY / BiteBase)**:
   - Live header summary showing active un-bumped item load per station (`🔥 Grill: X · 🍟 Fry: Y · 🥤 Bar: Z`).
   - Station-specific synthesized audio chime frequencies (Grill warm tone, Fry snap, Bar chime).
6. **Bilingual Switcher (`customer/` — EN / BM)**:
   - 1-click header switcher between English and Bahasa Melayu.

## Consequences
- Elevates customer ordering UX with clear progress tracking and customer sentiment capture.
- Provides cashiers with full financial split-tender and end-of-shift reconciliation controls.
- Ensures zero data loss across network interruptions via idempotent queued mutations.
