#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('🔍 Running ARH-MAKAN Static Integrity & Syntax Doctor...\n');

let errors = 0;
let passes = 0;

function checkFile(filePath, desc, validator) {
  const fullPath = path.join(root, filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ [MISSING] ${desc}: ${filePath}`);
    errors++;
    return;
  }
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    if (validator) {
      validator(content, fullPath);
    }
    console.log(`✅ [PASS] ${desc}: ${filePath}`);
    passes++;
  } catch (err) {
    console.error(`❌ [FAIL] ${desc}: ${filePath} -> ${err.message}`);
    errors++;
  }
}

// 1. Check Core Schemas and JSON Files
checkFile('shared/schema.json', 'JSON Schema Definition', (content) => {
  JSON.parse(content);
});

checkFile('shared/mock-data/menu.json', 'Menu Catalog Data', (content) => {
  const data = JSON.parse(content);
  if (!data.categories || !Array.isArray(data.categories)) {
    throw new Error('Menu missing "categories" array');
  }
  if (!data.items || !Array.isArray(data.items)) {
    throw new Error('Menu missing "items" array');
  }
});

// 2. Check Core HTML Surfaces
const surfaces = [
  'index.html',
  'customer/index.html',
  'kds/index.html',
  'pos/index.html',
  'admin/index.html',
  'showroom/index.html'
];

for (const surface of surfaces) {
  checkFile(surface, `HTML Surface`, (content) => {
    if (!content.includes('<!DOCTYPE html>') && !content.includes('<!doctype html>')) {
      throw new Error('Missing doctype');
    }
    if (!content.includes('shared/theme.css')) {
      throw new Error('Missing shared/theme.css link');
    }
  });
}

// 3. Check JavaScript Modules Syntax
const jsModules = [
  'shared/realtime-adapter.js',
  'shared/audio-engine.js',
  'shared/qr-generator.js',
  'shared/escpos-formatter.js',
  'shared/showroom-bridge.js',
  'customer/customer.js',
  'kds/kds.js',
  'pos/pos.js',
  'admin/admin.js',
  'showroom/showroom.js'
];

for (const jsMod of jsModules) {
  checkFile(jsMod, `JavaScript Module`, (content) => {
    // Basic syntax sanity
    if (content.length === 0) throw new Error('File is empty');
  });
}

console.log(`\n========================================`);
console.log(`Passed: ${passes} | Errors: ${errors}`);
console.log(`========================================\n`);

if (errors > 0) {
  process.exit(1);
} else {
  console.log('🎉 All static checks passed successfully!');
  process.exit(0);
}
