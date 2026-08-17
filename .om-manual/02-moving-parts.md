# 2. ARH-MAKAN — the moving parts

_Each part of the project: what it does, why it matters to you, and where it lives._

## (project root)

This section was generated without AI assistance (--no-llm). Re-run with the LLM enabled for a narrative description.

Files in this part: .editorconfig, .gitignore, AGENTS.md, CHANGELOG.md, GOTCHAS.md, HANDOFF.md, PLAN.md, README.md, RECIPES.md, index.html, test-sandbox.html, worker.mjs, wrangler.jsonc, wrangler.toml.

### Where it lives

- `.editorconfig:1-15` — verbatim:

```text
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.{js,mjs,json,css,html}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

- `.gitignore:1-26` — verbatim:

```text
# OS intermediate and scratch files
.DS_Store
Thumbs.db
*.bak
*.tmp
*.log

# Node / package manager artifacts
node_modules/
dist/
.wrangler/
package-lock.json

# Local test & coverage artifacts
test-results/
playwright-report/
blob-report/
.coverage/

# Dotfiles wholesale ignore with vendored skills carve-out (ARH-URUS pattern)
.claude/*
!.claude/skills/
.claude/skills/*
!.claude/skills/flow-of-events-first/
!.claude/skills/fnb-taste-palette-design/
!.claude/settings.json
```

- `AGENTS.md:1-24` — verbatim:

````markdown
# AGENTS.md — ARH-MAKAN

## Runtime Orientation
- **Role**: Autonomous, Efficient, Compliant Agent.
- **Objective**: Deliver and maintain the production-grade F&B operating suite adhering strictly to Flow-of-Events-First and zero-build Vanilla/ESM edge architecture.

## Prime Directives
1. **Flow of Events First**: Always verify changes against actual rendered DOM/pixels and live UI state transitions.
2. **Zero-Build Edge Architecture**: Pure Vanilla JS/ESM, HTML5, and curated CSS tokens. No heavyweight bundlers or compile steps required to serve or test.
3. **Cross-Origin Resilient**: Multi-surface state sync operates across independent Cloudflare Worker origins via Tier 3 Firebase RTDB REST + SSE streams, with local BroadcastChannel and localStorage fallbacks.
4. **Honest Status Reporting**: Never report false-positive cloud sync states in status HUDs. `cloudActive` must reflect verified network connectivity.
5. **Traceability via Flight Recorder**: Use the built-in telemetry flight recorder (`shared/flight-recorder.js`) to capture user action trajectories, network payloads, and unhandled errors into machine-readable JSONL.

## Secrets & Configuration Governance
- **Zero Plaintext Secrets**: Never commit plaintext API keys, tokens, or private identity paths to this repository.
- **Environment Injection**: Configuration and runtime tokens are injected via standard environment variables (e.g. `FIREBASE_RTDB_URL`, `CLOUDFLARE_API_TOKEN`) or resolved through the central ARH secret injector mechanism.
- **Offline-First Resilience**: The multi-surface suite operates fully offline-first using local `BroadcastChannel` and `localStorage` state buses. Cloud database sync is an optional tier configured strictly via environment or runtime settings.

## Standard Verification Gate
Always run the full 7-gate CI Doctor before committing or merging:
```bash
node scripts/arh-ci-doctor.mjs
```

````

- `CHANGELOG.md:1-19` — verbatim:

```markdown
# Changelog — ARH-MAKAN

All notable changes to the ARH-MAKAN repository are documented in this file.

## [2.2.0] - 2026-08-17
### Added
- **Zero-Dependency Dynamic QR Engine (`shared/qr-generator.js`)**: Pure client-side ISO/IEC 18004 compliant QR matrix encoder (<12KB ESM) supporting dynamic table URL encoding, 1-click PNG export, and A4 printable Table Tent Card batch layout.
- **Expediter (Expo) Summary View (`kds/`)**: Aggregates all active un-bumped items across the floor with per-table counts.
- **ESC/POS Thermal Formatter (`shared/escpos-formatter.js`)**: 58mm/80mm formatted thermal receipt and kitchen prep ticket generator.
- **Fast Cash Denomination Pad (`pos/`)**: Instant change calculation pad (`Exact`, `RM 20`, `RM 50`, `RM 100`).
- **Showroom Bridge Station-Routing Engine (`shared/showroom-bridge.js`)**: Automatic category mapping and regex keyword fallback preventing station fallthrough.
- **Client-Side Flight Recorder (`shared/flight-recorder.js`)**: 2KB zero-dependency telemetry engine capturing user click trajectories, network payloads, and unhandled JS exceptions into JSONL.
- **Living Multi-Surface Test Sandbox (`test-sandbox.html`)**: Quad-split interactive dashboard with 1-click scenario injectors (Rush Hour, 86 Sold Out, Waiter calls).
- **Portable 7-Gate CI Doctor (`scripts/arh-ci-doctor.mjs`)**: Self-contained multi-gate quality and preflight suite.

### Fixed
- Station routing fallthrough for Woodfire menu categories (`fries`, `sides`, `upgrades`, `starters` -> `fry`).
- Double table prefix formatting in KDS Expo view (`TT05` -> `T05`).
- Honest sync status HUD gating preventing false-positive cloud badges when offline.
```

Other files in this part: `GOTCHAS.md`, `HANDOFF.md`, `PLAN.md`, `README.md`, `RECIPES.md`, `index.html`, `test-sandbox.html`, `worker.mjs`, `wrangler.jsonc`, `wrangler.toml`

## .claude

This section was generated without AI assistance (--no-llm). Re-run with the LLM enabled for a narrative description.

Files in this part: .claude/settings.json, .claude/skills/flow-of-events-first/SKILL.md, .claude/skills/flow-of-events-first/checklists/rehearsal-verification-checklist.md, .claude/skills/flow-of-events-first/recipes/exception-over-redesign.md, .claude/skills/flow-of-events-first/recipes/worked-example-modifiers.md, .claude/skills/fnb-taste-palette-design/MANIFEST.md, .claude/skills/fnb-taste-palette-design/README.md, .claude/skills/fnb-taste-palette-design/SKILL.md, .claude/skills/fnb-taste-palette-design/checklists/fnb-taste-review-checklist.md, .claude/skills/fnb-taste-palette-design/contracts/item-lightbox.contract.md, .claude/skills/fnb-taste-palette-design/recipes/resolve-owner-vibe-to-design.recipe.md, .claude/skills/fnb-taste-palette-design/references/github-native-governance-options.md, .claude/skills/fnb-taste-palette-design/registries/fnb-palette-registry.json, .claude/skills/fnb-taste-palette-design/registries/fnb-vibe-registry.json, .claude/skills/fnb-taste-palette-design/route-index.yml, .claude/skills/fnb-taste-palette-design/schemas/fnb.design.config.schema.json.

### Where it lives

- `.claude/settings.json:1-8` — verbatim:

```json
{
  "extraKnownMarketplaces": [
    "https://github.com/arhsmoque2/arh-cloud-agent-toolkit"
  ],
  "enabledPlugins": [
    "arh-cloud-agent-toolkit"
  ]
}
```

- `.claude/skills/flow-of-events-first/SKILL.md:36-75` — verbatim:

````markdown
                                          entrypoint)                       not code/state)
```

Skipping straight to "here's the workflow" (or straight to "here's the
objective") risks designing around whatever's already built, already
documented, or already assumed, instead of around what's actually true.
Skipping the last arrow -- verifying against rendered pixels instead of
code or state -- risks shipping a workflow that is correctly *specified*
and still completely non-functional. Both failures are the same mistake at
different ends of the pipeline: substituting an abstraction for the thing
it's supposed to represent.

## Why this is a real rule, not a platitude

2026-08-04, this repo: item modifiers were implemented across three tiers.
Every step was done in the right order -- the canonical menu was grounded in
real photographed prices before any workflow was written, the workflow was
documented per persona, the code was written to match it, and it was tested:
`node --check` passed, a Playwright suite clicked through the flow and read
back correct cart totals and validation payloads out of JavaScript state.
It was reported as verified.

Premium's storefront was still completely broken. `openItem()` wrote the
item's name, price, and modifier choices into the DOM -- into the wrong
element, because `document.querySelector('[data-item-detail]')` matched a
different, invisible element first. The real dialog stayed empty forever.
No amount of reading the code would surface this: the code reads as a normal,
correct selector call. No amount of reading JS state would surface it either
-- the *event listener* was attached to the wrong node, so the state-reading
checks that clicked buttons via `document.querySelector(...).click()` never
even exercised the real path a mouse would take through a rendered page.
It was only found by looking at a screenshot, because a screenshot is the
only check that verifies what the last layer exists to verify: that a human
can actually see and complete the flow of events this was all supposed to
serve.

The lesson generalizes past this one bug: a clean diff, a passing type
check, and a green test suite are necessary and prove the *workflow* was
implemented. None of them prove the *flow of events* still completes for a
real person. Only rehearsing it against a render does.
````

- `.claude/skills/flow-of-events-first/checklists/rehearsal-verification-checklist.md:1-40` — verbatim:

```markdown
# Rehearsal verification checklist

Run this before writing a workflow doc or code (items 1-4), and again
before reporting a UI-touching change as done (items 5-9). Both passes are
required; neither substitutes for the other.

## Before starting (layers 1-3)

1. [ ] The flow of events is written down in plain language, per entrypoint
       touched (customer / store owner / platform operator / CLI agent),
       before any workflow doc or code exists for this change.
2. [ ] It's sourced from something outside your own prior work -- the real
       product, real photos/screenshots, the operator's own words, a fresh
       read of the actual deployed thing -- not from existing docs or code,
       which may already be a stale or wrong abstraction.
3. [ ] The required actions are stated separately from the workflow -- each
       one describable in a sentence with no UI element in it. If you can't
       write the required action without naming a button or a screen,
       you've skipped straight to layer 3.
4. [ ] Every workflow step you're about to write or change traces back to a
       specific required action, which traces back to a specific item in
       the flow of events. If it doesn't, ask whether you're solving a
       real problem or just filling out a template. Every entrypoint the
       change touches has been walked through this, not just the easiest
       one.

## Before reporting done (layer 5)

5. [ ] You re-walked the *exact* flow of events from steps 1-4 against the
       **rendered** UI -- clicked what a real actor would click, in the
       order they'd click it -- not read the code that was supposed to
       produce it.
6. [ ] At least one artifact exists that a human can look at and confirm
       with their own eyes: a screenshot, a recording, or a live
       observation. A passing `node --check`, a clean diff, or a JS state
       dump read via `page.evaluate` does not count as this artifact --
       pair it with one, never substitute it.
7. [ ] Every entrypoint/surface the change touches has been rehearsed, not
       just the one that was easiest to test. (Example: a modifier feature
       touches the customer's add-to-cart flow AND the WhatsApp message
```

- `.claude/skills/flow-of-events-first/recipes/exception-over-redesign.md:1-40` — verbatim:

```markdown
# Recipe: exception path over redesign, for governing mechanisms

The general pattern from "Design for imperfection" in `SKILL.md`, made
concrete, plus where it already exists in this repo as a precedent.

## The pattern

A governing/gating mechanism -- a permission check, a validation rule, a
pre-tool-use hook, anything that blocks an action by rule -- will
eventually meet a legitimate case it didn't foresee. Design the escape
hatch in from day one:

1. The rule blocks by default, as designed.
2. A structured, scoped exception can be granted for one specific
   case -- naming exactly the command/action/actor/item it applies to, not
   a blanket bypass. A JSON allowlist entry is a reasonable shape: specific
   enough to audit, cheap enough to grant without a redesign.
3. The exception is logged somewhere visible (a tracked file, not a
   private memory) so it can be reviewed later.
4. When the *same shape* of exception gets requested again, that's the
   signal -- not the first request -- that the rule itself is missing a
   real case. Fold it into the rule's core logic then, once you're folding
   in a proven pattern instead of guessing at one from a single data point.

The cost this avoids: redesigning core governing logic under pressure,
every single time reality doesn't match the model, which produces fatigue
and creates pressure to under-design the rule in the first place so it
never has to be revisited.

## Where this pattern already exists in this repo

Two real precedents, both worth reusing as templates rather than
reinventing the shape next time a governing mechanism is needed:

- **`RELEASE_STATE = { status: "mockup" }`** (every storefront tier). The
  default rule blocks real checkout. The escape hatch is a single flag,
  flipped per-store when that store is promoted -- not a rewrite of the
  checkout code path. See `governance/pilot-agreement-summary.md` for the
  documented steps to grant that exception for one store.
- **`foundation`'s kill switch** (`POST /kill-switch/:slug`,
```

Other files in this part: `.claude/skills/flow-of-events-first/recipes/worked-example-modifiers.md`, `.claude/skills/fnb-taste-palette-design/MANIFEST.md`, `.claude/skills/fnb-taste-palette-design/README.md`, `.claude/skills/fnb-taste-palette-design/SKILL.md`, `.claude/skills/fnb-taste-palette-design/checklists/fnb-taste-review-checklist.md`, `.claude/skills/fnb-taste-palette-design/contracts/item-lightbox.contract.md`, `.claude/skills/fnb-taste-palette-design/recipes/resolve-owner-vibe-to-design.recipe.md`, `.claude/skills/fnb-taste-palette-design/references/github-native-governance-options.md`, `.claude/skills/fnb-taste-palette-design/registries/fnb-palette-registry.json`, `.claude/skills/fnb-taste-palette-design/registries/fnb-vibe-registry.json`, `.claude/skills/fnb-taste-palette-design/route-index.yml`, `.claude/skills/fnb-taste-palette-design/schemas/fnb.design.config.schema.json`

## .github

This section was generated without AI assistance (--no-llm). Re-run with the LLM enabled for a narrative description.

Files in this part: .github/workflows/ci.yml, .github/workflows/deploy-cloudflare.yml.

### Where it lives

- `.github/workflows/ci.yml:1-23` — verbatim:

```yaml
name: CI Doctor & Integrity Gate

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    name: Schema, Syntax & Integrity Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run CI Doctor
        run: node scripts/arh-ci-doctor.mjs
```

- `.github/workflows/deploy-cloudflare.yml:1-28` — verbatim:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    name: Validate & Deploy to Cloudflare
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run CI Doctor
        run: node scripts/arh-ci-doctor.mjs

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy -c ./wrangler.jsonc
```

## admin

This section was generated without AI assistance (--no-llm). Re-run with the LLM enabled for a narrative description.

Files in this part: admin/admin.css, admin/admin.js, admin/index.html.

### Where it lives

- `admin/admin.css:1-40` — verbatim:

```css
/* Owner Admin Operations Console Styles */

