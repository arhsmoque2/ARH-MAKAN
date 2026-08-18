# Changelog — ARH-MAKAN

All notable changes to the ARH-MAKAN repository are documented in this file.

## [2.6.0] - 2026-08-19
### Added
- **Customer Live Order Stepper & Tracking HUD (`customer/` — from Kasirku)**: Reactive bottom status stepper (`Placed` $\rightarrow$ `Cooking` $\rightarrow$ `Ready` $\rightarrow$ `Served`) updating automatically when kitchen bumps items.
- **Post-Dining 5-Star Rating & Sentiment System (`customer/` & `devcon/` — from QR-Menu)**: 1-tap rating modal with compliment chips feeding live sentiment metrics to DevCon.
- **Idempotent Outbox Mutation Retry Queue (`shared/realtime-adapter.js` — from POS S360T)**: Offline transaction queuing with UUID idempotency keys and automatic reconnect flushing.
- **Cashier POS Split-Tender Payment (`pos/` — from URY / Modern Cafe)**: Multi-tender payment workflow allowing partial cash tender + partial DuitNow QR / Card balance on a single bill.
- **Shift Z-Report Printout (`pos/`)**: 1-click thermal printing of daily register sales, float balance, and tax reconciliation.
- **KDS Station Load Barometer & Distinct Audio Chimes (`kds/` & `shared/audio-engine.js` — from URY / BiteBase)**: Real-time item load breakdown per station with station-specific audio synthesized frequencies.
- **Bilingual English / Bahasa Melayu Switcher (`customer/`)**: 1-click UI language switcher.
- **ADR-0011**: Documented architecture decisions in `docs/decisions/0011-customer-live-stepper-feedback-rating-and-idempotent-outbox-sync.md`.

## [2.5.0] - 2026-08-18
### Added
- **Static Design Token & Consistency Linter (`scripts/check-design-tokens.mjs` — Gate 10)**: Automated AST/regex validator enforcing canonical CSS tokens (`var(--gold-*)`, `var(--bg-*)`, `var(--text-*)`, `var(--font-*)`) and banning forbidden tropes (purple-on-dark, neon outlines, untracked typography).
- **Multi-Viewport UI Integrity & Layout Overflow Scanner (`scripts/check-ui-integrity.mjs` — Gate 11)**: Automated Playwright scanner testing Mobile (390px), Tablet (768px), and Desktop (1280px) for horizontal page scrollbar overflow (`[page-overflow-x]`), broken assets, and console errors.
- **Visual Regression Testing & Baseline Diff Engine (`scripts/test-visual-regression.mjs` — Gate 12)**: Playwright pixel-perfect snapshot engine verifying 6 core surfaces against committed golden baselines (`evidence/visual-baselines/`).
- **12-Gate CI Doctor Suite (`scripts/arh-ci-doctor.mjs`)**: Upgraded central quality harness with all 12 validation gates.
- **ADR-0010**: Documented architecture decisions in `docs/decisions/0010-design-token-linters-layout-integrity-and-visual-regression-gates.md`.

### Fixed
- Replaced untracked `font-family: monospace;` with `var(--font-mono)` in `pos/pos.css`.
- Fixed mobile and tablet horizontal page overflow in `kds/kds.css` and `pos/pos.css`.

## [2.4.0] - 2026-08-18
### Added
- **Developer Console (DevCon) Surface (`/devcon/`)**: Dedicated operator & telemetry HUD with permanent In-App Sales & Velocity Analytics, Beacon-style Error Telemetry, 3-Tier State Engine Inspector, and synthetic Scenario Lab.
- **In-App Sales Analytics & Admin Toggle Gate**: High-density revenue, Average Order Value (AOV), best-seller leaderboard, and peak dining heatmaps, with master visibility toggle for `/admin/` controlled from DevCon.
- **Table SLA Attention Aging Timers (`pos/`)**: Dynamic visual badges on table floor map indicating order aging (>30m attention, >60m overdue) absorbed from URY protocol.
- **Table Transfer Protocol (`pos/`)**: 1-click modal to relocate open table orders to another physical table without loss of state.
- **Daily Shift Cash Float Reconciliation (`pos/`)**: Opening float tracking and closing cash drawer settlement calculator with Over/Short balance reporting.
- **Operator Plane Desktop DevCon Scaffold (`operator-plane/desktop-devcon/`)**: Cross-platform desktop shell scaffold powered by Tauri v2.

## [2.3.0] - 2026-08-18
### Added
- **Full Woodfire Canonical Menu Integration (`data/menu.json`)**: Merged all 33 canonical items across 6 categories (Burgers, Smoked Platters, Fries, Chicken, Shakes, Upgrades) and 16 Woodfire Addons.
- **Dynamic Radio & Single/Multiple Modifier Engine**: Real-time price delta calculation (`Add to Order — RM XX.XX`) supporting meat choices (Beef, Chicken, Mix), spice levels, doneness, and bun selections.
- **Menu Config DriftGuard (`scripts/check-menu-schema.mjs`)**: Automated CI validation checking category mapping, price validity, modifier schema integrity, and KDS station invariants.
- **Enhanced 9-Gate CI Doctor Suite**: Integrated Menu DriftGuard & Cloudflare Edge Worker runtime verification into the unified test harness.
- **Live Menu Card Emoji & Photography**: Dynamic emoji and image fallbacks across all customer ordering cards.

## [2.2.0] - 2026-08-17
### Added
- **Zero-Dependency Dynamic QR Engine (`shared/qr-generator.js`)**: Pure client-side ISO/IEC 18004 compliant QR matrix encoder (<12KB ESM) supporting dynamic table URL encoding, 1-click PNG export, and A4 printable Table Tent Card batch layout.
- **Expediter (Expo) Summary View (`kds/`)**: Aggregates all active un-bumped items across the floor with per-table counts.
- **ESC/POS Thermal Formatter (`shared/escpos-formatter.js`)**: 58mm/80mm formatted thermal receipt and kitchen prep ticket generator.
- **Fast Cash Denomination Pad (`pos/`)**: Instant change calculation pad (`Exact`, `RM 20`, `RM 50`, `RM 100`).
- **Showroom Bridge Station-Routing Engine (`shared/showroom-bridge.js`)**: Automatic category mapping and regex keyword fallback preventing station fallthrough.
- **Client-Side Flight Recorder (`shared/flight-recorder.js`)**: 2KB zero-dependency telemetry engine capturing user click trajectories, network payloads, and unhandled JS exceptions into JSONL.
- **Living Multi-Surface Test Sandbox (`test-sandbox.html`)**: Quad-split interactive dashboard with 1-click scenario injectors (Rush Hour, 86 Sold Out, Waiter calls).
- **Portable 7-Gate CI Doctor (`scripts/arh-ci-doctor.mjs`)**: Self-contained multi-gate quality and preflight suite.

### Fixed
- Station routing fallthrough for Woodfire menu categories (`fries`, `sides`, `upgrades`, `starters` -> `fry`).
- Double table prefix formatting in KDS Expo view (`TT05` -> `T05`).
- Honest sync status HUD gating preventing false-positive cloud badges when offline.
