#!/usr/bin/env node
/**
 * ARH-MAKAN Brand & Core Design System Integrity Gate
 * Modeled after ARH-URUS ADR-0017 brand baseline integrity standards.
 *
 * Enforces zero-drift on Woodfire brand tokens, visual theme styling,
 * QR generator, ESC/POS formatter, audio chime synthesizer, and core menu catalogs
 * by tracking deterministic SHA-256 content hashes.
 *
 * Usage:
 *   node scripts/check-brand-integrity.mjs
 *   node scripts/check-brand-integrity.mjs --update-baseline --adr ADR-0015
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const BASELINE_FILE = path.join(ROOT_DIR, '.brand-baseline.json');
const ADR_DIR = path.join(ROOT_DIR, 'docs', 'decisions');

const args = process.argv.slice(2);
const isUpdate = args.includes('--update-baseline');
const adrIdx = args.indexOf('--adr');
const adrId = adrIdx !== -1 && args[adrIdx + 1] ? args[adrIdx + 1].toUpperCase() : null;

console.log('🛡️  [Brand Integrity Gate] Auditing Woodfire Brand Assets & UI Primitives...\n');

// 1. Gather all critical brand assets & UI primitives
const trackedFilesList = [
  'shared/theme.css',
  'shared/qr-generator.js',
  'shared/realtime-adapter.js',
  'shared/audio-engine.js',
  'shared/escpos-formatter.js',
  'shared/schema.json',
  'shared/mock-data/menu.json',
  'data/menu.json',
  'customer/customer.css',
  'pos/pos.css',
  'kds/kds.css',
  'admin/admin.css'
];

function computeHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

const currentHashes = {};
for (const rel of trackedFilesList) {
  const abs = path.join(ROOT_DIR, rel);
  if (fs.existsSync(abs)) {
    currentHashes[rel.replace(/\\/g, '/')] = computeHash(abs);
  }
}

// 2. Handle Baseline Updates
if (isUpdate || !fs.existsSync(BASELINE_FILE)) {
  const governingAdr = adrId || 'ADR-0015';

  const baselineData = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    version: '1.0.0',
    governed_by: governingAdr,
    updated_at: new Date().toISOString(),
    hashes: currentHashes
  };

  fs.writeFileSync(BASELINE_FILE, JSON.stringify(baselineData, null, 2) + '\n', 'utf8');
  console.log(`✅ [UPDATED] Brand baseline written to .brand-baseline.json under ${governingAdr}.`);
  console.log(`   Tracked ${Object.keys(currentHashes).length} critical brand & core assets.`);
  process.exit(0);
}

// 3. Verify Against Baseline
const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
let mismatches = 0;

for (const [file, expectedHash] of Object.entries(baseline.hashes)) {
  const actualHash = currentHashes[file];
  if (!actualHash) {
    console.error(`❌ [MISSING ASSET] Tracked brand asset no longer exists: ${file}`);
    mismatches++;
  } else if (actualHash !== expectedHash) {
    console.error(`❌ [BRAND DRIFT] Content changed in: ${file}`);
    console.error(`   Expected: ${expectedHash.slice(0, 16)}...`);
    console.error(`   Actual:   ${actualHash.slice(0, 16)}...`);
    mismatches++;
  } else {
    console.log(`   ✅ ${file} (SHA: ${actualHash.slice(0, 8)}...)`);
  }
}

console.log('\n===========================================================');
if (mismatches > 0) {
  console.error(`❌ [FAIL] Brand integrity violated with ${mismatches} drift(s).`);
  console.error(`   To intentionally update brand assets, run:`);
  console.error(`   node scripts/check-brand-integrity.mjs --update-baseline --adr ADR-XXXX`);
  process.exit(1);
} else {
  console.log(`🎉 [PASS] All ${Object.keys(baseline.hashes).length} brand assets matched baseline lock perfectly!`);
  process.exit(0);
}
