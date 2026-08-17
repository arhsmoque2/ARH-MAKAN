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
run('node scripts/test-worker-runtime.mjs', '8. Cloudflare Worker Runtime & Edge Fetch Suite');

console.log('\n🎉 🩺 CI Doctor completed all 8 validation gates successfully!');

