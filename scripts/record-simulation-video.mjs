#!/usr/bin/env node
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const recordingsDir = path.join(root, 'evidence', 'recordings');

if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}

console.log('🎬 Starting Multi-Surface Simulation Video Recorder...\n');

// 1. Lightweight Static Server
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(root, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'text/plain',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}`;
console.log(`📡 Local preview server running at ${baseUrl}`);

// 2. Launch Playwright with Video Capture
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: {
    dir: recordingsDir,
    size: { width: 1440, height: 900 }
  }
});

const page = await context.newPage();

try {
  console.log('📱 Navigating to Multi-Surface Living Sandbox...');
  await page.goto(`${baseUrl}/test-sandbox.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. Click Rush Hour Wave Scenario Trigger
  console.log('⚡ Injecting Rush Hour Wave (4 concurrent table orders)...');
  await page.evaluate(() => {
    if (window.triggerRushHourWave) window.triggerRushHourWave();
  });
  await page.waitForTimeout(3000);

  // 2. Click KDS Bump Button inside the sandbox iframe if available
  console.log('👨‍🍳 Interacting with Kitchen Display (Bumping tickets)...');
  await page.evaluate(() => {
    const kdsIframe = document.querySelector('iframe[src*="kds"]');
    if (kdsIframe && kdsIframe.contentWindow) {
      const bumpBtn = kdsIframe.contentDocument.querySelector('.ticket-card button, .btn-sm');
      if (bumpBtn) bumpBtn.click();
    }
  });
  await page.waitForTimeout(2000);

  // 3. Navigate to Customer Dine-In Menu
  console.log('🍔 Rehearsing Customer Mobile Dine-In (?table=T05)...');
  await page.goto(`${baseUrl}/customer/index.html?table=T05`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Select Gourmet Burger and open modal
  await page.evaluate(() => {
    const firstCard = document.querySelector('.menu-card');
    if (firstCard) firstCard.click();
  });
  await page.waitForTimeout(1500);

  // Confirm and Add to cart
  await page.evaluate(() => {
    const confirmBtn = document.querySelector('#item-modal .btn-primary');
    if (confirmBtn) confirmBtn.click();
  });
  await page.waitForTimeout(1500);

  // Open Cart Drawer
  await page.evaluate(() => {
    if (window.openCartDrawer) window.openCartDrawer();
  });
  await page.waitForTimeout(1500);

  // Send Order to Kitchen
  await page.evaluate(() => {
    if (window.submitOrderToKitchen) window.submitOrderToKitchen();
  });
  await page.waitForTimeout(2500);

  // 4. Navigate to Developer Console (DevCon)
  console.log('⚡ Inspecting Developer Console (DevCon)...');
  await page.goto(`${baseUrl}/devcon/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Switch to Error Telemetry tab
  await page.evaluate(() => {
    const telemetryBtn = document.querySelector('.devcon-nav-btn[data-target="pane-telemetry"]');
    if (telemetryBtn) telemetryBtn.click();
  });
  await page.waitForTimeout(1500);

  // Inject a simulated test error
  await page.evaluate(() => {
    if (window.simulateTestError) window.simulateTestError();
  });
  await page.waitForTimeout(2000);

  // Switch back to Sales & Velocity Analytics tab
  await page.evaluate(() => {
    const analyticsBtn = document.querySelector('.devcon-nav-btn[data-target="pane-analytics"]');
    if (analyticsBtn) analyticsBtn.click();
  });
  await page.waitForTimeout(2500);

  console.log('✅ Simulation scenario execution completed successfully.');
} catch (err) {
  console.error('⚠️ Simulation encountered error:', err.message);
} finally {
  await page.close();
  await context.close();
  await browser.close();
  server.close();
}

// Find recorded video and rename to standard artifact
const videoFiles = fs.readdirSync(recordingsDir).filter(f => f.endsWith('.webm'));
if (videoFiles.length > 0) {
  const latestVideo = videoFiles[videoFiles.length - 1];
  const targetPath = path.join(recordingsDir, 'arh-makan-multi-surface-simulation.webm');
  fs.copyFileSync(path.join(recordingsDir, latestVideo), targetPath);
  const sizeMb = (fs.statSync(targetPath).size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 📹 Simulation video recorded successfully:`);
  console.log(`   └─ ${targetPath} (${sizeMb} MB)`);
}
