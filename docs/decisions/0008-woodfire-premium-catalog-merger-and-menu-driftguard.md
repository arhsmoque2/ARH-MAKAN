# ADR-0008: Woodfire Premium Catalog Merger, Radio Modifiers, and Menu DriftGuard

## Status
Accepted (2026-08-18)

## Context
Previously, `ARH-MAKAN` used an initial mock menu while the sibling `arh-fnb-tier-showroom` held the canonical Woodfire Kulim menu data (`data/menu.json` with 33 items, radio choices, and 16 add-ons). To achieve a unified commercial operating suite, `ARH-MAKAN` needed to ingest the full Woodfire catalog, support single/radio modifier selections with dynamic subtotal recalculation, and ensure station routing and data schemas never drift.

## Decision
1. **Canonical Menu Single Source of Truth**:
   - Ingest canonical Woodfire catalog into `data/menu.json`.
   - Implement `scripts/build-menus.mjs` compiler to automatically generate `shared/mock-data/menu.json` with KDS station bindings (`grill`, `fry`, `bar`, `expo`).
2. **Radio Modifier & Dynamic Pricing Engine**:
   - Support single/radio selections (`meat`: Beef / Chicken / Mix with zero price delta, bun choices, and spice levels) and multiple add-ons.
   - Attach reactive listeners in the item modal to recalculate item price and CTA button (`Add to Order — RM XX.XX`) live upon selection change.
3. **Menu Config DriftGuard (`scripts/check-menu-schema.mjs`)**:
   - Implement automated schema validation checking category keys, non-negative prices, valid modifier structures, and KDS station invariants.
   - Enforce as Gate 2 in the unified 9-gate CI Doctor suite (`scripts/arh-ci-doctor.mjs`).
4. **Reskinning & Visual Fidelity**:
   - Retain the Woodfire Noir and Gold luxury design tokens across Customer Dine-In, KDS, POS, and Admin surfaces.

## Consequences
- Single source of truth for menu data across both customer ordering and kitchen display systems.
- Zero price calculation ambiguity for customers selecting required meat options or add-ons.
- Strict CI/CD prevention against missing categories, broken station routes, or unpriced modifiers.
