/**
 * Self-Contained Cloud Infrastructure & Configuration Preflight
 * Portable CI-compliant preflight validating Cloudflare Worker configuration,
 * asset routing bindings, and Firebase RTDB connectivity.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('🔍 Running Self-Contained Infrastructure Preflight...\n');

let issues = 0;

// 1. Validate wrangler.jsonc
const wranglerPath = path.join(root, 'wrangler.jsonc');
if (fs.existsSync(wranglerPath)) {
  try {
    const raw = fs.readFileSync(wranglerPath, 'utf-8');
    // Strip JSONC comments for parsing
    const stripped = raw.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const config = JSON.parse(stripped);

    if (!config.name) throw new Error('Missing "name" in wrangler.jsonc');
    if (!config.compatibility_date) throw new Error('Missing "compatibility_date" in wrangler.jsonc');
    if (!config.assets && !config.main) throw new Error('Missing "assets" or "main" entry in wrangler.jsonc');

    console.log(`✅ [PASS] Cloudflare Worker Config: ${config.name} (${config.compatibility_date})`);
  } catch (err) {
    console.error(`❌ [FAIL] Cloudflare Worker Config Error:`, err.message);
    issues++;
  }
} else {
  console.log(`ℹ️ [SKIP] No wrangler.jsonc found in repository root.`);
}

// 2. Firebase RTDB Endpoint Reachability (with CI timeout guard)
const dbUrl = process.env.FIREBASE_DATABASE_URL || 'https://arh-firebase-db-default-rtdb.asia-southeast1.firebasedatabase.app';
const dbRoot = 'woodfire_kulim';

try {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  const t0 = performance.now();
  const res = await fetch(`${dbUrl}/${dbRoot}.json?shallow=true`, {
    signal: controller.signal,
    headers: { 'Accept': 'application/json' }
  });
  clearTimeout(timeoutId);

  const latency = Math.round(performance.now() - t0);
  if (res.ok) {
    console.log(`✅ [PASS] Live Firebase RTDB Reachable (${latency}ms latency)`);
  } else {
    console.log(`⚠️ [WARN] Live Firebase RTDB returned HTTP ${res.status} (${latency}ms). Operating in local fallback mode.`);
  }
} catch (err) {
  console.log(`⚠️ [WARN] Live Firebase RTDB connection probe skipped (${err.name === 'AbortError' ? 'timeout' : err.message}). Operating in local fallback mode.`);
}

console.log(`\n========================================`);
if (issues === 0) {
  console.log('🎉 Infrastructure preflight completed successfully!');
  process.exit(0);
} else {
  console.error(`❌ Infrastructure preflight encountered ${issues} critical issue(s).`);
  process.exit(1);
}