.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #080604;
}

.admin-sidebar {
  width: 220px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-card);
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.admin-nav-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.admin-nav-btn:hover {
  background: var(--bg-surface-raised);
  color: var(--text-primary);
}

```

- `admin/admin.js:1-40` — verbatim:

```javascript
import { hub } from '../shared/realtime-adapter.js';
import { QRCode } from '../shared/qr-generator.js';

let menuData = null;

async function init() {
  try {
    const res = await fetch('../shared/mock-data/menu.json');
    menuData = await res.json();
    updateSyncHUD();
    renderKPIs();
    renderStockToggles();
    renderOrdersTable();
    renderQRGenerator();
  } catch (e) {
    console.error('Failed to init admin:', e);
  }
}

function updateSyncHUD() {
  const badge = document.getElementById('sync-status-text');
  if (!badge) return;
  const status = hub.getSyncStatus();
  badge.innerText = status.mode;
}

// Render KPI Cards
function renderKPIs() {
  const orders = hub.getOrders();
  const paidOrders = orders.filter(o => o.status === 'paid');
  const activeOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');

  const totalRev = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const kpiRev = document.getElementById('kpi-rev');
  const kpiTotal = document.getElementById('kpi-total-orders');
  const kpiActive = document.getElementById('kpi-active');
  const kpiAvg = document.getElementById('kpi-avg-prep');

  if (kpiRev) kpiRev.innerText = `RM ${totalRev.toFixed(2)}`;
```

- `admin/index.html:1-40` — verbatim:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Woodfire Admin · Store Operations & Floor Hub</title>
  <link rel="stylesheet" href="../shared/theme.css">
  <link rel="stylesheet" href="./admin.css">
  <script src="../shared/flight-recorder.js"></script>
</head>
<body class="admin-layout">

  <!-- Sidebar -->
  <aside class="admin-sidebar">
    <div style="margin-bottom: 14px;">
      <a href="../index.html" class="btn btn-sm btn-secondary" style="width: 100%; text-decoration: none;">← Central Hub</a>
    </div>

    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px; padding: 0 4px;">
      <div style="font-size: 1.6rem;">🔥</div>
      <div>
        <div style="font-family: var(--font-display); font-weight: bold; color: var(--gold-light); font-size: 1.1rem;">
          Woodfire Hub
        </div>
        <div class="text-xs text-muted">Manager Operations</div>
      </div>
    </div>

    <div id="sync-status-badge" style="margin-bottom: 16px; padding: 6px 10px; border-radius: 8px; background: rgba(212, 160, 23, 0.08); border: 1px solid rgba(212, 160, 23, 0.2); font-size: 0.72rem; color: var(--gold-light); display: flex; align-items: center; gap: 6px;">
      <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-success); display: inline-block;"></span>
      <span id="sync-status-text">Local Realtime Hub</span>
    </div>

    <button class="admin-nav-btn active" data-target="pane-dashboard">📊 Dashboard</button>
    <button class="admin-nav-btn" data-target="pane-inventory">📦 86 / Stock Toggles</button>
    <button class="admin-nav-btn" data-target="pane-tables">🪑 Table QR Codes</button>
    <button class="admin-nav-btn" data-target="pane-orders">🧾 Shift Orders</button>
  </aside>

  <!-- Main Content -->
```

## customer

This section was generated without AI assistance (--no-llm). Re-run with the LLM enabled for a narrative description.

Files in this part: customer/customer.css, customer/customer.js, customer/index.html.

### Where it lives

- `customer/customer.css:1-40` — verbatim:

```css
/* Customer Dine-In Surface Styles */

.customer-container {
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-main);
  padding-bottom: 90px;
  position: relative;
}

/* Header */
.cust-header {
  padding: 16px 20px;
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
}

.table-badge {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--gold-subtle);
  color: var(--gold-light);
  border: 1px solid rgba(212, 160, 23, 0.3);
}

/* Hero */
.cust-hero {
```

- `customer/customer.js:1-40` — verbatim:

```javascript
import { hub } from '../shared/realtime-adapter.js';
import { sound } from '../shared/audio-engine.js';

let menuData = null;
let currentTable = 'T05';
let activeDietary = 'all';
let cart = [];
let pendingModifierItem = null;
let activePlacedOrder = null;

// Initialize Table Session from URL or Storage
function initTableSession() {
  const params = new URLSearchParams(window.location.search);
  const tableParam = params.get('table');
  if (tableParam) {
    currentTable = tableParam.toUpperCase();
    sessionStorage.setItem('arh_table_id', currentTable);
  } else {
    currentTable = sessionStorage.getItem('arh_table_id') || 'T05';
  }

  const badge = document.getElementById('table-indicator');
  if (badge) badge.innerText = `TABLE ${currentTable} · DINE-IN`;
}

// Load Menu
async function init() {
  initTableSession();
  try {
    const res = await fetch('../shared/mock-data/menu.json');
    menuData = await res.json();
    renderDietaryPills();
    renderMenu();
    updateCartUI();
    checkActiveTableOrder();
  } catch (e) {
    console.error('Failed to load customer menu:', e);
  }
}

```

- `customer/index.html:1-40` — verbatim:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Woodfire Kulim · Digital Dine-In Menu</title>
  <link rel="stylesheet" href="../shared/theme.css">
  <link rel="stylesheet" href="./customer.css">
  <script src="../shared/flight-recorder.js"></script>
</head>
<body>

  <div class="customer-container">
    <!-- Header -->
    <header class="cust-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        <a href="../index.html" class="btn btn-sm btn-secondary" style="padding: 4px 10px; text-decoration: none;">← Hub</a>
        <div style="font-size: 1.3rem;">🔥</div>
        <div style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--gold-light);">
          Woodfire
        </div>
      </div>
      <div class="table-badge" id="table-indicator">TABLE T05 · DINE-IN</div>
    </header>

    <!-- Active Order Tracker Banner -->
    <div id="order-tracker-banner" style="display: none; background: var(--bg-surface-raised); border-bottom: 1px solid var(--border-card); padding: 14px 20px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-weight: 700; color: var(--gold-light);">Live Kitchen Tracker <span id="tracker-order-id"></span></span>
        <button class="btn btn-sm btn-secondary" onclick="window.openSplitBillModal()">Split Bill 🧮</button>
      </div>

      <div class="tracker-steps">
        <div class="tracker-step" id="step-placed">
          <div class="step-dot">1</div>
          <span>Placed</span>
        </div>
        <div class="tracker-step" id="step-cooking">
          <div class="step-dot">2</div>
          <span>Cooking</span>
