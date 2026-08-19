#!/usr/bin/env node
/**
 * ARH-MAKAN Git Hook Setup Tool
 * Configures local repository git hooks path to scripts/hooks
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('⚓ Setting up ARH-MAKAN Git Quality Hooks...\n');

try {
  execSync('git config core.hooksPath scripts/hooks', { cwd: ROOT_DIR, stdio: 'inherit' });
  console.log('✅ Git hooks configured -> `scripts/hooks` is active.');
} catch (err) {
  console.error('❌ Failed to configure git hooks path:', err.message);
  process.exit(1);
}
