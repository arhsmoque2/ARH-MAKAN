# ARH-MAKAN · Current Operational State & Verification Snapshot

> **Timestamp**: 2026-08-20T01:15:00+08:00  
> **Brand / Store**: Woodfire Kulim (`woodfire_kulim`)  
> **Active Verification Grade**: **A+ (100/100 pts)**  
> **Master Quality Gates**: 20 Verified Automated Gates Clean  
> **Edge Deployment Status**: Cloudflare Workers / Pages Ready  

---

## 1. Verified System Invariants

| Subsystem | State | Evidence & Verification Receipt |
|---|---|---|
| **Quality Gate Scorecard** | `100/100 (A+)` | Verified by `scripts/arh-quality-gate.mjs` (20 dimensions) |
| **Brand Baseline Integrity** | `LOCKED` | Verified by `scripts/check-brand-integrity.mjs` under `ADR-0015` |
| **Full Lifecycle Rehearsal** | `PASSED` | Verified by `scripts/rehearse.mjs` -> `.rehearsal-manifest.json` |
| **Living Knowledge Triad** | `10/10 DOCS` | Verified by `scripts/ci-asbuilt-doctor.mjs` |
| **Production Safety Preflight**| `CLEAN` | Verified by `scripts/ci-prod-safety-doctor.mjs` |
| **Menu DriftGuard** | `ZERO DRIFT` | Verified by `scripts/check-menu-schema.mjs` (68 items, 6 categories) |
| **DuitNow QR Payment Flow** | `ACTIVE` | Client ISO/IEC QR encoder + 15m countdown + proof upload |
| **Thermal Printing (ESC/POS)** | `READY` | 58mm customer receipts + 80mm station prep tickets verified |
| **3-Tier Realtime Sync** | `ACTIVE` | BroadcastChannel (<1ms) + localStorage + Firebase RTDB REST/SSE |

---

## 2. Active Operational Surfaces

1. **Customer Digital Store** (`/customer/?table=T05`):
   - Table Dine-In QR auto-binding (`T01`–`T20`).
   - Takeaway / Web Ordering toggle with customer phone & pickup scheduling.
   - Malaysian DuitNow QR with dynamic reference generation & instant test payment simulation.
   - Real-time 4-step order tracker (`Placed` -> `Cooking` -> `Ready` -> `Served`).
   - 5-Star post-dining review modal with compliment tags.
2. **Kitchen KDS** (`/kds/`):
   - Live station routing (`🥩 Grill`, `🍟 Fry`, `🥤 Bar`, `📋 Expo`).
   - Line-item bumping and Web Audio synthesized chimes.
   - SLA Aging indicators (Green <10m, Amber 10-20m, Red >20m).
3. **Cashier POS** (`/pos/`):
   - Quick table floor map, fast cash denomination buttons (`RM 10`, `RM 20`, `RM 50`, `RM 100`, `Exact`).
   - DuitNow proof verification drawer & ESC/POS receipt generation.
4. **Manager Operations Hub** (`/admin/`):
   - Shift gross sales, AOV, active tickets KPIs.
   - Instant 86 stock toggle across all surfaces in <5ms.
   - Batch Table QR generator & printable A4 tent cards.

---

## 3. Next Operational Actions

- Run `npm run deploy` or `node scripts/deploy-cloudflare.mjs` to push individual modules or unified suite to Cloudflare.
