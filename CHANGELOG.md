# Changelog — ARH-MAKAN

All notable changes to the ARH-MAKAN repository are documented in this file.

## [3.0.0] - 2026-08-20
### Added
- **Enterprise Multi-Dimensional Quality Gate & Scorecard Synthesis (`scripts/arh-quality-gate.mjs`)**: Adopted and tailored ARH-URUS 0-100 pts scorecard with letter grades (`A+` >= 95), step execution timers, and error logs across 20 verified dimensions.
- **Brand & Core Design System Baseline Lock (`scripts/check-brand-integrity.mjs`, `.brand-baseline.json`)**: SHA-256 content hashing of all 12 critical Woodfire brand assets, tokens, schemas, and primitives governed under ADR-0015.
- **Production Deployment Safety Preflight Doctor (`scripts/ci-prod-safety-doctor.mjs`)**: Automated inspection verifying zero leaked secrets/credentials across codebase, Cloudflare Worker security headers (nosniff, sameorigin, referrer-policy), and asset size budgets.
- **Full-Cycle Store Journey Rehearsal Gate (`scripts/rehearse.mjs`, `scripts/check-rehearsal-gate.mjs`, `.rehearsal-manifest.json`)**: Full-cycle simulation of customer ordering, custom modifiers, dynamic DuitNow QR, KDS station routing, POS cashier settlement, ESC/POS printing, and 5-star review logging.
- **Mandatory 10-File ARH Standard Documentation Suite (`ci-asbuilt-doctor.mjs`)**: Complete Living Knowledge Triad (`README.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, `CURRENT_STATE.md`, `GOTCHAS.md`, `RECIPES.md`, `HANDOFF.md`, `AGENTS.md`, `asbuilt.md`, `gaps-to-revisit.md`) plus ADR index validation.
- **Woodfire Standalone Full-Stack Storefront & Web Ordering (`customer/`)**:
  - Dual Order Mode: **🍽️ Dine-In (Table QR auto-binding)** & **🛍️ Takeaway / Pickup Web Ordering** with customer contact details and pickup scheduling.
  - In-App DuitNow QR with dynamic generation, animated 15:00 countdown timer, 1-tap copy for amount/reference, receipt attachment with compression, WhatsApp link, and 1-click Instant Demo test pay.
  - 4-step live kitchen tracking HUD and post-dining 5-star feedback collection.
- **Cloudflare Multi-Module Edge Deployment Engine (`scripts/deploy-cloudflare.mjs`)**: Independent `wrangler.jsonc` configs and workers for Customer (`woodfire-customer`), POS (`woodfire-pos`), KDS (`woodfire-kds`), Admin (`woodfire-admin`), and Suite (`arh-makan-suite`) enabling separate live site staging and testing.
- **ADR-0014 & ADR-0015**: Authored architecture decision records for URUS quality gates adoption and Woodfire standalone full-stack architecture.

## [2.8.0] - 2026-08-19
### Added
- **Cloud Agent Independence & Zero-Touch Session Bootstrap (`scripts/bootstrap-agent-session.mjs`, `.claude/hooks/`, `.agents/hooks/`)**: Automated script warming dependencies, detecting pre-baked Chromium paths across environments, checking cloud infrastructure readiness, and running baseline health sanity in <10s.
- **E2E Interactive Runtime Smoke Gate (`scripts/test-e2e-smoke.mjs` — Gate 13)**: Playwright runtime clicker traversing all 5 surfaces, triggering interactive workflows (DuitNow checkout, POS verification, KDS bumps, Admin 86 stock, DevCon Scenario Lab injections), and asserting 0 unhandled exceptions or console errors.
- **Docs Freshness & Living Knowledge Triad Linter (`scripts/check-docs-freshness.mjs` — Gate 14)**: Automated checker enforcing CHANGELOG, ADRs, and README synchronization.
- **Autonomous PR Review & Architecture Sign-Off Gate (`.github/workflows/agent-review-gate.yml`)**: Automated PR workflow running full 14-gate verification and posting review summaries.
- **Standing Health Audit Sentinel (`.github/workflows/audit-sentinel.yml`)**: Weekly cron workflow monitoring system integrity and environmental drift continuously.
- **14-Gate CI Doctor Suite (`scripts/arh-ci-doctor.mjs`)**: Upgraded quality harness with all 14 gates.
- **ADR-0013**: Documented architecture decisions in `docs/decisions/0013-cloud-agent-independence-e2e-smoke-and-sentinel-automation.md`.

## [2.7.0] - 2026-08-19
### Added
- **2-Way Malaysian DuitNow QR & Real-Time Cashier Verification Handshake (`shared/realtime-adapter.js`, `customer/`, `pos/`, `admin/`, `devcon/`)**:
  - **Merchant Payment Profile Configurator (`admin/` & `devcon/`)**: Store owner can configure Bank Name, Account Holder Name, Account Number/DuitNow ID, WhatsApp Number, and upload custom laminated DuitNow QR standee image.
  - **Client-Side High-Speed Canvas Image Compressor (`shared/image-compressor.js` — from digital-menu & shutterorder)**: Compresses smartphone camera photos & screenshots down to ~60–80KB WebP/JPEG in <30ms before saving to local state.
  - **Customer DuitNow Checkout Modal (`customer/`)**: Displays store DuitNow QR, payable amount with 1-tap copy, reference ID with 1-tap copy, receipt screenshot uploader, and 1-tap WhatsApp proof fallback button (`wa.me/?text=...` from lineweb).
  - **Cashier POS Real-Time Verification Drawer (`pos/`)**: Glowing topbar verification badge with notification chime, receipt thumbnail viewer with zoom, 1-tap `✅ Verify & Fire to KDS`, and auto-print thermal receipt.
  - **KDS Kitchen Order Gating (`kds/`)**: Automatically gates unverified DuitNow orders until cashier confirmation.
- **ADR-0012**: Authored architecture decision record for DuitNow QR proof & verification handshake.

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
