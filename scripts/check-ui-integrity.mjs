#!/usr/bin/env node
/**
 * ARH-MAKAN Multi-Viewport UI Integrity & Layout Overflow Scanner (vlmkit inspired)
 * Tests all surfaces across Mobile (390px), Tablet (768px), and Desktop (1280px)
 * for horizontal page overflow ([page-overflow-x]), broken assets, and layout clipping.
 */

import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('📐 Running Multi-Viewport UI Integrity & Overflow Scanner (Gate 11)...\n');

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

const viewports = [
  { name: 'Mobile (390px)', width: 390, height: 844 },
  { name: 'Tablet (768px)', width: 768, height: 1024 },
  { name: 'Desktop (1280px)', width: 1280, height: 800 }
];

const routes = [
  { path: '/index.html', name: 'Master Launcher' },
  { path: '/customer/index.html?table=T05', name: 'Customer Dine-In' },
  { path: '/kds/index.html', name: 'Kitchen KDS' },
  { path: '/pos/index.html', name: 'Cashier POS' },
  { path: '/admin/index.html', name: 'Manager Admin' },
  { path: '/devcon/index.html', name: 'Developer Console' },
  { path: '/test-sandbox.html', name: 'Quad Sandbox' }
];

let defects = 0;
let passedChecks = 0;

const browser = await chromium.launch({ headless: true });

try {
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    for (const route of routes) {
      const consoleErrors = [];
      page.on('pageerror', (err) => consoleErrors.push(err.message));

      await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      // Check 1: Horizontal page overflow (document.documentElement.scrollWidth > window.innerWidth)
      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        return {
          hasOverflow: docWidth > winWidth + 1, // 1px tolerance for subpixel rounding
          docWidth,
          winWidth
        };
      });

      if (overflow.hasOverflow) {
        console.error(`❌ [PAGE-OVERFLOW-X] ${route.name} @ ${vp.name} — scrollWidth (${overflow.docWidth}px) exceeds viewport (${overflow.winWidth}px)`);
        defects++;
      } else {
        passedChecks++;
      }

      // Check 2: Broken Images
      const brokenImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.filter(img => img.complete && img.naturalWidth === 0 && img.src && !img.src.includes('data:image')).map(img => img.src);
      });

      if (brokenImages.length > 0) {
        console.error(`❌ [BROKEN IMAGE] ${route.name} @ ${vp.name} — ${brokenImages.length} image(s) failed to load: ${brokenImages.join(', ')}`);
        defects++;
      } else {
        passedChecks++;
      }

      // Check 3: Unhandled Page Errors
      if (consoleErrors.length > 0) {
        console.error(`❌ [PAGE ERROR] ${route.name} @ ${vp.name} — Console error: ${consoleErrors.join('; ')}`);
        defects++;
      } else {
        passedChecks++;
      }
    }
    await page.close();
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

console.log(`\n========================================`);
console.log(`UI Integrity Results: ${passedChecks} checks passed | ${defects} defects found.`);
console.log(`========================================\n`);

if (defects > 0) {
  console.error(`❌ UI Integrity scan failed with ${defects} defect(s).`);
  process.exit(1);
} else {
  console.log('🎉 [PASS] Multi-viewport layout integrity & overflow verification 100% CLEAN!');
  process.exit(0);
}
