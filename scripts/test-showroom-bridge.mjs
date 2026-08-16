/**
 * Showroom Bridge Unit & Station Routing Verification Suite
 */

import { showroomBridge, CategoryStationMap } from '../shared/showroom-bridge.js';

console.log('🧪 Starting Showroom Bridge Station-Routing Verification...\n');

const testCases = [
  // Fry Station Tests
  { category: 'fries', name: 'Curly Fries', expectedStation: 'fry' },
  { category: 'fries', name: 'Truffle Fries', expectedStation: 'fry' },
  { category: 'sides', name: 'Mac & Cheese', expectedStation: 'fry' },
  { category: 'upgrades', name: 'Add Extra Crispy Nuggets', expectedStation: 'fry' },
  { category: 'starters', name: 'Onion Rings', expectedStation: 'fry' },

  // Grill Station Tests
  { category: 'burgers', name: 'Woodfire Double Beef', expectedStation: 'grill' },
  { category: 'signature-burgers', name: 'Brisket Burger', expectedStation: 'grill' },
  { category: 'gourmet-burgers', name: 'Mushroom Truffle', expectedStation: 'grill' },
  { category: 'smoked', name: 'Texas Smoked Ribs', expectedStation: 'grill' },
  { category: 'steaks', name: 'Angus Ribeye 300g', expectedStation: 'grill' },
  { category: 'chicken', name: 'Spicy Grilled Chicken', expectedStation: 'grill' },

  // Bar Station Tests
  { category: 'beverages', name: 'Iced Lemon Tea', expectedStation: 'bar' },
  { category: 'drinks', name: 'Coca Cola Zero', expectedStation: 'bar' },
  { category: 'shakes', name: 'Salted Caramel Shake', expectedStation: 'bar' },
  { category: 'desserts', name: 'Molten Lava Cake', expectedStation: 'bar' },

  // Unknown Category Fallback with Keyword Test
  { category: 'unknown-custom', name: 'Spicy Seasoned French Fries', expectedStation: 'fry' },
  { category: 'seasonal-special', name: 'Mango Passionfruit Smoothie', expectedStation: 'bar' },
  { category: 'chef-surprise', name: 'Wagyu Beef Smash Patty', expectedStation: 'grill' }
];

let passes = 0;
let errors = 0;

for (const tc of testCases) {
  const station = showroomBridge.resolveStation(tc.category, tc.name);
  if (station === tc.expectedStation) {
    console.log(`✅ [PASS] "${tc.name}" (${tc.category}) ➔ Station: [${station.toUpperCase()}]`);
    passes++;
  } else {
    console.error(`❌ [FAIL] "${tc.name}" (${tc.category}) expected [${tc.expectedStation.toUpperCase()}] but got [${station.toUpperCase()}]`);
    errors++;
  }
}

// Test Order Normalization & Bridge Dispatch Shape
const sampleShowroomOrder = {
  orderId: 'SW-9021',
  tableId: 'T05',
  customerName: 'Ahmad Hilmi',
  items: [
    { id: 'wf-brisket-burger', name: 'Smoked Brisket Burger', categoryId: 'signature-burgers', basePrice: 29.90, quantity: 2 },
    { id: 'wf-truffle-fries', name: 'Truffle Fries', categoryId: 'fries', basePrice: 14.00, quantity: 1 },
    { id: 'wf-caramel-shake', name: 'Caramel Shake', categoryId: 'shakes', basePrice: 16.00, quantity: 2 }
  ]
};

const canonical = showroomBridge.normalizeShowroomOrder(sampleShowroomOrder);
if (canonical.items.length === 3 &&
    canonical.items[0].station === 'grill' &&
    canonical.items[1].station === 'fry' &&
    canonical.items[2].station === 'bar') {
  console.log(`\n✅ [PASS] Order Normalization Multi-Station Routing validated successfully.`);
  passes++;
} else {
  console.error(`\n❌ [FAIL] Order Normalization failed:`, canonical);
  errors++;
}

console.log(`\n========================================`);
console.log(`Bridge Routing Tests Passed: ${passes} | Errors: ${errors}`);
console.log(`========================================\n`);

if (errors > 0) process.exit(1);
