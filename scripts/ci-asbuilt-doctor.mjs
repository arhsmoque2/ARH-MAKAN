#!/usr/bin/env node
/**
 * ARH-MAKAN As-Built & Documentation Conformance Doctor
 *
 * Verifies that the ARH Standard Documentation Suite (10 files) and Architecture Decision Records (ADRs)
 * are complete, non-empty, and compliant with ARH Agent OS standards.
 * Modeled after ARH-URUS ci-asbuilt-doctor.mjs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('📚 [As-Built Doctor] Running ARH Standard Documentation Suite & ADR Audit...\n');

let issues = 0;

// 1. Check Mandatory 10 ARH Documentation Convention Files
const requiredDocs = [
  'README.md',
  'ARCHITECTURE.md',
  'CHANGELOG.md',
  'CURRENT_STATE.md',
  'GOTCHAS.md',
  'RECIPES.md',
  'HANDOFF.md',
  'AGENTS.md',
  'asbuilt.md',
  'gaps-to-revisit.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'wrangler.jsonc',
];

console.log('1. Auditing ARH Documentation Convention Suite...');
for (const doc of requiredDocs) {
  const p = path.join(ROOT_DIR, doc);
  if (!fs.existsSync(p)) {
    console.error(`❌ [MISSING DOC] ${doc} is required by ARH Documentation Convention standard.`);
    issues++;
  } else {
    const stat = fs.statSync(p);
    if (stat.size < 50) {
      console.error(`❌ [EMPTY DOC] ${doc} exists but is unexpectedly small (${stat.size} bytes).`);
      issues++;
    } else {
      console.log(`   ✅ ${doc} (${(stat.size / 1024).toFixed(1)} KB)`);
    }
  }
}

// 2. Check ADR Index Completeness & Status Headers
console.log('\n2. Auditing Architecture Decision Records (ADRs)...');
const adrDir = path.join(ROOT_DIR, 'docs', 'decisions');
const adrIndex = path.join(adrDir, 'README.md');

if (!fs.existsSync(adrIndex)) {
  console.error(`❌ [MISSING ADR INDEX] docs/decisions/README.md is missing.`);
  issues++;
} else {
  const indexContent = fs.readFileSync(adrIndex, 'utf8');
  const files = fs.readdirSync(adrDir).filter((f) => f.match(/^\d{4}-.*\.md$/));

  console.log(`   Discovered ${files.length} ADR files in docs/decisions/`);

  for (const adrFile of files) {
    const content = fs.readFileSync(path.join(adrDir, adrFile), 'utf8');
    const numMatch = adrFile.match(/^(\d{4})/);
    
    // Header validation
    if (!content.includes('## Status') && !content.includes('**Status**:') && !content.includes('Status:')) {
      console.error(`❌ [INVALID ADR HEADER] ${adrFile} is missing a valid Status header.`);
      issues++;
    }

    if (numMatch) {
      const num = numMatch[1];
      if (!indexContent.includes(num)) {
        console.error(`❌ [UNINDEXED ADR] ${adrFile} is not registered in docs/decisions/README.md`);
        issues++;
      } else {
        console.log(`   ✅ [ADR-${num}] Indexed & Verified -> ${adrFile}`);
      }
    }
  }
}

// 3. Hygiene check: No loose temp/scratch files in root
console.log('\n3. Auditing repository root hygiene...');
const forbiddenRootPatterns = [/\.bak$/, /\.tmp$/, /\.swp$/, /^temp_/, /^test_scratch/];

const rootFiles = fs.readdirSync(ROOT_DIR);
for (const file of rootFiles) {
  for (const pat of forbiddenRootPatterns) {
    if (pat.test(file)) {
      console.error(`❌ [DIRTY ROOT] Stray transient artifact found: ${file}`);
      issues++;
    }
  }
}

console.log(`\n========================================`);
if (issues > 0) {
  console.error(`❌ [As-Built Doctor] Audit failed with ${issues} documentation/hygiene issue(s).\n`);
  process.exit(1);
} else {
  console.log(`🎉 [As-Built Doctor] All documentation and ADR invariants verified cleanly!\n`);
  process.exit(0);
}
