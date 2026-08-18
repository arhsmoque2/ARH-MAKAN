# ADR-0013: Cloud Agent Independence, E2E Interactive Smoke Gate, and Standing Sentinel Automation

## Status
**Accepted & Implemented** (PR #9, Release v2.8.0)

## Context
When running cloud coding agents (such as Claude Code on web, Antigravity, or remote headless CI runners), sessions frequently encounter bootstrap friction:
1. Cold `node_modules` caches causing setup delays.
2. Inconsistent Playwright Chromium binary paths across container images.
3. Lack of full E2E interactive action clicking and runtime `pageerror` trapping.
4. Risk of documentation drift across fast iteration cycles.
5. Need for continuous, unprompted health monitoring (standing audit sentinel).

## Decision
We implemented a **5-Pillar Cloud Agent Independence & Automation Harness**:

1. **Zero-Touch Session Bootstrap (`scripts/bootstrap-agent-session.mjs` & `.claude/hooks/session-start.sh`)**:
   - Automatically warms package dependencies, detects pre-baked Chromium paths across environments, checks cloud infrastructure readiness, and runs baseline sanity in <10s.
2. **E2E Interactive Runtime Smoke Gate (`scripts/test-e2e-smoke.mjs` - Gate 13)**:
   - Boots a local server and uses Playwright to interactively drive every core workflow across all 5 surfaces (`/customer/`, `/pos/`, `/kds/`, `/admin/`, `/devcon/`), asserting zero unhandled exceptions, console errors, or broken window handlers.
3. **Docs Freshness & Living Knowledge Triad Gate (`scripts/check-docs-freshness.mjs` - Gate 14)**:
   - Enforces synchronization between codebase changes, `CHANGELOG.md`, and Architecture Decision Records (`docs/decisions/`).
4. **Autonomous Agent PR Review & Sign-Off Workflow (`.github/workflows/agent-review-gate.yml`)**:
   - Executes full 14-gate verification on PRs and publishes structured architectural sign-off summaries.
5. **Standing Health Audit Sentinel (`.github/workflows/audit-sentinel.yml`)**:
   - Scheduled cron workflow running the entire 14-gate battery continuously to detect external environmental drift.

## Consequences
- Zero manual environment bootstrap required for incoming agents.
- 100% green 14-gate CI/CD doctor suite.
- Total protection against runtime UI regressions and unhandled console errors.