```

## docs

This section was generated without AI assistance (--no-llm). Re-run with the LLM enabled for a narrative description.

Files in this part: docs/decisions/0001-flow-of-events-first-architecture-baseline.md, docs/decisions/0002-multi-surface-actor-boundaries-and-authority-matrix.md, docs/decisions/0003-zero-build-vanilla-esm-design-tokens-stack.md, docs/decisions/0004-realtime-hybrid-state-sync-and-offline-resilience.md, docs/decisions/0005-kds-ticket-aging-and-web-audio-chime-engine.md, docs/decisions/0006-counter-pos-multi-tender-and-esc-pos-thermal-printing.md, docs/decisions/0007-dine-in-table-qr-binding-and-live-service-call-protocol.md, docs/proposals/2026-08-17-premium-fullstack-fnb-architecture-and-build-plan.md, docs/recipes/adding-menu-category-and-modifiers.md.

### Where it lives

- `docs/decisions/0001-flow-of-events-first-architecture-baseline.md:1-21` — verbatim:

```markdown
# ADR-0001: Flow-of-Events-First Architecture Baseline

## Status
Accepted (2026-08-17)

## Context
F&B software frequently suffers from catastrophic divergence between abstract software models and real-world restaurant floor dynamics. Common points of failure include:
- A customer at Table 5 orders, but the app lacks table binding or modifier enforcement, resulting in incomplete kitchen tickets.
- A cashier cannot quickly settle a bill during peak rush because the UI requires multiple nested modal confirmations.
- A kitchen chef misses orders because an external audio file fails to load or autoplays were blocked by browser permissions.
- Code passes unit tests and state assertions, but visual DOM bugs leave modal dialogs unclickable for real customers.

