#!/usr/bin/env node
/**
 * ARH-MAKAN Master CI Doctor Suite (18 Quality Gates)
 * (Equipped with best-in-class quality gates from ARH-URUS, ARH-URUS-Work, dpik-tugas-laravel, and arh-terminal)
 */

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
    console.error(err.stderr ? err.stderr.toString() : err.stdout ? err.stdout.toString() : err.message);
    process.exit(1);
  }
}

// 1. Security & Budget Gates
run('node scripts/arh-actions-budget.mjs', '1. GitHub Actions Runtime & Budget Guard');
run('node scripts/ci-asbuilt-doctor.mjs', '2. Living Knowledge Triad & As-Built Conformance');
run('node scripts/check-unguarded-inline-handlers.mjs', '3. Inline Event Handlers & DOM Sink Safety');

// 2. Static Analysis & Schema Gates
run('node scripts/check.mjs', '4. Static Integrity & Structure Validation');
run('node scripts/check-menu-schema.mjs', '5. Menu Config DriftGuard & Station Invariants');
run('node scripts/lint.mjs', '6. ESM JavaScript Syntax & Linter Gate');
run('node scripts/verify-a11y-html.mjs', '7. HTML5 & A11y Accessibility Verification');

// 3. Asset & Edge Infrastructure Gates
run('node scripts/profile-assets.mjs', '8. Performance Budget & Asset Profiler');
run('node scripts/test-showroom-bridge.mjs', '9. Showroom Bridge & Station-Routing Suite');
run('node scripts/test-qr-verify.mjs', '10. QR Code Matrix Scannability & Density Gate');
run('node scripts/verify-infra-preflight.mjs', '11. Cloud Infrastructure & Config Preflight');
run('node scripts/test-worker-runtime.mjs', '12. Cloudflare Worker Runtime & Edge Fetch Suite');

// 4. UI Design Tokens, Layout & E2E Matrix Gates
run('node scripts/check-design-tokens.mjs', '13. Design Token & Theme Consistency Linter');
run('node scripts/check-ui-integrity.mjs', '14. Multi-Viewport UI Integrity & Layout Overflow Gate');
run('node scripts/test-visual-regression.mjs', '15. Visual Regression Baseline Snapshot Gate');
run('node scripts/test-e2e-smoke.mjs', '16. E2E Interactive Runtime Smoke & Exception Gate');
run('node scripts/profile-loading-speed.mjs', '17. Browser Loading Speed & Web Vitals Profiler');
run('node scripts/check-docs-freshness.mjs', '18. Docs Freshness & Living Knowledge Triad Linter');

console.log('\n🎉 🩺 CI Doctor completed all 18 validation gates successfully!');
