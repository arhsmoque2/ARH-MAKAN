#!/usr/bin/env node
/**
 * ARH-MAKAN GitHub Actions Runtime & Budget Doctor
 *
 * Audits all workflow files in .github/workflows/ to prevent runaway Action minutes,
 * enforcing strict timeout ceilings, concurrency cancellation, and minimal permission scopes.
 * (Imported & adapted from ARH-URUS & dpik-tugas-laravel canonical quality suites)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WORKFLOWS_DIR = path.join(ROOT_DIR, '.github', 'workflows');

console.log('⚡ [Actions Budget] Auditing GitHub Actions Workflows...\n');

if (!fs.existsSync(WORKFLOWS_DIR)) {
  console.log('No .github/workflows directory found.');
  process.exit(0);
}

const files = fs
  .readdirSync(WORKFLOWS_DIR)
  .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
let issues = 0;

for (const file of files) {
  const fullPath = path.join(WORKFLOWS_DIR, file);
  const content = fs.readFileSync(fullPath, 'utf8');

  console.log(`Auditing ${file}...`);

  // Check 1: Timeout ceiling present on jobs
  if (!content.includes('timeout-minutes:') && !content.includes('workflow_dispatch')) {
    console.warn(`⚠️ [BUDGET RISK] ${file}: Missing explicit 'timeout-minutes:' ceiling on jobs.`);
    issues++;
  }

  // Check 2: Concurrency group with cancel-in-progress on automated workflows
  if (content.includes('pull_request:') || content.includes('push:')) {
    if (!content.includes('concurrency:') || !content.includes('cancel-in-progress: true')) {
      console.warn(
        `⚠️ [BUDGET RISK] ${file}: Missing 'concurrency' with 'cancel-in-progress: true' to cancel outdated runs.`,
      );
      issues++;
    }
  }

  // Check 3: Permission least privilege
  if (!content.includes('permissions:')) {
    console.warn(`ℹ️ [SECURITY] ${file}: Consider adding top-level 'permissions: contents: read'.`);
  }

  console.log(`   ✅ ${file} audited.`);
}

console.log('\n========================================');
console.log(
  `Audited ${files.length} workflow file(s). ${issues === 0 ? 'All timeout & concurrency checks passed cleanly.' : `${issues} advisory note(s).`}\n`,
);

if (issues > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