## Decision
1. **Flow of Events Precedes Code**: Every surface and feature must originate from the physical flow of events outside software:
   $$\text{Physical Reality} \longrightarrow \text{Required Actions} \longrightarrow \text{Workflow Design} \longrightarrow \text{Implementation} \longrightarrow \text{Rendered Pixel Verification}$$
2. **Multi-Entrypoint Separation**: The system is split into dedicated actor surfaces (`customer`, `kds`, `pos`, `admin`, `showroom`), ensuring each entrypoint has a specialized, frictionless layout.
3. **Rendered Pixel Proof**: Verification requires rehearsing the actual rendered DOM and screenshots rather than mocking JS state.

## Consequences
- **Positive**: Zero discrepancy between what the customer/staff sees and what the business enforces.
- **Guardrail**: Modifying an action requires reviewing all affected actor entrypoints (e.g. updating menu modifiers touches customer selection, POS grid, and KDS ticket rendering).
```

- `docs/decisions/0002-multi-surface-actor-boundaries-and-authority-matrix.md:1-26` — verbatim:

```markdown
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
```

- `docs/decisions/0003-zero-build-vanilla-esm-design-tokens-stack.md:1-18` — verbatim:

```markdown
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
```

- `docs/decisions/0004-realtime-hybrid-state-sync-and-offline-resilience.md:1-20` — verbatim:

```markdown
# ADR-0004: Realtime Hybrid State Sync and Offline Resilience

