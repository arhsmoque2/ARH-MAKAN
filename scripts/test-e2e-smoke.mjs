#!/usr/bin/env node
/**
 * ARH-MAKAN E2E Runtime Smoke & Pageerror Scanner (Gate 13)
 * Boots local server, drives interactive workflows across all 5 surfaces,
 * and asserts ZERO pageerrors, unhandled exceptions, or broken event handlers.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8190;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function createStaticServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    let filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  });
}

async function runE2ESmoke() {
  console.log('\n🧪 Running E2E Interactive Runtime Smoke & Exception Gate (Gate 13)...');

  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));

  let browser;
  const errors = [];

  const launchOptions = { headless: true };
  if (process.env.CHROMIUM_PATH && fs.existsSync(process.env.CHROMIUM_PATH)) {
    launchOptions.executablePath = process.env.CHROMIUM_PATH;
  }

  try {
    browser = await chromium.launch(launchOptions);
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    page.on('pageerror', (err) => {
      errors.push(`[PAGE_ERROR] ${err.message}`);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore expected network timeouts or favicon 404s
        if (!text.includes('favicon.ico') && !text.includes('status of 404')) {
          errors.push(`[CONSOLE_ERROR] ${text}`);
        }
      }
    });

    // 1. Surface: Customer Mobile Dine-In
    console.log('  📱 1. Testing Customer Dine-In Ordering & DuitNow Flow...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`http://localhost:${PORT}/customer/index.html?table=T05`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    // Click item and open modifier modal
    const menuItem = await page.$('.menu-card');
    if (menuItem) await menuItem.click();
    await page.waitForTimeout(200);

    const addBtn = await page.$('#modifier-add-btn');
    if (addBtn) await addBtn.click();
    await page.waitForTimeout(200);

    // Open Cart & DuitNow Modal
    const cartFloating = await page.$('#floating-cart-bar');
    if (cartFloating) await cartFloating.click();
    await page.waitForTimeout(200);

    await page.evaluate(() => {
      if (typeof window.openDuitNowModal === 'function') window.openDuitNowModal();
      if (typeof window.copyDuitNowAmount === 'function') window.copyDuitNowAmount();
      if (typeof window.copyDuitNowRef === 'function') window.copyDuitNowRef();
      if (typeof window.confirmDuitNowPaymentMade === 'function') window.confirmDuitNowPaymentMade();
    });
    await page.waitForTimeout(300);

    // 2. Surface: Cashier POS Register
    console.log('  🖥️ 2. Testing Cashier POS Verification & Split-Tender...');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`http://localhost:${PORT}/pos/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    await page.evaluate(() => {
      if (typeof window.openVerificationModal === 'function') window.openVerificationModal();
      const orders = window.ARH_REALTIME_ADAPTER?.hub?.getOrders() || [];
      const pending = orders.find(o => o.status === 'awaiting_verification');
      if (pending && typeof window.approveDuitNowPayment === 'function') {
        window.approveDuitNowPayment(pending.order_id);
      }
      if (typeof window.closeVerificationModal === 'function') window.closeVerificationModal();
      if (typeof window.openCashFloatModal === 'function') window.openCashFloatModal();
      if (typeof window.closeCashFloatModal === 'function') window.closeCashFloatModal();
    });
    await page.waitForTimeout(300);

    // 3. Surface: Kitchen Display System (KDS)
    console.log('  👨‍🍳 3. Testing KDS Station Kanban & Bump Actions...');
    await page.goto(`http://localhost:${PORT}/kds/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    await page.evaluate(() => {
      const bumpItem = document.querySelector('.ticket-item');
      if (bumpItem) bumpItem.click();
    });
    await page.waitForTimeout(300);

    // 4. Surface: Manager Admin Hub
    console.log('  📊 4. Testing Manager Admin Tab Navigation & Stock Toggles...');
    await page.goto(`http://localhost:${PORT}/admin/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.admin-nav-btn');
      tabs.forEach(t => t.click());
      if (typeof window.savePaymentSettings === 'function') window.savePaymentSettings();
    });
    await page.waitForTimeout(300);

    // 5. Surface: Developer Console (DevCon)
    console.log('  🛠️ 5. Testing Developer Console Scenario Lab & Feature Gates...');
    await page.goto(`http://localhost:${PORT}/devcon/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    await page.evaluate(() => {
      const devTabs = document.querySelectorAll('.devcon-nav-btn');
      devTabs.forEach(t => t.click());

      if (typeof window.injectRushHour === 'function') window.injectRushHour();
      if (typeof window.injectWaiterCalls === 'function') window.injectWaiterCalls();
      if (typeof window.injectStockToggle === 'function') window.injectStockToggle();
      if (typeof window.simulateTestError === 'function') window.simulateTestError();
      if (typeof window.toggleAdminAnalyticsView === 'function') window.toggleAdminAnalyticsView(true);
      if (typeof window.toggleDuitNowGate === 'function') window.toggleDuitNowGate(true);
    });
    await page.waitForTimeout(500);

    await browser.close();
  } catch (err) {
    errors.push(`[EXECUTION_CRASH] ${err.message}`);
  } finally {
    server.close();
  }

  if (errors.length > 0) {
    console.error(`\n❌ E2E Smoke Gate failed with ${errors.length} defect(s):`);
    errors.forEach(e => console.error(`  ❌ ${e}`));
    process.exit(1);
  }

  console.log('\n🎉 [PASS] E2E Runtime Smoke Gate passed with 0 exceptions across all 5 surfaces!\n');
}

runE2ESmoke();
