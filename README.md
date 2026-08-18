# ARH-MAKAN · Commercial Full-Stack F&B Operating Suite

> Zero-build, luxury multi-surface F&B web application suite engineered for Woodfire Kulim. Features customer digital ordering with dynamic QR generation, real-time Kitchen Display System (KDS), high-speed cashier POS with ESC/POS thermal receipt engine, manager operations HUD, and live multi-surface review sandbox.

---

## 🏛️ Operational Surfaces & Architecture

```text
arh-makan/
├── index.html           # Suite Surface Directory & Quick Launchpad
├── test-sandbox.html    # Quad-Split Multi-Surface Review Sandbox
├── customer/            # Customer Mobile Menu (Table QR binding, modifiers, split-bill, service calls)
├── kds/                 # Kitchen Display System (Web Audio chimes, station routing, Expo view, 80mm prep tickets)
├── pos/                 # Cashier Touch Register (Fast cash denomination pad, 58mm/80mm ESC/POS receipts, table floor map)
├── admin/               # Manager Hub (Real-time revenue KPIs, 86/sold-out toggles, live batch Table QR exporter)
├── shared/              # 3-Tier Realtime State Engine, ISO/IEC QR Generator, ESC/POS Formatter, Flight Recorder
├── showroom/            # Interactive Multi-Surface Showroom in simulated device viewports
├── evidence/            # Test receipts, telemetry samples, and offline benchmark snapshots
└── scripts/             # 7-Gate CI Doctor, Matrix Scannability, and Bridge Unit Test Suites
```

---

## ⚡ Tech Stack & Capabilities

| Component | Technology | Operational Status |
|---|---|---|
| **Architecture** | Pure Vanilla JS (ESM), HTML5, CSS3 Tokens | **Ready / Production** |
| **State Synchronization** | 3-Tier Hybrid (BroadcastChannel $\rightarrow$ localStorage $\rightarrow$ Firebase RTDB REST/SSE) | **Ready / Production** |
| **Cloud Database** | Firebase RTDB REST / SSE (Optional Remote Tier) | **Configured / Dynamic Probe** |
| **Edge Hosting** | Cloudflare Workers / Pages (`wrangler.jsonc`) | **Ready / Verified** |
| **QR Code Engine** | Pure client-side ISO/IEC 18004 Matrix Encoder (<12KB ESM) | **Ready / Tested** |
| **Thermal Printing** | 58mm / 80mm ESC/POS Formatter (Customer receipts & kitchen prep tickets) | **Ready / Production** |
| **Telemetry & QA** | Client Flight Recorder (`flight-recorder.js`) & Living Test Sandbox | **Ready / Production** |

---

## 🚀 Live Operational Capabilities (Ready to Use)

### 1. 📱 Customer Digital Dine-In (`/customer/?table=T05`)
- **Table Auto-Binding**: URL parameter `?table=Txx` binds orders directly to the physical table without login friction.
- **Custom Modifiers**: Toasted brioche/potato buns, spice levels, and add-ons with dynamic subtotal recalculation.
- **Service Request Hub**: 1-tap waiter assistance, water refills, cutlery requests, and billing calls alerting KDS/POS.
- **Split-Bill Calculator**: Built-in split calculator with SST (6%) breakdown.

### 2. 🥩 Kitchen Display System (`/kds/`)
- **Live Station Filtering**: Filter active tickets across `🥩 Grill`, `🍟 Fry`, and `🥤 Bar` with dynamic item count badges.
- **Expediter (Expo) Aggregated View**: Aggregates un-bumped items across all active tickets with table counts.
- **Visual SLA Aging Alerts**: Green ($<10\text{m}$), Amber ($10\text{--}20\text{m}$), Red ($>20\text{m}$) header alerts.
- **Line-Item Bumping**: Independent checkoff checkboxes per item with Web Audio feedback.
- **80mm Kitchen Prep Printing**: 1-click thermal kitchen prep slip generation.

### 3. 💻 Cashier POS Terminal (`/pos/`)
- **Touch-Grid Ordering**: Category rail with instant modifier selection.
- **Fast Cash Denomination Pad**: `Exact`, `RM 20`, `RM 50`, `RM 100` one-touch cash change calculator.
- **Table Floor Matrix**: Live visual occupancy map (`vacant`, `occupied`, `ready`, `billing`).
- **58mm / 80mm ESC/POS Receipts**: Formatted thermal receipt printing with itemized breakdown, tax ID, and QR verification.

### 4. 📊 Owner Admin Operations (`/admin/`)
- **Real-Time Revenue KPIs**: Live sales gross, active table count, completed order volume.
- **Dynamic Table QR Generator**: ISO/IEC 18004 QR generator with PNG download and 1-click A4 Table Tent Card print layout (`window.printAllTentCards()`).
- **86 / Sold-Out Toggles**: Instant toggle for out-of-stock items propagating across all surfaces in $<5\text{ms}$.

### 5. 🧪 Living Test Sandbox (`/test-sandbox.html`)
- **Quad-Split Interactive Review**: Live side-by-side execution of Customer, KDS, POS, and Admin in a single browser window.
- **Scenario Triggers**: 1-click injection of 4-order Rush Hour waves, 86 inventory toggles, and waiter call bells.
- **Agent Flight Recorder Export**: 1-click export of structured JSONL error logs with action trajectories and stack traces.

---

## 🩺 Verification & Quality Gates

Run the comprehensive 9-gate CI Doctor suite:
```bash
node scripts/arh-ci-doctor.mjs
```

1. **Static Integrity & Schema Validation** (`scripts/check.mjs`)
2. **Menu Config DriftGuard & Station Invariants** (`scripts/check-menu-schema.mjs`)
3. **ESM JavaScript Syntax & Linter Gate** (`scripts/lint.mjs`)
4. **HTML5 & A11y Accessibility Verification** (`scripts/verify-a11y-html.mjs`)
5. **Performance Budget & Asset Profiler** (`scripts/profile-assets.mjs`)
6. **Showroom Bridge & Station-Routing Suite** (`scripts/test-showroom-bridge.mjs` — 19 tests)
7. **QR Code Matrix Scannability & Density Gate** (`scripts/test-qr-verify.mjs` — 3 matrix tests)
8. **Cloud Infrastructure & Config Preflight** (`scripts/verify-infra-preflight.mjs`)
9. **Cloudflare Worker Runtime & Edge Fetch Suite** (`scripts/test-worker-runtime.mjs`)
