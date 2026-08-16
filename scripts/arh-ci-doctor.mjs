#!/usr/bin/env node
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('🩺 Running ARH CI Doctor for ARH-MAKAN...\n');

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

run('node scripts/check.mjs', 'Static Integrity & Schema Validation');

console.log('\n🩺 CI Doctor completed successfully.');
