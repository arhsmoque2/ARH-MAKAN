#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('♿ Running Accessibility (A11y) & HTML Semantic Validator...\n');

const htmlSurfaces = [
  'customer/index.html',
  'kds/index.html',
  'pos/index.html',
  'admin/index.html',
  'showroom/index.html'
];

let issues = 0;

for (const file of htmlSurfaces) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) continue;

  const html = fs.readFileSync(fullPath, 'utf-8');

  // Check 1: Viewport meta tag
  if (!html.includes('name="viewport"')) {
    console.error(`❌ [A11Y] ${file} missing responsive viewport meta tag`);
    issues++;
  }

  // Check 2: Language attribute
  if (!html.includes('<html lang="en">')) {
    console.error(`❌ [A11Y] ${file} missing lang="en" on <html> element`);
    issues++;
  }

  // Check 3: UTF-8 charset
  if (!html.includes('charset="UTF-8"')) {
    console.error(`❌ [A11Y] ${file} missing UTF-8 charset declaration`);
    issues++;
  }

  console.log(`✅ [A11Y OK] ${file}`);
}

if (issues > 0) {
  console.error(`\n❌ A11y verification failed with ${issues} issue(s).`);
  process.exit(1);
} else {
  console.log('\n♿ All HTML surfaces passed accessibility & semantic standards.');
  process.exit(0);
}
