# ADR-0002: Multi-Surface Actor Boundaries and Authority Matrix

## Status
Accepted (2026-08-17)

## Context
A single monolithic application attempting to serve customers, kitchen chefs, cashiers, and restaurant owners in one view creates role confusion, security vulnerabilities, and bloated payloads.

## Decision
We enforce strict architectural and permission boundaries across 4 core operational surfaces:

1. **Customer Surface (`/customer`)**:
   - Authority: Tokenized table session (`?table=Txx&s=xxx`). Can append items to active table cart, emit 1-tap service calls, view live prep tracker, calculate split-bill.
   - Guardrail: Read-only pricing; cannot edit submitted tickets or view other tables' orders.
2. **Kitchen Surface (`/kds`)**:
   - Authority: View live incoming tickets, filter by station (`Grill`, `Fry`, `Bar`, `Expo`), bump item prep state (`queued ➔ cooking ➔ ready`).
   - Guardrail: Cannot modify billing, cancel orders without manager override, or adjust inventory prices.
3. **Point of Sale Surface (`/pos`)**:
   - Authority: High-speed counter order entry, table floor status matrix, multi-tender settlement (`Cash`, `DuitNow QR`, `Card`), thermal receipt dispatch.
   - Guardrail: Voids and discounts >20% require Manager PIN.
4. **Owner / Operations Surface (`/admin`)**:
   - Authority: Shift KPI analytics, 86/out-of-stock live toggles, SVG Table QR code generation, staff PIN administration.
   - Guardrail: Governed by Master Owner PIN.

## Consequences
- Clean separation of concerns with optimized touch targets per device (Mobile for Customer, Landscape Tablet/Monitor for KDS, POS Terminal for Cashier, Desktop for Admin).
