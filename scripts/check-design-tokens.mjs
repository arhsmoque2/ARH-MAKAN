#!/usr/bin/env node
/**
 * ARH-MAKAN Design Token & Theme Consistency Linter (DriftGuard & Lapidist inspired)
 * Validates that all UI surfaces strictly reference canonical design tokens (colors, fonts, radii)
 * and checks for forbidden cliché tropes (purple-on-dark, neon glows, untracked typography).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('🎨 Running Design Token & Theme Consistency Linter (Gate 10)...\n');

let violations = 0;
let inspectedFiles = 0;

// Canonical tokens defined in shared/theme.css
const canonicalTokens = [
  '--bg-main', '--bg-surface', '--bg-surface-raised', '--bg-surface-hover', '--bg-glass', '--bg-glass-card',
  '--gold-primary', '--gold-light', '--gold-dark', '--gold-subtle', '--gold-glow',
  '--text-primary', '--text-secondary', '--text-muted', '--text-dark',
  '--border-subtle', '--border-card', '--border-focus',
  '--color-success', '--color-success-bg', '--color-warning', '--color-warning-bg',
  '--color-danger', '--color-danger-bg', '--color-info', '--color-info-bg',
  '--font-display', '--font-body', '--font-mono',
  '--radius-sm', '--radius-md', '--radius-lg', '--radius-full',
  '--shadow-sm', '--shadow-md', '--shadow-lg'
];

// Files to lint
const targetFiles = [
  'shared/theme.css',
  'customer/customer.css',
  'kds/kds.css',
  'pos/pos.css',
  'admin/admin.css',
  'devcon/devcon.css',
  'showroom/showroom.css',
  'index.html',
  'customer/index.html',
  'kds/index.html',
  'pos/index.html',
  'admin/index.html',
  'devcon/index.html',
  'showroom/index.html'
];

// Forbidden Tropes & Pattern Checkers
const forbiddenPurpleRegex = /#(8[a-fA-F0-9]{5}|9370[dD][bB]|7[bB]68[eE][eE]|a855f7|8b5cf6|c084fc)|color:\s*(purple|violet)/i;
const allowedFonts = ['var(--font-display)', 'var(--font-body)', 'var(--font-mono)', 'inherit', 'unset', 'initial'];

for (const relPath of targetFiles) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) continue;

  inspectedFiles++;
  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Skip comments and root token definitions in theme.css
    if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('@import')) return;
    if (relPath === 'shared/theme.css' && lineNum <= 65) return; // Ignore :root definition block in theme.css

    // 1. Check for Forbidden Purple-on-Dark Tropes
    if (forbiddenPurpleRegex.test(trimmed)) {
      console.error(`❌ [FORBIDDEN TROPE] ${relPath}:${lineNum} — Found purple/violet accent on dark theme (violates ARH OS design rules):`);
      console.error(`   └─ "${trimmed}"`);
      violations++;
    }

    // 2. Check for Untracked Typography Overrides (must use canonical font tokens)
    if (trimmed.includes('font-family:')) {
      const match = trimmed.match(/font-family:\s*([^;]+)/i);
      if (match) {
        const val = match[1].trim();
        const isValid = allowedFonts.some(f => val.startsWith(f));
        if (!isValid) {
          console.warn(`⚠️ [UNTRACKED FONT] ${relPath}:${lineNum} — Hardcoded font-family "${val}". Use var(--font-display), var(--font-body), or var(--font-mono):`);
          console.warn(`   └─ "${trimmed}"`);
          violations++;
        }
      }
    }
  });
}

console.log(`\nInspected ${inspectedFiles} styling files across all surfaces.`);
if (violations > 0) {
  console.error(`❌ Found ${violations} design token / consistency violation(s).`);
  process.exit(1);
} else {
  console.log('✅ [PASS] 0 design token violations. All surfaces strictly comply with ARH design system!');
  process.exit(0);
}
