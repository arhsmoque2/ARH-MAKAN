# Contributing to ARH-MAKAN

Thank you for contributing to **ARH-MAKAN** (Multi-Surface Restaurant Operating System Suite).

## 🛠️ Development Standards

1. **Zero-Build Vanilla ESM**: We prioritize native browser ESM, CSS custom properties (design tokens), and standard HTML5 semantic elements with no bundler tax.
2. **Quality Gates & CI Doctor**:
   - Before submitting a pull request, all automated quality gates must pass cleanly.
   - Run the full verification suite locally:
     ```bash
     npm test          # Runs the full 15-Gate CI Doctor Suite
     npm run gate      # Runs the Unified Master Quality Gate Harness
     ```
3. **Living Knowledge Triad**:
   - Every architectural change must update `README.md`, `RECIPES.md`, and `GOTCHAS.md`.
   - Record architectural pivots as numbered ADRs in `docs/decisions/` and index them in `docs/decisions/README.md`.
   - Document versioned changes in `CHANGELOG.md` following semantic versioning.
4. **Git Pre-Commit Hook**:
   - Install the canonical pre-commit hook before committing:
     ```bash
     npm run setup:hooks
     ```

## 🧪 Verification Matrix

- **ESM Syntax & Linting**: `npm run lint`
- **Actions Runtime & Budget**: `npm run budget`
- **As-Built & Living Triad**: `npm run asbuilt`
- **A11y & HTML Semantics**: `node scripts/verify-a11y-html.mjs`
- **Design Tokens & Invariants**: `node scripts/check-design-tokens.mjs`
- **Layout & Multi-Viewport**: `node scripts/check-ui-integrity.mjs`
- **E2E Interactive Smoke**: `node scripts/test-e2e-smoke.mjs`
- **Loading Speed & Web Vitals**: `npm run profile:speed`
