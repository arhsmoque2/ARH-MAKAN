#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const menuPath = path.join(root, 'shared/mock-data/menu.json');

console.log('🛡️ Running Menu Schema & Station DriftGuard...\n');

if (!fs.existsSync(menuPath)) {
  console.error(`❌ Missing menu catalog: ${menuPath}`);
  process.exit(1);
}

const menu = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
let errors = 0;

// 1. Validate Restaurant Meta
if (!menu.restaurant || !menu.restaurant.name || typeof menu.restaurant.tax_rate !== 'number') {
  console.error('❌ Invalid or missing restaurant metadata (tax_rate must be number)');
  errors++;
} else {
  console.log(`✅ Restaurant Metadata: ${menu.restaurant.name} (SST: ${(menu.restaurant.tax_rate * 100).toFixed(0)}%)`);
}

// 2. Validate Categories
const validCategoryIds = new Set();
const requiredCategoryKeys = ['id', 'name', 'icon'];

for (const cat of (menu.categories || [])) {
  for (const key of requiredCategoryKeys) {
    if (!cat[key]) {
      console.error(`❌ Category missing key "${key}":`, cat);
      errors++;
    }
  }
  validCategoryIds.add(cat.id);
}
console.log(`✅ Validated ${validCategoryIds.size} Menu Categories: [${Array.from(validCategoryIds).join(', ')}]`);

// 3. Validate Items & Modifiers
const validStations = new Set(['grill', 'fry', 'bar', 'expo']);
let itemCount = 0;

for (const item of (menu.items || [])) {
  itemCount++;
  if (!item.id || !item.name) {
    console.error('❌ Item missing id or name:', item);
    errors++;
  }
  if (typeof item.price !== 'number' || item.price < 0) {
    console.error(`❌ Item "${item.name}" has invalid price: ${item.price}`);
    errors++;
  }
  if (!validCategoryIds.has(item.category)) {
    console.error(`❌ Item "${item.name}" has unmapped category: ${item.category}`);
    errors++;
  }
  if (!validStations.has(item.station)) {
    console.error(`❌ Item "${item.name}" has invalid KDS station: ${item.station}`);
    errors++;
  }

  // Check Modifiers
  if (item.modifiers && Array.isArray(item.modifiers)) {
    for (const mod of item.modifiers) {
      if (!mod.id || !mod.name || !mod.type) {
        console.error(`❌ Item "${item.name}" has malformed modifier group:`, mod);
        errors++;
      }
      if (!mod.options || !Array.isArray(mod.options) || mod.options.length === 0) {
        console.error(`❌ Item "${item.name}" modifier "${mod.name}" has no options`);
        errors++;
      }
      for (const opt of mod.options) {
        if (!opt.name || typeof opt.price !== 'number') {
          console.error(`❌ Item "${item.name}" modifier option invalid:`, opt);
          errors++;
        }
      }
    }
  }
}

console.log(`✅ Validated ${itemCount} Menu Items with Full KDS Station Routing & Radio Modifiers`);

if (errors > 0) {
  console.error(`\n❌ Menu Config Drift Guard failed with ${errors} errors.`);
  process.exit(1);
} else {
  console.log('\n🎉 🛡️ Menu Config Drift Guard Passed: 0 Schema Drift detected.');
  process.exit(0);
}
