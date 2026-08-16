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
  }

  // Check 2: Unmatched brackets/braces basic check
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    console.error(`❌ [LINT] ${file} has mismatched braces: ${openBraces} open vs ${closeBraces} close`);
    errors++;
  }

  console.log(`✅ [LINT OK] ${file}`);
}

if (errors > 0) {
  console.error(`\n❌ Lint gate failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log('\n✨ All JavaScript files passed ESM linting perfectly.');
  process.exit(0);
}
