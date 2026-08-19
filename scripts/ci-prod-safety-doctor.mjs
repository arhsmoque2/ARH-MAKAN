#!/usr/bin/env node
/**
 * ARH-MAKAN Production Deployment & Safety Preflight Doctor
 * Modeled after ARH-URUS production safety doctor standards.
 *
 * Validates:
 * 1. Cloudflare Edge Worker & Pages configuration safety (wrangler.jsonc)
 * 2. Secrets & Live Credential Leak Prevention
 * 3. Security Headers Invariants (nosniff, sameorigin, referrer-policy)
 * 4. Asset Budget Ceilings & Payload Integrity
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('🚀 [Prod Safety Doctor] Running Deployment & Edge Safety Preflight Audit...\n');

let failed = false;

// 1. Cloudflare Wrangler Configurations Audit
const wranglerFiles = [
  path.join(ROOT_DIR, 'wrangler.jsonc'),
  path.join(ROOT_DIR, 'wrangler.toml'),
  path.join(ROOT_DIR, 'customer', 'wrangler.jsonc'),
  path.join(ROOT_DIR, 'pos', 'wrangler.jsonc'),
  path.join(ROOT_DIR, 'kds', 'wrangler.jsonc'),
  path.join(ROOT_DIR, 'admin', 'wrangler.jsonc')
];

let wranglerFound = false;
for (const wf of wranglerFiles) {
  if (fs.existsSync(wf)) {
    wranglerFound = true;
    const text = fs.readFileSync(wf, 'utf8');
    
    // Safety check: ensure compatibility date is set
    if (!text.includes('compatibility_date') && !text.includes('compatibility-date')) {
      console.error(`❌ [FAIL] ${path.basename(wf)} missing required compatibility_date!`);
      failed = true;
    }
    
    // Check for hardcoded API keys
    if (/(?:CLOUDFLARE_API_TOKEN|FIREBASE_SECRET|STRIPE_KEY|AUTH_SECRET)=["'][^"']+["']/i.test(text)) {
      console.error(`❌ [FAIL] Live secret detected in ${path.basename(wf)}!`);
      failed = true;
    }
  }
}

if (!wranglerFound) {
  console.error('❌ [FAIL] No wrangler configuration found!');
  failed = true;
} else {
  console.log('✅ [PASS] Cloudflare Edge Worker configurations validated safely.');
}

// 2. Secret & Credential Leak Scanning across codebase
const suspiciousPatterns = [
  { name: 'Live OpenAI / Claude Key', regex: new RegExp('sk-(?:live|ant|proj)-[A-Za-z0-9_-]{20,}') },
  { name: 'Live Cloudflare Token', regex: new RegExp('(?:cf_api_|cloudflare_token\\s*=\\s*)[a-zA-Z0-9_-]{30,}', 'i') },
  { name: 'Live Stripe Secret Key', regex: new RegExp('sk_live_[0-9a-zA-Z]{24}') },
  { name: 'Unredacted Bearer Header', regex: new RegExp('Authorization:\\s*Bearer\\s+(?!\\{\\{)[A-Za-z0-9_\\-\\.]+\\{30,\\}', 'i') }
];

const scanDirs = ['customer', 'pos', 'kds', 'admin', 'shared', 'scripts'];
for (const dir of scanDirs) {
  const fullDir = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(fullDir)) continue;

  const files = fs.readdirSync(fullDir, { recursive: true, withFileTypes: true })
    .filter(d => d.isFile() && (d.name.endsWith('.js') || d.name.endsWith('.mjs') || d.name.endsWith('.html') || d.name.endsWith('.json')));

  for (const file of files) {
    const filePath = path.join(file.parentPath || fullDir, file.name);
    const content = fs.readFileSync(filePath, 'utf8');
    for (const pat of suspiciousPatterns) {
      if (pat.regex.test(content)) {
        console.error(`❌ [FAIL] Potential leak (${pat.name}) in ${path.relative(ROOT_DIR, filePath)}`);
        failed = true;
      }
    }
  }
}

if (!failed) {
  console.log('✅ [PASS] Clean codebase: 0 live secrets or credentials detected.');
}

// 3. Worker Runtime Security Headers Verification
const workerPath = path.join(ROOT_DIR, 'worker.mjs');
if (fs.existsSync(workerPath)) {
  const workerCode = fs.readFileSync(workerPath, 'utf8');
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy'
  ];

  for (const hdr of requiredHeaders) {
    if (!workerCode.includes(hdr)) {
      console.error(`❌ [FAIL] Worker missing mandatory security header: ${hdr}`);
      failed = true;
    }
  }
  if (!failed) {
    console.log('✅ [PASS] Worker security headers (nosniff, sameorigin, referrer-policy) verified.');
  }
}

// 4. Asset Budget Ceiling Check
const MAX_SINGLE_ASSET_KB = 500; // 500KB max per static module
const allStaticFiles = [
  'shared/theme.css',
  'shared/qr-generator.js',
  'shared/realtime-adapter.js',
  'customer/customer.js',
  'pos/pos.js',
  'kds/kds.js',
  'admin/admin.js'
];

for (const rel of allStaticFiles) {
  const p = path.join(ROOT_DIR, rel);
  if (fs.existsSync(p)) {
    const sizeKb = fs.statSync(p).size / 1024;
    if (sizeKb > MAX_SINGLE_ASSET_KB) {
      console.error(`❌ [FAIL] Asset ${rel} (${sizeKb.toFixed(1)} KB) exceeds budget ceiling (${MAX_SINGLE_ASSET_KB} KB)!`);
      failed = true;
    }
  }
}

if (!failed) {
  console.log('✅ [PASS] All static assets inspected within strict budget ceilings.');
}

console.log('\n===========================================================');
if (failed) {
  console.error('❌ [FAIL] Production Safety Doctor identified deployment risks.');
  process.exit(1);
} else {
  console.log('🎉 [PASS] All Production Safety & Preflight checks passed cleanly!');
  process.exit(0);
}
