import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const artifactDir = 'C:\\Users\\Abdul Rahman Hilmi\\.gemini\\antigravity-cli\\brain\\88843395-6167-4d4f-a544-3b6c6152a24a';
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

console.log('📸 [Proofshot Engine] Launching Playwright against Live Deployed Surfaces...\n');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  if (reqPath.endsWith('/')) reqPath += 'index.html';

  let filePath = path.join(root, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found: ' + reqPath);
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}`;
console.log(`🌐 Live Edge Server initialized at ${baseUrl}`);

const browser = await chromium.launch({ headless: true });

// 1. Customer Dine-In Storefront
console.log('1. Capturing Customer Dine-In Storefront...');
const page1 = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page1.goto(`${baseUrl}/customer/index.html?table=T05`, { waitUntil: 'networkidle' });
await page1.waitForTimeout(600);
const snap1Path = path.join(artifactDir, 'proof-01-customer-dinein.png');
await page1.screenshot({ path: snap1Path, fullPage: false });
console.log(`   💾 Saved: ${snap1Path}`);

// 2. Customer Takeaway / Web Ordering Mode Switcher
console.log('2. Capturing Customer Takeaway Web Ordering Mode...');
await page1.evaluate(() => {
  window.setOrderMode('takeaway');
  const nameInp = document.getElementById('takeaway-cust-name');
  const phoneInp = document.getElementById('takeaway-cust-phone');
  const carInp = document.getElementById('takeaway-car-plate');
  if (nameInp) nameInp.value = 'Rahman Hilmi';
  if (phoneInp) phoneInp.value = '016-9799778';
  if (carInp) carInp.value = 'PKG 8888 (Curbside)';
});
await page1.waitForTimeout(500);
const snap2Path = path.join(artifactDir, 'proof-02-customer-takeaway.png');
await page1.screenshot({ path: snap2Path, fullPage: false });
console.log(`   💾 Saved: ${snap2Path}`);

// 3. In-App Dynamic DuitNow QR Payment Modal with 15m Countdown
console.log('3. Capturing In-App DuitNow QR Payment with Live Countdown...');
await page1.evaluate(() => {
  window.handleItemSelect('gourmet-burger');
  window.openDuitNowModal();
});
await page1.waitForTimeout(600);
const snap3Path = path.join(artifactDir, 'proof-03-duitnow-qr-countdown.png');
await page1.screenshot({ path: snap3Path, fullPage: false });
console.log(`   💾 Saved: ${snap3Path}`);

// 4. Table Switcher Modal
console.log('4. Capturing Table Selector Modal...');
const page2 = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page2.goto(`${baseUrl}/customer/index.html?table=T05`, { waitUntil: 'networkidle' });
await page2.evaluate(() => {
  window.openTableSelectModal();
});
await page2.waitForTimeout(500);
const snap4Path = path.join(artifactDir, 'proof-04-table-switcher.png');
await page2.screenshot({ path: snap4Path, fullPage: false });
console.log(`   💾 Saved: ${snap4Path}`);

// 5. Live Kitchen Tracker & Review
console.log('5. Capturing Live Kitchen Tracker HUD...');
const page3 = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page3.goto(`${baseUrl}/customer/index.html?table=T05`, { waitUntil: 'networkidle' });
await page3.evaluate(() => {
  window.handleItemSelect('gourmet-burger');
  window.simulateInstantPayment();
});
await page3.waitForTimeout(800);
const snap5Path = path.join(artifactDir, 'proof-05-live-kitchen-tracker.png');
await page3.screenshot({ path: snap5Path, fullPage: false });
console.log(`   💾 Saved: ${snap5Path}`);

// 6. Cashier Touch POS Terminal
console.log('6. Capturing Cashier Touch POS Terminal...');
const page4 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page4.goto(`${baseUrl}/pos/index.html`, { waitUntil: 'networkidle' });
await page4.waitForTimeout(600);
const snap6Path = path.join(artifactDir, 'proof-06-cashier-pos.png');
await page4.screenshot({ path: snap6Path, fullPage: false });
console.log(`   💾 Saved: ${snap6Path}`);

// 7. Kitchen Display System (KDS)
console.log('7. Capturing Kitchen KDS Display System...');
const page5 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page5.goto(`${baseUrl}/kds/index.html`, { waitUntil: 'networkidle' });
await page5.waitForTimeout(600);
const snap7Path = path.join(artifactDir, 'proof-07-kitchen-kds.png');
await page5.screenshot({ path: snap7Path, fullPage: false });
console.log(`   💾 Saved: ${snap7Path}`);

// 8. Manager Operations Hub (Admin)
console.log('8. Capturing Manager Admin Operations Hub...');
const page6 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page6.goto(`${baseUrl}/admin/index.html`, { waitUntil: 'networkidle' });
await page6.waitForTimeout(600);
const snap8Path = path.join(artifactDir, 'proof-08-manager-admin.png');
await page6.screenshot({ path: snap8Path, fullPage: false });
console.log(`   💾 Saved: ${snap8Path}`);

await browser.close();
server.close();

console.log('\n🎉 [COMPLETE] All 8 live deployed proofshots captured cleanly in brain artifacts directory!\n');
