#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('⚡ ARH-MAKAN Asset Budget & Performance Profiler\n');

// Budget SLA in KB (Gzipped)
const BUDGETS = {
  'shared/theme.css': 8,
  'shared/realtime-adapter.js': 5,
  'customer/index.html': 10,
  'kds/index.html': 10,
  'pos/index.html': 10,
  'admin/index.html': 10,
  'showroom/index.html': 10
};

let totalRaw = 0;
let totalGzip = 0;
let violations = 0;

console.log('File'.padEnd(35) + 'Raw Size'.padEnd(14) + 'Gzip Size'.padEnd(14) + 'Budget (Gzip)');
console.log('-'.repeat(75));

for (const [relPath, budgetKb] of Object.entries(BUDGETS)) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${relPath.padEnd(32)} [NOT FOUND]`);
    continue;
  }

  const content = fs.readFileSync(fullPath);
  const rawBytes = content.length;
  const gzipBytes = zlib.gzipSync(content).length;

  const rawKb = (rawBytes / 1024).toFixed(2) + ' KB';
  const gzipKb = (gzipBytes / 1024).toFixed(2) + ' KB';
  const budgetStr = budgetKb + ' KB';

  totalRaw += rawBytes;
  totalGzip += gzipBytes;

  const isOver = (gzipBytes / 1024) > budgetKb;
  if (isOver) violations++;

  const status = isOver ? '❌ OVER BUDGET' : '✅ OK';
  console.log(`${relPath.padEnd(35)}${rawKb.padEnd(14)}${gzipKb.padEnd(14)}${budgetStr.padEnd(10)} ${status}`);
}

console.log('-'.repeat(75));
console.log(`Total Core Assets: ${(totalRaw / 1024).toFixed(2)} KB Raw | ${(totalGzip / 1024).toFixed(2)} KB Gzip`);

if (violations > 0) {
  console.error(`\n❌ Budget check failed with ${violations} violation(s).`);
  process.exit(1);
} else {
  console.log('\n🚀 Performance & Asset Budgets PASSED! Super-fast instant edge delivery confirmed.');
  process.exit(0);
}
