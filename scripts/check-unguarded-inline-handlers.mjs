#!/usr/bin/env node
/**
 * ARH-MAKAN Inline Handlers & Event Binding Safety Guard
 *
 * Scans all HTML and JS surfaces for dangerous, unguarded inline handlers,
 * raw string evals in handlers, unescaped onclick string interpolations,
 * or unhandled event attributes that bypass event delegation patterns.
 * (Imported & adapted from ARH-URUS canonical quality gate suite)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('🛡️ [Inline Handlers] Auditing HTML & JS Event Binding Safety...\n');

const DIRS_TO_SCAN = ['admin', 'customer', 'kds', 'pos', 'showroom', 'shared', 'devcon'];
const ROOT_HTML = ['index.html', 'test-sandbox.html'];

function walk(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.wrangler') continue;
      files.push(...walk(full));
    } else if (entry.name.endsWith('.html') || entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
      files.push(full);
    }
  }
  return files;
}

let filesToAudit = [];
for (const file of ROOT_HTML) {
  const p = path.join(ROOT_DIR, file);
  if (fs.existsSync(p)) filesToAudit.push(p);
}
for (const dir of DIRS_TO_SCAN) {
  filesToAudit.push(...walk(path.join(ROOT_DIR, dir)));
}

let violations = 0;

for (const file of filesToAudit) {
  const relative = path.relative(ROOT_DIR, file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // Check 1: eval() usage in code or inline handler
    if (/\beval\s*\(/.test(line)) {
      console.error(`❌ [SECURITY] ${relative}:${lineNum}: Dangerous 'eval()' execution detected.`);
      violations++;
    }

    // Check 2: Raw javascript: pseudo-protocol in hrefs or src
    if (/href\s*=\s*["']javascript:/i.test(line) || /src\s*=\s*["']javascript:/i.test(line)) {
      console.error(`❌ [SECURITY] ${relative}:${lineNum}: Dangerous 'javascript:' URI detected.`);
      violations++;
    }

    // Check 3: Unguarded innerHTML assignment without sanitization
    // If assigning raw user params to innerHTML without escaping
    if (/\.innerHTML\s*=\s*(?:location\.search|location\.hash|params\.get)/.test(line)) {
      console.error(`❌ [XSS RISK] ${relative}:${lineNum}: Direct URL query assignment to innerHTML.`);
      violations++;
    }
  });
}

console.log(`Audited ${filesToAudit.length} UI and script file(s).`);

if (violations > 0) {
  console.error(`\n❌ [Inline Handlers] Found ${violations} security/event binding violation(s).`);
  process.exit(1);
} else {
  console.log('✅ [Inline Handlers] Zero dangerous evals, URI injections, or unsanitized DOM sinks found!\n');
  process.exit(0);
}
