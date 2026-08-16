# ARH-MAKAN · Premium Full-Stack F&B Operating Suite

> Commercial-grade, luxury full-stack F&B web application spanning Customer Dine-In, Kitchen Display System (KDS), High-Speed Counter POS, Owner Operations, and Interactive Showroom.

---

## 🏛️ Architecture & Surfaces

```text
arh-makan/
├── customer/        # Luxury Dine-In Menu + Table QR auto-binding + Service calls + Split-bill
├── kds/             # Kitchen Display System with Web Audio chime, ticket aging (<10m, 10-20m, >20m) & station routing
├── pos/             # Counter POS with touch category rail, modifier modal, table floor plan & ESC/POS receipt printing
├── admin/           # Owner Hub (Live sales analytics, Table QR exporter, 86/out-of-stock toggles, staff PINs)
├── shared/          # Shared Realtime Sync adapter (Firebase RTDB + LocalStorage fallback), CSS luxury tokens
├── showroom/        # Multi-surface live interactive switcher & tier comparison
└── docs/            # Architecture decision records, proposals, and lifecycle event flows
```

---

## 🎯 Actors & Flow of Events

1. **Customer** (`/customer`, `?table=Txx`):
   - Table QR auto-binding, modifier selection, 1-tap service requests (*Waiter / Water / Cutlery / Bill*), live order tracker, split-bill calculator.
2. **Kitchen Chef & Staff** (`/kds`):
   - Real-time Web Audio ping on new tickets, visual aging color alerts, station routing (*Grill / Fry / Bar / Expo*), 1-tap bump bar.
3. **Cashier / POS Staff** (`/pos`):
   - Rapid touch-grid order entry, table floor layout, multi-tender split payments (Cash change, DuitNow QR, Card), 58mm/80mm thermal receipt printing.
4. **Store Owner & Manager** (`/admin`):
   - Real-time revenue KPIs, batch Table QR export, instant 86/sold-out item toggle, staff PIN access control.
5. **Platform Operator & CLI Agent**:
   - Zero-build edge deployment (Cloudflare Pages/Workers + Firebase RTDB), deterministic schemas, Playwright pixel rehearsal.

---

## 📋 Implementation Roadmap

See detailed 6-phase build plan in [PLAN.md](PLAN.md) and full architecture proposal in [docs/proposals/2026-08-17-premium-fullstack-fnb-architecture-and-build-plan.md](docs/proposals/2026-08-17-premium-fullstack-fnb-architecture-and-build-plan.md).
