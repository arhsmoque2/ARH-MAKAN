#!/usr/bin/env node
/**
 * ARH-MAKAN Enterprise Multi-Dimensional Quality Gate & Scorecard
 * Modeled after ARH-URUS arh-quality-gate.mjs.
 *
 * Synthesizes:
 * 1. Multi-Dimensional Scorecard (0-100 score + A+ through F letter grades)
 * 2. Secrets & Live Credential Leak Scanning (Secretlint + Safety Doctor)
 * 3. Brand & Core Design System Baseline Lock (ADR-0015 SHA-256 integrity)
 * 4. As-Built Living Knowledge Triad (10 standard doc files + 15 ADRs)
 * 5. Full Lifecycle Rehearsal Simulator & .rehearsal-manifest.json
 * 6. Cloudflare Worker Runtime & Security Headers Preflight
 * 7. Multi-Viewport Layout Integrity & Playwright E2E Multi-Surface Smoke
 */

import { execSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';

const dimensions = [
  { id: 'asbuilt', name: '1. As-Built Documentation & ADR Index Conformance', cmd: 'node scripts/ci-asbuilt-doctor.mjs', weight: 5 },
  { id: 'brand_lock', name: '2. Brand & Core Component Baseline Lock (ADR-0015)', cmd: 'node scripts/check-brand-integrity.mjs', weight: 5 },
  { id: 'prod_safety', name: '3. Production Safety & Secrets Preflight Doctor', cmd: 'node scripts/ci-prod-safety-doctor.mjs', weight: 5 },
  { id: 'rehearsal', name: '4. Full-Cycle Store Journey Rehearsal Gate', cmd: 'node scripts/check-rehearsal-gate.mjs', weight: 5 },
  { id: 'static_check', name: '5. Static Structure & File Integrity', cmd: 'node scripts/check.mjs', weight: 5 },
  { id: 'menu_schema', name: '6. Menu Schema & Station Routing Invariants', cmd: 'node scripts/check-menu-schema.mjs', weight: 5 },
  { id: 'lint_esm', name: '7. ESM JavaScript Syntax & Linting Gate', cmd: 'node scripts/lint.mjs', weight: 5 },
  { id: 'a11y', name: '8. HTML5 & WCAG A11y Accessibility Verification', cmd: 'node scripts/verify-a11y-html.mjs', weight: 5 },
  { id: 'tokens', name: '9. Design Token & Theme DriftGuard Linter', cmd: 'node scripts/check-design-tokens.mjs', weight: 5 },
  { id: 'inline_handlers', name: '10. Inline Event Handlers & DOM Sink Safety', cmd: 'node scripts/check-unguarded-inline-handlers.mjs', weight: 5 },
  { id: 'assets', name: '11. Performance Budget & Asset Profiler', cmd: 'node scripts/profile-assets.mjs', weight: 5 },
  { id: 'loading_speed', name: '12. Browser Loading Speed & Web Vitals SLA', cmd: 'node scripts/profile-loading-speed.mjs', weight: 5 },
  { id: 'showroom_bridge', name: '13. Showroom Bridge & Cross-Surface Router', cmd: 'node scripts/test-showroom-bridge.mjs', weight: 5 },
  { id: 'qr_matrix', name: '14. ISO/IEC 18004 QR Matrix Scannability Gate', cmd: 'node scripts/test-qr-verify.mjs', weight: 5 },
  { id: 'infra_preflight', name: '15. Cloud Infrastructure & Config Preflight', cmd: 'node scripts/verify-infra-preflight.mjs', weight: 5 },
  { id: 'worker_runtime', name: '16. Cloudflare Worker Runtime & Edge Fetch Suite', cmd: 'node scripts/test-worker-runtime.mjs', weight: 5 },
  { id: 'layout_overflow', name: '17. Multi-Viewport Layout Overflow Gate', cmd: 'node scripts/check-ui-integrity.mjs', weight: 5 },
  { id: 'visual_regression', name: '18. Visual Regression Baseline Snapshot Gate', cmd: 'node scripts/test-visual-regression.mjs', weight: 5 },
  { id: 'e2e_smoke', name: '19. E2E Multi-Surface Interactive Runtime Smoke', cmd: 'node scripts/test-e2e-smoke.mjs', weight: 5 },
  { id: 'docs_freshness', name: '20. Docs Freshness & Living Knowledge Triad', cmd: 'node scripts/check-docs-freshness.mjs', weight: 5 },
];

console.log('🛡️  ARH-MAKAN Enterprise Multi-Dimensional Quality Gate');
console.log('===========================================================\n');

let totalEarned = 0;
let totalPossible = 0;
let allPassed = true;
const results = [];

const startTime = performance.now();

for (const dim of dimensions) {
  process.stdout.write(`  ⏳ Auditing [${dim.name}]... `);
  const stepStart = performance.now();
  totalPossible += dim.weight;

  try {
    execSync(dim.cmd, { cwd: root, stdio: 'pipe', encoding: 'utf-8', shell: isWin });
    const duration = Math.round(performance.now() - stepStart);
    console.log(`✅ PASS (${duration}ms) [${dim.weight}/${dim.weight} pts]`);
    totalEarned += dim.weight;
    results.push({ name: dim.name, status: 'PASS', score: dim.weight, max: dim.weight, durationMs: duration });
  } catch (err) {
    const duration = Math.round(performance.now() - stepStart);
    console.log(`❌ FAIL (${duration}ms) [0/${dim.weight} pts]`);
    allPassed = false;
    const output = (err.stdout || err.stderr || err.message || '').trim();
    results.push({ name: dim.name, status: 'FAIL', score: 0, max: dim.weight, durationMs: duration, error: output });
    if (output) {
      console.log(`     └─ ${output.split('\n').slice(-4).join('\n     └─ ')}`);
    }
  }
}

const totalDuration = ((performance.now() - startTime) / 1000).toFixed(2);
const finalScore = Math.round((totalEarned / totalPossible) * 100);

let grade = 'F';
if (finalScore >= 95) grade = 'A+';
else if (finalScore >= 90) grade = 'A';
else if (finalScore >= 80) grade = 'B';
else if (finalScore >= 70) grade = 'C';
else if (finalScore >= 60) grade = 'D';

console.log('\n===========================================================');
console.log(`📊 Quality Score: ${finalScore}/100 (Grade: ${grade}) | Total Time: ${totalDuration}s`);
console.log('===========================================================\n');

if (!allPassed) {
  console.error(`❌ Quality gate failed. Resolve failing invariants above before deployment.`);
  process.exit(1);
} else {
  console.log(`🎉 [SUCCESS] All ${dimensions.length} quality dimensions verified clean! Production ready.`);
  process.exit(0);
}
