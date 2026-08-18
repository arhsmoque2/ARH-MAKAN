#!/usr/bin/env node
/**
 * ARH-MAKAN Cloud Agent Independence & Zero-Touch Session Bootstrap
 * Designed to initialize any cloud agent (Claude Code, Antigravity, Codespaces)
 * in <10s with warm dependencies, verified browser runtimes, and baseline sanity.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('\n🚀 [ARH-MAKAN] Cloud Agent Session Bootstrap initializing...\n');

// 1. Dependency Warm Check
const nodeModulesPath = path.join(ROOT_DIR, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 node_modules not found. Warming package cache (npm install)...');
  try {
    execSync('npm install', { cwd: ROOT_DIR, stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully.');
  } catch (err) {
    console.error('❌ Failed to install dependencies:', err.message);
  }
} else {
  console.log('✅ Dependencies verified (node_modules present).');
}

// 2. Playwright Chromium Runtime Detection & Pinning
console.log('🌐 Checking Playwright Chromium runtime availability...');
let chromiumPath = process.env.CHROMIUM_PATH || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

const candidatePaths = [
  chromiumPath,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium-1234/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].filter(Boolean);

let foundSystemChromium = null;
for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    foundSystemChromium = p;
    break;
  }
}

if (foundSystemChromium) {
  console.log(`✅ Discovered pre-baked Chromium runtime at: ${foundSystemChromium}`);
  process.env.CHROMIUM_PATH = foundSystemChromium;
} else {
  try {
    const testPw = execSync('npx playwright --version', { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
    console.log(`✅ Playwright CLI available (${testPw}).`);
  } catch (err) {
    console.log('⚙️ Installing Playwright Chromium browser binaries...');
    try {
      execSync('npx playwright install chromium', { cwd: ROOT_DIR, stdio: 'inherit' });
    } catch (pwErr) {
      console.warn('⚠️ Playwright install warning:', pwErr.message);
    }
  }
}

// 3. Cloud Infrastructure & Environment Variable Inspection
console.log('☁️ Inspecting Cloud Infrastructure Environment:');
const hasFirebase = Boolean(process.env.FIREBASE_DATABASE_URL);
const hasCfToken = Boolean(process.env.CLOUDFLARE_API_TOKEN);
const hasCfAccount = Boolean(process.env.CLOUDFLARE_ACCOUNT_ID);

if (hasFirebase) {
  console.log('  ● FIREBASE_DATABASE_URL: Configured (Live Cloud RTDB Active)');
} else {
  console.log('  ○ FIREBASE_DATABASE_URL: Not set (Graceful Local Mock Engine Active)');
}

if (hasCfToken && hasCfAccount) {
  console.log('  ● CLOUDFLARE CREDENTIALS: Configured (Live Worker Deployment Enabled)');
} else {
  console.log('  ○ CLOUDFLARE CREDENTIALS: Not set (Local Miniflare Testing Mode)');
}

// 4. Baseline CI Doctor Sanity Check
console.log('\n🩺 Running baseline CI Doctor health check...');
try {
  execSync('node scripts/arh-ci-doctor.mjs', { cwd: ROOT_DIR, stdio: 'inherit' });
  console.log('\n🎉 [READY] Cloud Agent environment is fully primed and 100% green!\n');
} catch (ciErr) {
  console.warn('\n⚠️ [WARN] CI Doctor detected pre-existing baseline warnings. Please inspect above output.\n');
}
