/**
 * Cloudflare Worker Runtime & Fetch Integration Test Suite
 * Executes worker.mjs fetch handlers in simulated edge runtime to verify:
 * - Dynamic /api/config endpoint responses
 * - HTMLRewriter stream transformations & security headers
 * - Asset pass-through routing & fallback behaviors
 */

import worker from '../worker.mjs';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

console.log('🧪 Running Cloudflare Worker Edge Runtime Integration Tests...\n');

// Mock ASSETS fetch environment
const mockAssets = {
  fetch: async (req) => {
    const url = new URL(req.url);
    if (url.pathname === '/index.html' || url.pathname === '/') {
      return new Response('<!DOCTYPE html><html><head><title>Test Hub</title></head><body>Hub</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    if (url.pathname.endsWith('.json')) {
      return new Response('{"status":"ok"}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  }
};

// 1. Test /api/config with FIREBASE_DATABASE_URL configured
{
  console.log('1. Testing /api/config with env.FIREBASE_DATABASE_URL:');
  const req = new Request('https://arh-makan.local/api/config');
  const env = {
    FIREBASE_DATABASE_URL: 'https://test-firebase-db.firebasedatabase.app',
    ASSETS: mockAssets
  };
  const res = await worker.fetch(req, env);
  assert(res.status === 200, 'Status is 200 OK');
  assert(res.headers.get('Content-Type') === 'application/json', 'Content-Type is application/json');
  assert(res.headers.get('Access-Control-Allow-Origin') === '*', 'CORS Allow-Origin header is present');
  const data = await res.json();
  assert(data?.firebase?.url === 'https://test-firebase-db.firebasedatabase.app', 'Firebase DB URL matches configured env');
  assert(data?.firebase?.root === 'woodfire_kulim', 'Firebase root partition is woodfire_kulim');
}

// 2. Test /api/config with empty/unconfigured environment
{
  console.log('\n2. Testing /api/config with unconfigured environment (safe local fallback):');
  const req = new Request('https://arh-makan.local/api/config');
  const env = { ASSETS: mockAssets };
  const res = await worker.fetch(req, env);
  assert(res.status === 200, 'Status is 200 OK');
  const data = await res.json();
  assert(data?.firebase === null, 'Firebase config safely evaluates to null without throwing');
}

// 3. Test Root Request Routing & Security Headers
{
  console.log('\n3. Testing Root Request Routing & Security Headers:');
  const req = new Request('https://arh-makan.local/');
  const env = {
    FIREBASE_DATABASE_URL: 'https://test-firebase-db.firebasedatabase.app',
    ASSETS: mockAssets
  };
  const res = await worker.fetch(req, env);
  assert(res.status === 200, 'Root request resolves to 200 OK');
  assert(res.headers.get('X-Content-Type-Options') === 'nosniff', 'X-Content-Type-Options: nosniff header present');
  assert(res.headers.get('X-Frame-Options') === 'SAMEORIGIN', 'X-Frame-Options: SAMEORIGIN header present');
  assert(res.headers.get('Referrer-Policy') === 'strict-origin-when-cross-origin', 'Referrer-Policy header present');
}

// 4. Test Static Asset Fallback (Non-HTML)
{
  console.log('\n4. Testing Non-HTML Asset Pass-Through:');
  const req = new Request('https://arh-makan.local/shared/mock-data/menu.json');
  const env = { ASSETS: mockAssets };
  const res = await worker.fetch(req, env);
  assert(res.status === 200, 'Asset fetch returns 200 OK');
  assert(res.headers.get('Content-Type') === 'application/json', 'Content-Type preserved correctly');
}

console.log('\n========================================');
console.log(`Worker Runtime Test Results: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