## Status
Accepted (2026-08-17)

## Context
A restaurant floor requires instant multi-device coordination (Customer places order $\rightarrow$ KDS receives ticket $\rightarrow$ POS updates table status). However, restaurant Wi-Fi is notoriously unstable. If an internet blip drops an entire table's active cart or freezes the POS cashier, the business halts.

## Decision
We implement a 3-tier hybrid realtime sync architecture in `shared/realtime-adapter.js`:

1. **Tier 1: Browser `BroadcastChannel` (Instant Local Multi-Tab Sync)**:
   - All open browser tabs (Showroom, KDS, POS, Customer) communicate across an `arh_fnb_sync` channel with zero network latency (<5ms).
2. **Tier 2: `localStorage` / `IndexedDB` (Crash Resilience & Offline Queue)**:
   - Full active state (Orders, Table matrix, 86 inventory) is continuously serialized to persistent storage. If a device refreshes or loses connection, state is restored immediately.
3. **Tier 3: Cloud Realtime Provider (Firebase RTDB / WebSocket Gateway)**:
   - When configured, changes publish upstream to Firebase RTDB for cross-network restaurant synchronization. If offline, mutations queue locally and replay upon reconnection.

## Consequences
- Guaranteed sub-second responsiveness, seamless showroom demonstrations without requiring cloud setup, and rock-solid resilience against network dropouts.
```

Other files in this part: `docs/decisions/0005-kds-ticket-aging-and-web-audio-chime-engine.md`, `docs/decisions/0006-counter-pos-multi-tender-and-esc-pos-thermal-printing.md`, `docs/decisions/0007-dine-in-table-qr-binding-and-live-service-call-protocol.md`, `docs/proposals/2026-08-17-premium-fullstack-fnb-architecture-and-build-plan.md`, `docs/recipes/adding-menu-category-and-modifiers.md`

## evidence

This section was generated without AI assistance (--no-llm). Re-run with the LLM enabled for a narrative description.

Files in this part: evidence/test-sandbox.html.

### Where it lives

- `evidence/test-sandbox.html:1-40` — verbatim:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARH-MAKAN Living Test Sandbox & Operator Review Suite</title>
  <style>
    :root {
      --bg-dark: #0b0d14;
      --bg-surface: #121520;
      --border-color: #242938;
      --gold: #d4af37;
      --gold-light: #f3e5ab;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg-dark);
      color: var(--text);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      z-index: 100;
    }
    .header-left {
      display: flex;
      align-items: center;
```

## kds

This section was generated without AI assistance (--no-llm). Re-run with the LLM enabled for a narrative description.

Files in this part: kds/index.html, kds/kds.css, kds/kds.js.

### Where it lives

- `kds/index.html:1-40` — verbatim:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Woodfire KDS · Kitchen Operations</title>
  <link rel="stylesheet" href="../shared/theme.css">
  <link rel="stylesheet" href="./kds.css">
  <script src="../shared/flight-recorder.js"></script>
</head>
<body class="kds-layout">

  <!-- Audio Unlock Banner -->
  <div id="audio-unlock-banner" style="background: var(--gold-primary); color: #080604; text-align: center; padding: 8px 12px; font-weight: bold; cursor: pointer; font-size: 0.85rem;">
    🔔 Tap here to enable Kitchen Audio Chimes for incoming orders
  </div>

  <!-- Header -->
  <header class="kds-header">
    <div class="kds-brand">
      <a href="../index.html" class="btn btn-sm btn-secondary" style="padding: 6px 12px; text-decoration: none;">← Hub</a>
      <div class="kds-logo">🔥</div>
      <div>
        <h1 class="kds-title">Woodfire KDS</h1>
        <div class="kds-subtitle">Live Kitchen Operations System</div>
      </div>
    </div>

    <!-- Station Selector -->
    <nav class="kds-stations" id="kds-station-nav">
      <button class="station-btn active" data-station="all">All Stations <span class="st-count" id="count-all">0</span></button>
      <button class="station-btn" data-station="grill">🥩 Grill <span class="st-count" id="count-grill">0</span></button>
      <button class="station-btn" data-station="fry">🍟 Fry <span class="st-count" id="count-fry">0</span></button>
      <button class="station-btn" data-station="bar">🥤 Bar <span class="st-count" id="count-bar">0</span></button>
      <button class="station-btn" data-station="expo">📋 Expo Summary</button>
    </nav>

    <!-- Controls -->
    <div class="kds-controls">
      <div class="badge badge-gold" id="active-count">0 Active Tickets</div>
```

- `kds/kds.css:1-40` — verbatim:

```css
/* Kitchen Display System (KDS) Layout & Card Styles */

.kds-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #080604;
}

/* Header */
.kds-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-card);
  gap: 16px;
  flex-shrink: 0;
}

.kds-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kds-logo {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--gold-primary);
  color: #080604;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}
```

- `kds/kds.js:1-40` — verbatim:

```javascript
import { hub } from '../shared/realtime-adapter.js';
import { sound } from '../shared/audio-engine.js';
import { escPos } from '../shared/escpos-formatter.js';

let currentStation = 'all';
let previousOrderCount = 0;

// Audio unlock handler
const audioBtn = document.getElementById('audio-toggle-btn');
const audioBanner = document.getElementById('audio-unlock-banner');

