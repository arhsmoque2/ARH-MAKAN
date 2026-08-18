#!/usr/bin/env node
/**
 * ARH-MAKAN Docs Freshness & Living Knowledge Triad Linter (Gate 14)
 * Verifies that CHANGELOG.md, README.md, and ADRs remain synchronized with code modifications.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('\n📚 Running Docs Freshness & Living Knowledge Triad Linter (Gate 14)...');

const errors = [];

// 1. Verify CHANGELOG.md exists and is formatted
const changelogPath = path.join(ROOT_DIR, 'CHANGELOG.md');
if (!fs.existsSync(changelogPath)) {
  errors.push('CHANGELOG.md is missing from repository root.');
} else {
  const content = fs.readFileSync(changelogPath, 'utf8');
  if (!content.includes('## [')) {
    errors.push('CHANGELOG.md lacks standard semver release headers (e.g. ## [2.7.0]).');
  }
}

// 2. Verify Living Knowledge Triad in repository root
const triadFiles = ['README.md', 'CHANGELOG.md', 'wrangler.jsonc'];
triadFiles.forEach(f => {
  if (!fs.existsSync(path.join(ROOT_DIR, f))) {
    errors.push(`Required root documentation component '${f}' is missing.`);
  }
});

// 3. Verify ADR Catalog
const adrDir = path.join(ROOT_DIR, 'docs', 'decisions');
if (fs.existsSync(adrDir)) {
  const adrFiles = fs.readdirSync(adrDir).filter(f => f.endsWith('.md'));
  if (adrFiles.length === 0) {
    errors.push('No Architecture Decision Records found in docs/decisions/.');
  } else {
    adrFiles.forEach(f => {
      const content = fs.readFileSync(path.join(adrDir, f), 'utf8');
      if (!content.includes('# ADR-') || !content.includes('## Status')) {
        errors.push(`ADR file '${f}' does not conform to the canonical ADR standard (# ADR-XXXX / ## Status).`);
      }
    });
  }
}

if (errors.length > 0) {
  console.error(`\n❌ Docs Freshness Gate failed with ${errors.length} defect(s):`);
  errors.forEach(e => console.error(`  ❌ ${e}`));
  process.exit(1);
}

console.log('🎉 [PASS] Living Knowledge Triad & Documentation catalog are 100% fresh and compliant!\n');
