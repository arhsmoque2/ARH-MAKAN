# ADR-0014: Quality Gates Synthesis from ARH-URUS

## Status
Accepted (2026-08-20)

## Context
ARH-URUS established an enterprise multi-dimensional quality gate and scorecard system (0-100 score + letter grade), brand asset integrity hashing (`.brand-baseline.json`), production deployment safety preflights, full lifecycle rehearsal gates, secret scanning, and strict ARH Documentation Suite conformance.
ARH-MAKAN requires this complete quality gate suite tailored for its zero-build vanilla ESM multi-surface F&B architecture.

## Decision
1. **Multi-Dimensional Scorecard**: Adopt 0-100 points scorecard with letter grades (`A+` >= 95, `A` >= 90, `B` >= 80, `C` >= 70, `D` >= 60, `F` < 60) in `arh-quality-gate.mjs`.
2. **Brand Baseline Hash Lock**: Implement SHA-256 asset hash tracking in `scripts/check-brand-integrity.mjs` governed by ADR updates.
3. **Production Safety Doctor**: Implement `scripts/ci-prod-safety-doctor.mjs` auditing Cloudflare Worker headers, zero secrets in configs, and asset budgets.
4. **Rehearsal Gate**: Implement `scripts/rehearse.mjs` and `scripts/check-rehearsal-gate.mjs` writing execution proofs to `.rehearsal-manifest.json`.
5. **Secretlint & Knip**: Adopt Secretlint and Knip static inspection rules.
6. **Documentation Suite**: Enforce 10 standard ARH docs in `ci-asbuilt-doctor.mjs`.

## Consequences
- **Positive**: 100% parity with ARH OS enterprise testing and CI standards.
- **Traceability**: All brand updates and architectural changes require verifiable receipts and ADR references.
