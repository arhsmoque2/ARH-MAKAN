# ADR-0015: Woodfire Standalone Full-Stack FnB and Web Ordering Architecture

## Status
Accepted (2026-08-20)

## Context
Rather than functioning as a generic multi-tenant showroom or redirecting to external tiers, ARH-MAKAN is built as the dedicated, standalone Woodfire Kulim commercial restaurant store frontend. It must seamlessly handle physical in-restaurant Dine-In table orders, customer takeaway web ordering, in-app dynamic QR payments, and independent Cloudflare edge deployments per module.

## Decision
1. **Standalone Woodfire Storefront**: The customer surface (`/customer/`) provides a complete, self-contained Woodfire brand experience (luxury noir gold aesthetic `#13100B` / `#D4A017`, Playfair Display & DM Sans, full oak-smoked gourmet catalog).
2. **Dual Dine-In & Takeaway Web Ordering**:
   - *Dine-In*: Dynamic table QR parameter binding (`?table=Txx`), waiter service calls, split-bill calculator.
   - *Takeaway / Web Ordering*: Customer name, phone number, pickup time scheduling, vehicle plate details for curbside pickup.
3. **In-App Dynamic DuitNow QR Payment**: ISO/IEC 18004 client-side QR generation, live 15:00 countdown timer, unique order reference codes, optional bank slip receipt image compression upload, WhatsApp proof shortcut, and 1-click test payment simulation.
4. **Independent Cloudflare Edge Deployments**: Each module (`customer`, `pos`, `kds`, `admin`, `suite`) has its own `wrangler.jsonc` configuration enabling independent live deployments on Cloudflare Workers / Pages for module-level staging and testing.

## Consequences
- **Positive**: Complete standalone operational readiness for Woodfire Kulim without dependencies on third-party SaaS portals.
- **Operator Flexibility**: Operators and QA testers can test individual surfaces live on distinct Cloudflare domains or unified under the suite hub.