function handleUnlockAudio() {
  sound.unlock();
  if (audioBanner) audioBanner.style.display = 'none';
  if (audioBtn) {
    audioBtn.innerHTML = '🔔 Audio ON';
    audioBtn.classList.remove('btn-secondary');
    audioBtn.classList.add('btn-primary');
  }
}

if (audioBtn) audioBtn.addEventListener('click', handleUnlockAudio);
if (audioBanner) audioBanner.addEventListener('click', handleUnlockAudio);

// Station Filter Selection
document.querySelectorAll('.station-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.station-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    currentStation = e.currentTarget.dataset.station;
    renderTickets(hub.getOrders());
  });
});

// Live Service Requests
function renderServiceAlerts(requests) {
  const alertContainer = document.getElementById('service-alert-container');
  if (!alertContainer) return;

  const activeReqs = requests.filter(r => r.status === 'active');
```

## pos

This section was generated without AI assistance (--no-llm). Re-run with the LLM enabled for a narrative description.

Files in this part: pos/index.html, pos/pos.css, pos/pos.js.

### Where it lives

- `pos/index.html:1-40` — verbatim:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Woodfire POS · Cashier & Terminal</title>
  <link rel="stylesheet" href="../shared/theme.css">
  <link rel="stylesheet" href="./pos.css">
  <script src="../shared/flight-recorder.js"></script>
</head>
<body class="pos-layout">

  <!-- Left Category Rail -->
  <aside class="pos-rail" id="pos-category-rail">
    <!-- Rendered dynamically -->
  </aside>

  <!-- Center Main Menu Column -->
  <main class="pos-main-col">
    <div class="pos-topbar">
      <div style="display: flex; align-items: center; gap: 12px;">
        <a href="../index.html" class="btn btn-sm btn-secondary" style="padding: 6px 12px; text-decoration: none;">← Hub</a>
        <div style="font-family: var(--font-display); font-size: 1.2rem; color: var(--gold-light);">
          Woodfire POS
        </div>
      </div>
      <div class="pos-search">
        <input type="text" class="form-input" id="pos-search-input" placeholder="🔍 Search menu item or code...">
      </div>
      <div class="badge badge-success">● Cashier Ready</div>
    </div>

    <!-- Product Grid or Tables Map -->
    <div class="pos-grid" id="pos-menu-grid">
      <!-- Rendered dynamically -->
    </div>
  </main>

  <!-- Right Cart & Tender Column -->
  <aside class="pos-cart-col">
```

- `pos/pos.css:1-40` — verbatim:

```css
/* Counter POS Layout & Touch Grid Styles */

.pos-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #080604;
}

/* Category Sidebar Rail */
.pos-rail {
  width: 100px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-card);
  display: flex;
  flex-direction: column;
  padding: 12px 6px;
  gap: 8px;
  overflow-y: auto;
  flex-shrink: 0;
}

.rail-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 6px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
}

```

- `pos/pos.js:1-40` — verbatim:

```javascript
import { hub } from '../shared/realtime-adapter.js';
import { sound } from '../shared/audio-engine.js';
import { escPos } from '../shared/escpos-formatter.js';

let menuData = null;
let currentCategory = 'burgers';
let currentTable = 'T01';
let cart = [];
let pendingModifierItem = null;

// Initialize
async function init() {
  try {
    const res = await fetch('../shared/mock-data/menu.json');
    menuData = await res.json();
    renderCategories();
    renderMenuGrid();
    renderTableSelector();
    updateCartUI();
  } catch (e) {
    console.error('Failed to load menu data:', e);
  }
}

// Category Rail
function renderCategories() {
  const rail = document.getElementById('pos-category-rail');
  if (!rail || !menuData) return;

  const categories = [
    { id: 'tables', name: 'Tables', icon: '🪑' },
    ...menuData.categories
  ];

  rail.innerHTML = categories.map(cat => `
    <button class="rail-btn ${cat.id === currentCategory ? 'active' : ''}" data-cat="${cat.id}">
      <div class="rail-icon">${cat.icon}</div>
      <div>${cat.name}</div>
    </button>
  `).join('');
```

## scripts

This section was generated without AI assistance (--no-llm). Re-run with the LLM enabled for a narrative description.

Files in this part: scripts/arh-ci-doctor.mjs, scripts/check.mjs, scripts/generate-test-sandbox.mjs, scripts/lint.mjs, scripts/profile-assets.mjs, scripts/test-qr-verify.mjs, scripts/test-showroom-bridge.mjs, scripts/verify-a11y-html.mjs, scripts/verify-infra-preflight.mjs.

### Where it lives

- `scripts/arh-ci-doctor.mjs:1-32` — verbatim:

```text
#!/usr/bin/env node
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('🩺 Running ARH CI Doctor & Full Devtool Suite for ARH-MAKAN...\n');

function run(cmd, desc) {
  process.stdout.write(`⚙️ ${desc}... `);
  try {
    execSync(cmd, { cwd: root, stdio: 'pipe' });
    console.log('✅ OK');
  } catch (err) {
    console.log('❌ FAILED');
    console.error(err.stderr ? err.stderr.toString() : err.message);
    process.exit(1);
  }
}

run('node scripts/check.mjs', '1. Static Integrity & Schema Validation');
run('node scripts/lint.mjs', '2. ESM JavaScript Syntax & Linter Gate');
run('node scripts/verify-a11y-html.mjs', '3. HTML5 & A11y Accessibility Verification');
run('node scripts/profile-assets.mjs', '4. Performance Budget & Asset Profiler');
run('node scripts/test-showroom-bridge.mjs', '5. Showroom Bridge & Station-Routing Suite');
run('node scripts/test-qr-verify.mjs', '6. QR Code Matrix Scannability & Density Gate');
run('node scripts/verify-infra-preflight.mjs', '7. Cloud Infrastructure & Config Preflight');

console.log('\n🎉 🩺 CI Doctor completed all 7 validation gates successfully!');
```

- `scripts/check.mjs:1-40` — verbatim:

```text
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('🔍 Running ARH-MAKAN Static Integrity & Syntax Doctor...\n');

let errors = 0;
let passes = 0;

function checkFile(filePath, desc, validator) {
  const fullPath = path.join(root, filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ [MISSING] ${desc}: ${filePath}`);
    errors++;
    return;
  }
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    if (validator) {
      validator(content, fullPath);
    }
    console.log(`✅ [PASS] ${desc}: ${filePath}`);
    passes++;
  } catch (err) {
    console.error(`❌ [FAIL] ${desc}: ${filePath} -> ${err.message}`);
    errors++;
  }
}

