# Implementation Plan: ARH-MAKAN Suite

**Repo:** `arhsmoque2/ARH-MAKAN`  
**Path:** `D:\ARH-GITHUB\arhsmoque2\ARH-MAKAN`  
**Board Project ID:** `proj-ab13be88`  
**Goal:** Complete, production-grade F&B operating webapp for Dine-In, Kitchen KDS, Counter POS, Owner Ops, and Multi-Surface Showroom.

---

## 🏗️ 6-Phase Build Breakdown

### Phase 1: Core Foundation & Shared Realtime Adapter
- [ ] Implement `shared/realtime-adapter.js` (Firebase RTDB + LocalStorage fallback).
- [ ] Standardize Order, Table, and Service Request schema in `shared/schema.json`.
- [ ] Define luxury CSS design tokens (`shared/theme.css`) with Playfair/DM Sans, dark noir aesthetic, and gold/warm accents.

### Phase 2: Kitchen Display System (KDS Surface)
- [ ] Implement `kds/index.html` and `kds/kds.js` with synthesized Web Audio chimes.
- [ ] Build ticket aging visual algorithm (Green `< 10m`, Yellow `10-20m`, Pulsing Red `> 20m`).
- [ ] Add station filtering (`Grill`, `Fry`, `Bar`, `Expo`) and item/ticket bump bar.

### Phase 3: High-Speed Counter POS Surface
- [ ] Implement `pos/index.html` and `pos/pos.js` with category rail + fast item grid.
- [ ] Build table floor plan status matrix (`Vacant`, `Occupied`, `Bill Requested`).
- [ ] Implement multi-tender & split-bill calculator (Cash change, DuitNow QR, Card).
- [ ] Add 58mm/80mm ESC/POS thermal receipt formatting and browser print dispatch.

### Phase 4: Customer Dine-In & Service Requests
- [ ] Implement `customer/index.html` and `customer/app.js` with table QR auto-binding (`?table=T05`).
- [ ] Add 1-tap floating Service Request sheet (*"Call Waiter"*, *"Water/Glasses"*, *"Cutlery"*, *"Request Bill"*).
- [ ] Embed dietary & allergen filter chips (*Halal*, *Keto*, *Nut-Free*, *Vegetarian*).
- [ ] Build live order tracking HUD with prep status milestones.

### Phase 5: Owner Console & Multi-Surface Showroom
- [ ] Implement `admin/index.html` with live sales analytics, 86/sold-out item toggle, and SVG Table QR exporter.
- [ ] Build `showroom/index.html` multi-surface previewer enabling side-by-side switching of Customer, KDS, POS, and Admin.

### Phase 6: Flow-of-Events Verification & O&M Manual
- [ ] Write Playwright end-to-end visual tests verifying rendered pixels across all actor workflows.
- [ ] Generate O&M manual report via `arh-om-manual`.
