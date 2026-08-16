# ADR-0007: Dine-In Table QR Binding and Live Service Call Protocol

## Status
Accepted (2026-08-17)

## Context
Standard restaurant QR menus often drop table context when customers reload the page, or fail to provide a channel for physical service requests (e.g. requesting water, extra cutlery, or the waiter) without waving hands at busy floor staff.

## Decision
1. **URL & Session Table Auto-Binding**:
   - Scanning table QR opens `/customer/?table=T05`. The table identifier is permanently saved in `sessionStorage` and `localStorage`, persisting across page refreshes and menu category switches.
2. **1-Tap Service Request Protocol** (absorbed from `ChefOS/ServiceRequests.jsx`):
   - A floating "Service" button allows guests to send instant alerts:
     - 🛎️ *Call Waiter*
     - 💧 *Request Water / Glasses*
     - 🍴 *Request Cutlery / Condiments*
     - 🧾 *Request Final Bill*
   - Service requests emit an urgent notification across both KDS and POS headers until acknowledged by staff.
3. **Allergen & Dietary Matrix**:
   - Filter pills allow customers to narrow menu items instantly by dietary preferences (*Halal*, *Keto*, *Nut-Free*, *Vegetarian*, *Gluten-Free*).

## Consequences
- Frictionless guest experience, faster waiter response time, zero lost table associations, and clear allergen transparency.
