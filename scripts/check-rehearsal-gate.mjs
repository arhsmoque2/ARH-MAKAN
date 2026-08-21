#!/usr/bin/env node
/**
 * ARH-MAKAN Rehearsal Gate Verification
 * Modeled after ARH-URUS check-rehearsal-gate.mjs.
 *
 * Verifies that the full-cycle rehearsal simulator runs cleanly and updates the manifest.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('🎭 [Rehearsal Gate] Verifying Full-Cycle Store Journey...\n');

try {
  execSync('node scripts/rehearse.mjs', { cwd: ROOT_DIR, stdio: 'inherit' });
  
  const manifestPath = path.join(ROOT_DIR, '.rehearsal-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ [FAIL] .rehearsal-manifest.json was not generated.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!manifest.all_passed) {
    console.error('❌ [FAIL] Rehearsal manifest reports failed steps.');
    process.exit(1);
  }

  console.log('✅ [PASS] Rehearsal Gate passed cleanly with all journey invariants intact.');
  process.exit(0);
} catch (err) {
  console.error('❌ [FAIL] Rehearsal execution failed:', err.message);
  process.exit(1);
}
