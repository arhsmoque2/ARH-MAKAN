# ADR-0003: Zero-Build Vanilla/ESM and Luxury Design Tokens Stack

## Status
Accepted (2026-08-17)

## Context
Commercial POS and KDS systems frequently fail in production due to complex client-side bundling, hydration mismatches, fragile Node/Webpack build steps, and vendor lock-in. Furthermore, generic utility-first UI frameworks often produce sterile, cookie-cutter aesthetics unsuitable for premium F&B brands.

## Decision
1. **Zero-Build Stack**: The entire suite is authored in native modern HTML5, Vanilla JavaScript (ESM modules), and structured Vanilla CSS.
2. **Immediate Executability**: Any surface can be opened directly in a browser, served via lightweight static server, or deployed to Cloudflare Pages/Workers without compilation steps.
3. **Curated Luxury Design Tokens**:
   - Palette: Deep Noir backgrounds (`#0d0b08`, `#16120e`, `#221c15`), warm gold/champagne accents (`#D4A017`, `#E5C158`, `#9E7710`), crisp semantic accents (Emerald `#2ECC71`, Coral Red `#E74C3C`, Amber `#F39C12`).
   - Typography: Google Fonts `Playfair Display` (Headlines/Branding), `DM Sans` (Body UI), and `JetBrains Mono` (Prices, Table Codes, Timers).
   - Glassmorphism & Elevation: Layered surface cards with subtle border illumination (`rgba(212,160,23,0.12)`) and micro-animations.

## Consequences
- 100% portable, instant loading (<200ms initial paint), zero runtime hydration cost, and visually differentiated luxury branding.
