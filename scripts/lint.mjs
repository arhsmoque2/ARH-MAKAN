#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';

console.log('🧹 Running ARH-MAKAN ESM Syntax & Linter Gate (node --check & AST Rules)...\n');

function walk(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.wrangler') continue;
      files.push(...walk(full));
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
      files.push(full);
    }
  }
  return files;
}

const jsFiles = walk(root);
let errors = 0;

for (const fullPath of jsFiles) {
  const file = path.relative(root, fullPath);
  const content = fs.readFileSync(fullPath, 'utf-8');

  // Check 1: Forbidden debugger statements
  if (/^\s*debugger\s*;/m.test(content)) {
    console.error(`❌ [LINT] ${file} contains forbidden 'debugger;' statement`);
    errors++;
    continue;
  }

  // Check 2: Native Node.js ESM compilation & syntax verification
  try {
    execSync(`node --check "${fullPath}"`, { stdio: 'pipe', encoding: 'utf-8', shell: isWin });
    console.log(`✅ [LINT OK] ${file}`);
  } catch (err) {
    console.error(`❌ [SYNTAX ERROR] ${file}:`);
    console.error((err.stderr || err.stdout || err.message).trim());
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n❌ Lint gate failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log(`\n✨ All ${jsFiles.length} JavaScript / ESM files verified syntax-clean!`);
  process.exit(0);
}