// 1. Check Core Schemas and JSON Files
checkFile('shared/schema.json', 'JSON Schema Definition', (content) => {
  JSON.parse(content);
});

checkFile('shared/mock-data/menu.json', 'Menu Catalog Data', (content) => {
```

- `scripts/generate-test-sandbox.mjs:1-40` — verbatim:

```text
/**
 * Living Multi-Surface Test Sandbox Generator
 * Builds a standalone, interactive test harness HTML page allowing operators
 * to view, test, and manipulate all 4 surfaces (Customer, KDS, POS, Admin) side-by-side.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const sandboxHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARH-MAKAN Living Test Sandbox & Operator Review Suite</title>
  <style>
    :root {
      --bg-dark: #0b0d14;
      --bg-surface: #121520;
      --border-color: #242938;
      --gold: #d4af37;
      --gold-light: #f3e5ab;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg-dark);
      color: var(--text);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
```

- `scripts/lint.mjs:1-40` — verbatim:

```text
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('🧹 Running ARH-MAKAN ESM Syntax & Linter Gate...\n');

const jsFiles = [
  'shared/realtime-adapter.js',
  'shared/audio-engine.js',
  'customer/customer.js',
  'kds/kds.js',
  'pos/pos.js',
  'admin/admin.js',
  'showroom/showroom.js',
  'scripts/check.mjs',
  'scripts/arh-ci-doctor.mjs',
  'scripts/profile-assets.mjs'
];

let errors = 0;

for (const file of jsFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ [MISSING] ${file}`);
    errors++;
    continue;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  // Check 1: Forbidden patterns (e.g. alert in core logic or accidental console.trace)
  if (content.includes('debugger;')) {
    console.error(`❌ [LINT] ${file} contains forbidden 'debugger;' statement`);
    errors++;
```

Other files in this part: `scripts/profile-assets.mjs`, `scripts/test-qr-verify.mjs`, `scripts/test-showroom-bridge.mjs`, `scripts/verify-a11y-html.mjs`, `scripts/verify-infra-preflight.mjs`

## shared

This section was generated without AI assistance (--no-llm). Re-run with the LLM enabled for a narrative description.

Files in this part: shared/audio-engine.js, shared/escpos-formatter.js, shared/flight-recorder.js, shared/mock-data/menu.json, shared/qr-generator.js, shared/realtime-adapter.js, shared/schema.json, shared/showroom-bridge.js, shared/theme.css.

### Where it lives

- `shared/audio-engine.js:1-40` — verbatim:

```javascript
/**
 * ARH-MAKAN Web Audio Synthesized Chime Engine
 * Absorbed and upgraded from amogha-cafe/kitchen.
 * Generates zero-latency synthesized bells/pings without external audio files.
 */

class FnbAudioEngine {
  constructor() {
    this.ctx = null;
    this.isUnlocked = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isUnlocked = !!(this.ctx && this.ctx.state === 'running');
    return this.isUnlocked;
  }

  unlock() {
    const success = this.init();
    if (success) {
      this.playGentlePing();
    }
    return success;
  }

  /**
   * Dual-tone marimba chime for incoming orders
   */
  playNewOrderChime() {
    if (!this.init()) return;
    const now = this.ctx.currentTime;
```

- `shared/escpos-formatter.js:1-40` — verbatim:

```javascript
/**
 * ESC/POS Thermal Receipt & Kitchen Prep Ticket Formatter
 * Ported from industry-standard POS patterns (Kasirku / escpos-php / Star Micronics).
 * Supports 58mm (32 cols) and 80mm (42/48 cols) thermal rolls, raw byte buffers,
 * and high-fidelity pixel-perfect browser thermal print previews.
 */

export const PaperWidth = {
  MM_58: 32,
  MM_80: 42,
  MM_80_WIDE: 48
};

export class EscPosReceiptBuilder {
  constructor(options = {}) {
    this.width = options.width || PaperWidth.MM_80;
    this.storeName = options.storeName || 'WOODFIRE KULIM';
    this.tagline = options.tagline || 'Gourmet Burgers & Smoked Meats';
    this.contact = options.contact || 'Tel: +60 16-979 9778';
    this.address = options.address || 'Kulim Square Commercial Centre, Kedah';
    this.taxRate = options.taxRate !== undefined ? options.taxRate : 0.06;
    this.taxName = options.taxName || 'SST (6%)';
    this.currency = options.currency || 'RM';
  }

  // --- String Formatting Helpers ---

  padLine(left, right, width = this.width) {
    const leftStr = String(left || '');
    const rightStr = String(right || '');
    const spaceCount = Math.max(1, width - leftStr.length - rightStr.length);
    return leftStr + ' '.repeat(spaceCount) + rightStr;
  }

  centerText(text, width = this.width) {
    const str = String(text || '');
    if (str.length >= width) return str.slice(0, width);
    const pad = Math.floor((width - str.length) / 2);
    return ' '.repeat(pad) + str;
  }
```

- `shared/flight-recorder.js:1-40` — verbatim:

```javascript
/**
 * ARH Frontend Flight Recorder & Agent Telemetry Engine (v1.0)
 * Lightweight (2KB), zero-dependency client telemetry engine.
 * Records user interaction trajectories, network payloads, state mutations, and unhandled JS exceptions
 * into structured JSON Lines (.jsonl) for instant agent inspection without manual explanations.
 */

(function () {
  if (typeof window === 'undefined') return;
  if (window.__ARH_FLIGHT_RECORDER_INITIALIZED__) return;
  window.__ARH_FLIGHT_RECORDER_INITIALIZED__ = true;

  const STORAGE_KEY = 'arh_flight_record_events';
  const MAX_EVENTS = 200;
  const events = [];

  function getSurfaceName() {
    const p = window.location.pathname;
    if (p.includes('/customer')) return 'Customer';
    if (p.includes('/kds')) return 'KDS';
    if (p.includes('/pos')) return 'POS';
    if (p.includes('/admin')) return 'Admin';
    if (p.includes('/showroom')) return 'Showroom';
    return 'Hub';
  }

  function record(type, payload = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      surface: getSurfaceName(),
      url: window.location.href,
      type,
      ...payload
    };

    events.push(entry);
    if (events.length > MAX_EVENTS) events.shift();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
```

- `shared/mock-data/menu.json:1-40` — verbatim:

```json
{
  "restaurant": {
    "name": "Woodfire Kulim",
    "tagline": "Premium Smoked Meats & Gourmet Burgers",
    "currency": "RM",
    "locale": "en-MY",
    "phone": "60169799778",
    "tax_rate": 0.06
  },
  "categories": [
    { "id": "burgers", "name": "Gourmet Burgers", "icon": "🍔" },
    { "id": "smoked", "name": "Smoked Meats & Steaks", "icon": "🥩" },
    { "id": "chicken", "name": "Crispy Chicken", "icon": "🍗" },
    { "id": "sides", "name": "Artisan Sides", "icon": "🍟" },
    { "id": "shakes", "name": "Signature Shakes & Drinks", "icon": "🥤" }
  ],
  "items": [
    {
      "id": "wf-gourmet-burger",
      "name": "Woodfire Gourmet Burger",
      "category": "burgers",
      "price": 24.90,
      "description": "Signature smashed beef patty, smoked turkey bacon, melted Monterey Jack, caramelized onions, house barbecue glaze.",
      "badge": "Signature",
      "station": "grill",
      "dietary": ["halal"],
      "is_sold_out": false,
      "modifiers": [
        {
          "id": "bun",
          "name": "Bun Selection",
          "type": "single",
          "required": true,
          "options": [
            { "name": "Toasted Brioche", "price": 0 },
            { "name": "Charcoal Sesame", "price": 1.50 },
            { "name": "Lettuce Wrap (Low Carb)", "price": 0 }
          ]
        },
        {
```

Other files in this part: `shared/qr-generator.js`, `shared/realtime-adapter.js`, `shared/schema.json`, `shared/showroom-bridge.js`, `shared/theme.css`

## showroom

This section was generated without AI assistance (--no-llm). Re-run with the LLM enabled for a narrative description.

Files in this part: showroom/index.html, showroom/showroom.css, showroom/showroom.js.

### Where it lives

- `showroom/index.html:1-40` — verbatim:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARH-MAKAN · Multi-Surface Showroom</title>
  <link rel="stylesheet" href="../shared/theme.css">
  <link rel="stylesheet" href="./showroom.css">
</head>
<body class="showroom-layout">

  <!-- Top Switcher Bar -->
  <header class="showroom-topbar">
    <div class="showroom-brand">
      <a href="../index.html" class="btn btn-sm btn-secondary" style="padding: 6px 12px; text-decoration: none;">← Hub</a>
      <div style="font-size: 1.6rem;">🔥</div>
      <div>
        <div style="font-family: var(--font-display); font-weight: bold; color: var(--gold-light); font-size: 1.15rem;">
          ARH-MAKAN
        </div>
        <div class="text-xs text-muted">Multi-Surface Operating Suite Showroom</div>
      </div>
    </div>

    <!-- Surface Switcher Tabs -->
    <nav class="showroom-surface-selector">
      <button class="surface-tab-btn active" data-surface="customer">📱 Customer Dine-In</button>
      <button class="surface-tab-btn" data-surface="kds">👨‍🍳 Kitchen KDS</button>
      <button class="surface-tab-btn" data-surface="pos">💻 Counter POS</button>
      <button class="surface-tab-btn" data-surface="admin">📊 Owner Admin</button>
    </nav>

    <!-- Controls -->
    <div style="display: flex; align-items: center; gap: 12px;">
      <span class="text-xs mono text-muted" id="preview-title-label">Customer Dine-In Menu (Mobile)</span>
      <a id="preview-open-link" href="../customer/index.html?table=T05" target="_blank" class="btn btn-sm btn-primary">
        Open in Tab ↗
      </a>
    </div>
  </header>
```

- `showroom/showroom.css:1-40` — verbatim:

```css
/* Multi-Surface Showroom Switcher Styles */

.showroom-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #060504;
}

.showroom-topbar {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-card);
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
  z-index: 100;
}

.showroom-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.showroom-surface-selector {
  display: flex;
  background: var(--bg-surface-raised);
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-card);
  gap: 6px;
}

.surface-tab-btn {
  background: transparent;
  border: 1px solid transparent;
```

- `showroom/showroom.js:1-40` — verbatim:

```javascript
const surfaces = {
  customer: {
    url: '../customer/index.html?table=T05',
    title: 'Customer Dine-In Menu (Mobile)',
    device: 'mobile'
  },
  kds: {
    url: '../kds/index.html',
    title: 'Kitchen Display System (Landscape)',
    device: 'tablet'
  },
  pos: {
    url: '../pos/index.html',
    title: 'Counter POS Terminal (Desktop)',
    device: 'desktop'
  },
  admin: {
    url: '../admin/index.html',
    title: 'Store Owner & Operations Console',
    device: 'desktop'
  }
};

const iframe = document.getElementById('showroom-iframe');
const frame = document.getElementById('device-frame');
const label = document.getElementById('preview-title-label');
const openLink = document.getElementById('preview-open-link');

function switchSurface(surfaceKey) {
  const cfg = surfaces[surfaceKey];
  if (!cfg) return;

  // Update tabs
  document.querySelectorAll('.surface-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.surface === surfaceKey);
  });

  // Update device frame class
  frame.className = `device-frame ${cfg.device}`;

```
