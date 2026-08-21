# ARH-MAKAN · System Architecture & Technical Specification

> **Subsystem**: Commercial F&B Multi-Surface Operating System Suite (Woodfire Kulim)  
> **Runtime**: Zero-Build Vanilla JavaScript (ESM), HTML5 Living DOM, CSS3 Design Tokens  
> **Edge Target**: Cloudflare Workers / Cloudflare Pages  
> **State Engine**: 3-Tier Hybrid Synchronization (BroadcastChannel $\rightarrow$ localStorage $\rightarrow$ Firebase RTDB REST/SSE)  
> **Document Status**: Active / Canonical

---

## 1. High-Level System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            ARH-MAKAN OPERATING SUITE                             │
└────────┬───────────────────┬───────────────────┬───────────────────┬─────────────┘
         │                   │                   │                   │
         ▼                   ▼                   ▼                   ▼
 ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
 │   Customer    │   │  Kitchen KDS  │   │  Cashier POS  │   │  Manager Hub  │
 │  Dine-In/Web  │   │ Station Route │   │ Quick Cash &  │   │ Shift KPIs &  │
 │  Ordering QR  │   │ Aging Alerts  │   │ ESC/POS Print │   │ 86 Stock Lock │
 └───────┬───────┘   └───────┬───────┘   └───────┬───────┘   └───────┬───────┘
         │                   │                   │                   │
         └───────────────────┼───────────────────┴───────────────────┘
                             ▼
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                     3-TIER REALTIME STATE SYNCHRONIZATION                       │
 │  Tier 1: Web BroadcastChannel (<1ms Same-Origin Instant Inter-Tab Messaging)    │
 │  Tier 2: DOM localStorage Fallback & Persistent Storage (Cross-Tab & Reloads)   │
 │  Tier 3: Firebase Realtime Database REST/SSE (Multi-Device Remote Outbox Sync)  │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Surface Actor Boundaries & Responsibilities

| Surface | Target Viewport | Key Responsibilities | Primary Data Outputs |
|---|---|---|---|
| **Customer Digital Menu** (`/customer/`) | Mobile (390×844) | Table auto-binding (`?table=Txx`), modifier selection, takeaway web ordering, DuitNow QR dynamic generation, 4-step live kitchen tracker, 5-star review submission | `orders` (`pending` / `awaiting_verification`), `service_requests`, `customer_reviews` |
| **Kitchen Display System** (`/kds/`) | Landscape Tablet / Monitor (1024×768) | Station-based ticket routing (`🥩 Grill`, `🍟 Fry`, `🥤 Bar`), Expo aggregation, Web Audio chimes, visual SLA aging (<10m, 10-20m, >20m), 80mm prep printing | `orders` state updates (`is_bumped`, `ready`, `served`) |
| **Cashier Touch Register** (`/pos/`) | Touch Screen / Desktop (1280×800) | Fast-order entry, table floor occupancy map, fast cash change pad (`RM 10`, `RM 20`, `RM 50`, `RM 100`, `Exact`), DuitNow proof verification, 58mm/80mm ESC/POS receipts | `orders` settlement (`paid`), table status |
| **Manager Operations Hub** (`/admin/`) | Desktop / Tablet (1280×800) | Live shift gross sales, AOV, active tickets, 86 / out-of-stock toggles, ISO/IEC Table QR batch generator & A4 printable tent cards, payment settings | `sold_out_items`, `merchant_config`, `table_qrs` |
| **Developer Console** (`/devcon/`) | Engineer / Diagnostics | State inspection, synthetic rush-hour wave injector, audio diagnostics, telemetry log export | Simulator state, debug traces |

---

## 3. Realtime Hybrid State Synchronization Protocol

1. **Tier 1 (BroadcastChannel)**: Uses standard browser `new BroadcastChannel('arh_makan_channel')` for instantaneous sub-millisecond inter-tab and iframe communication.
2. **Tier 2 (LocalStorage with StorageEvent)**: Persists `arh_orders`, `arh_sold_out`, `arh_service_requests`, and `arh_customer_reviews`. Listens for cross-tab mutations.
3. **Tier 3 (Firebase RTDB REST/SSE Adapter)**:
   - Dynamic non-blocking runtime probe via `/api/config`.
   - Idempotent write outbox queue with replay on network reconnection.
   - Server-Sent Events (SSE) stream listener for remote device updates.

---

## 4. In-App DuitNow QR Payment & Verification Lifecycle

```text
[Customer App]
   │ Selects Items & Modifiers (Subtotal + 6% SST)
   │ Generates Dynamic DuitNow QR: DUITNOW|552188329910|Total|RefCode
   │ Starts 15:00 Live Countdown Timer
   │ Attaches Compressed Bank Transfer Slip (Optional) OR Direct Instant Pay
   ▼
[Broadcast to POS & KDS Hub]
   │ State: status = 'awaiting_verification', verification_status = 'pending'
   ▼
[POS Cashier Screen]
   │ Visual Notification Badge: "🔔 1 Pending Verification"
   │ Cashier inspects receipt slip / bank notification
   │ 1-Click "Approve Payment" -> transitions order to status = 'pending' (Cooking)
   ▼
[KDS Screen]
   │ Chime rings, ticket appears on Grill / Fry / Bar stations
   ▼
[Customer App Tracker HUD]
   │ Transitions from "Verifying ⏳" -> "Cooking 🍳" -> "Ready 🔔" -> "Served 🍽️"
```

---

## 5. Thermal Printing Subsystem (ESC/POS)

- **Pure Client-side Generator**: `shared/escpos-formatter.js` formats both 58mm and 80mm ESC/POS byte commands.
- **Kitchen Slips**: Aggregated by station (`🥩 Grill`, `🍟 Fry`, `🥤 Bar`) with bold modifier callouts and order timestamp.
- **Customer Receipts**: Header branding, itemized order lines, 6% SST breakdown, DuitNow payment reference, and ISO/IEC QR verification stamp.

---

## 6. Cloudflare Edge Architecture & Multi-Module Deployments

- **Multi-Module Topology**:
  - `arh-makan-suite` (Root Worker & Static Assets): Unified multi-surface portal.
  - `woodfire-customer`: Dedicated standalone customer ordering portal.
  - `woodfire-pos`: Dedicated cashier terminal portal.
  - `woodfire-kds`: Dedicated kitchen display portal.
  - `woodfire-admin`: Dedicated manager operations portal.
- **Edge Security Invariants**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - Zero live secrets in runtime bundles.
