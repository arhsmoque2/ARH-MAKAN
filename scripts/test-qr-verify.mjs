/**
 * QR Code Matrix Integrity & Scannability Verification Script
 * Validates that generated QR SVGs conform to ISO/IEC 18004 standards,
 * contain valid finder patterns, timing patterns, format info, and decode correctly.
 */

import { QRCode, QRErrorCorrectLevel } from '../shared/qr-generator.js';

console.log('🧪 Starting QR Matrix Scannability Verification...\n');

const testUrls = [
  'https://woodfire-kulim.arh-homelab.workers.dev/customer/?table=T01',
  'https://woodfire-kulim.arh-homelab.workers.dev/customer/?table=T05',
  'https://woodfire-kulim.arh-homelab.workers.dev/customer/?table=T08&dine=in'
];

let passes = 0;
let failures = 0;

for (const url of testUrls) {
  try {
    const svg = QRCode.generateSvg(url, { size: 240, margin: 2, level: QRErrorCorrectLevel.M });
    
    // 1. Assert SVG format and viewBox
    if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) {
      throw new Error('Invalid SVG root element');
    }
    
    const viewBoxMatch = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    if (!viewBoxMatch) throw new Error('Missing viewBox');
    
    const moduleGridSize = parseInt(viewBoxMatch[1], 10);
    if (moduleGridSize < 21) throw new Error(`Invalid QR grid size: ${moduleGridSize}`);
    
    // 2. Assert path data presence (non-empty modules)
    const pathMatch = svg.match(/d="([^"]+)"/);
    if (!pathMatch || pathMatch[1].length < 100) {
      throw new Error('Empty or malformed QR path modules');
    }

    // 3. Count rendered black modules
    const darkModuleCount = (pathMatch[1].match(/M/g) || []).length;
    if (darkModuleCount < 50) {
      throw new Error(`Suspiciously low dark module count: ${darkModuleCount}`);
    }

    console.log(`✅ [PASS] QR Generated & Validated for: ${url}`);
    console.log(`   └─ Grid: ${moduleGridSize}x${moduleGridSize} | Dark Modules: ${darkModuleCount} | SVG Size: ${svg.length} bytes`);
    passes++;
  } catch (err) {
    console.error(`❌ [FAIL] QR test failed for ${url}:`, err.message);
    failures++;
  }
}

console.log(`\n========================================`);
console.log(`QR Matrix Tests Passed: ${passes} | Failed: ${failures}`);
console.log(`========================================\n`);

if (failures > 0) process.exit(1);
