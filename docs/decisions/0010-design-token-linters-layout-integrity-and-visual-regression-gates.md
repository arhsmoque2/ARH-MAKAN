# ADR-0010: Design Token Linters, Multi-Viewport Layout Integrity, and Visual Regression Gates

## Status
Accepted (2026-08-18)

## Context
As `ARH-MAKAN` incorporates features and code merges across multiple dining surfaces, automated guardrails were required to:
1. Prevent UI styling drift, hardcoded color hex values, and untracked typography.
2. Enforce ARH design rules (strict prohibition of forbidden tropes such as purple-on-dark, neon glowing card outlines, and textureless surfaces).
3. Deterministically detect horizontal page overflows (`[page-overflow-x]`), broken assets, and layout collisions across Mobile (390px), Tablet (768px), and Desktop (1280px).
4. Perform pixel-perfect visual regression testing (VRT) against committed golden baselines before code merges.

## Decision
1. **Gate 10: Static Design Token & Consistency Linter (`scripts/check-design-tokens.mjs`)**:
   - Inspired by DriftGuard and Lapidist design-lint.
   - Enforces canonical token vocabulary (`var(--gold-*)`, `var(--bg-*)`, `var(--text-*)`, `var(--font-*)`).
   - Flags untracked font declarations and forbidden cliché design patterns.
2. **Gate 11: Multi-Viewport UI Integrity & Layout Overflow Scanner (`scripts/check-ui-integrity.mjs`)**:
   - Inspired by `@mizchi/vlmkit`.
   - Runs headless Playwright verification across 3 viewports (`390x844`, `768x1024`, `1280x800`).
   - Automatically catches and prevents horizontal document scrollbar bleed.
3. **Gate 12: Visual Regression Testing & Baseline Diff Engine (`scripts/test-visual-regression.mjs`)**:
   - Inspired by `9boxer` and Playwright VRT.
   - Compares pixel-perfect snapshots against committed baselines in `evidence/visual-baselines/`.
   - Flags visual regressions exceeding 2.5% delta.
4. **Resolved Layout & Styling Fixes**:
   - Fixed untracked `font-family: monospace;` in `pos/pos.css` to `var(--font-mono)`.
   - Fixed mobile and tablet horizontal overflow in `kds/kds.css` (`.kds-stations` wrap and scroll handling).
   - Fixed mobile responsive column wrapping in `pos/pos.css`.

## Consequences
- 100% deterministic visual and design quality gate in CI/CD.
- Zero-drift guarantee for future feature merges and AI-assisted pair-programming.
