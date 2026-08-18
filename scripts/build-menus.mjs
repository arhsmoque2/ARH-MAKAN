import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const showroomDataPath = path.resolve(root, '../arh-fnb-tier-showroom/data/menu.json');
const localDataPath = path.resolve(root, 'data/menu.json');
const outputPath = path.resolve(root, 'shared/mock-data/menu.json');

// Source data
let rawSource;
if (fs.existsSync(localDataPath)) {
  rawSource = JSON.parse(fs.readFileSync(localDataPath, 'utf-8'));
} else if (fs.existsSync(showroomDataPath)) {
  rawSource = JSON.parse(fs.readFileSync(showroomDataPath, 'utf-8'));
  // Save local copy in data/menu.json
  if (!fs.existsSync(path.resolve(root, 'data'))) {
    fs.mkdirSync(path.resolve(root, 'data'), { recursive: true });
  }
  fs.writeFileSync(localDataPath, JSON.stringify(rawSource, null, 2));
} else {
  console.error('❌ Could not locate source menu.json');
  process.exit(1);
}

// Station Resolver Function
function resolveStation(categoryId, item) {
  const cat = String(categoryId || '').toLowerCase();
  const name = String(item.name || '').toLowerCase();

  if (cat === 'burgers' || cat === 'smoked') return 'grill';
  if (cat === 'fries' || cat === 'chicken') return 'fry';
  if (cat === 'shakes') return 'bar';
  if (cat === 'upgrades') {
    if (name.includes('drink') || name.includes('shake')) return 'bar';
    return 'fry';
  }

  // Fallback heuristics
  if (/(burger|patty|brisket|ribs|steak|meat|lamb|beef)/i.test(name)) return 'grill';
  if (/(fries|nugget|tenders|wings|fry|mash|coleslaw|mac)/i.test(name)) return 'fry';
  if (/(shake|drink|coke|water|tea|coffee)/i.test(name)) return 'bar';
  return 'grill';
}

// Transform into ARH-MAKAN Unified Schema
const transformedCategories = rawSource.categories.map(c => ({
  id: c.id,
  name: c.name,
  icon: c.emoji || '🍔',
  type: c.type || 'food'
}));

const addonLib = rawSource.addonLibrary || [];

const transformedItems = rawSource.items.map(item => {
  const station = resolveStation(item.categoryId, item);
  
  // Format modifiers into unified structure supporting both radio and single/multiple
  const itemModifiers = [];

  if (item.modifiers && Array.isArray(item.modifiers)) {
    for (const mod of item.modifiers) {
      itemModifiers.push({
        id: mod.id,
        name: mod.label || mod.name || 'Choice',
        type: mod.type === 'radio' ? 'single' : (mod.type || 'single'),
        required: Boolean(mod.required),
        options: (mod.options || []).map(opt => ({
          name: opt.label || opt.name,
          price: typeof opt.priceDelta === 'number' ? opt.priceDelta : (opt.price || 0)
        }))
      });
    }
  }

  // If category supports addons, include the 16 Woodfire Addon Library
  const catObj = rawSource.categories.find(c => c.id === item.categoryId);
  if (catObj && catObj.showAddons && addonLib.length > 0) {
    itemModifiers.push({
      id: 'addons',
      name: 'Woodfire Add-ons',
      type: 'multiple',
      required: false,
      options: addonLib.map(a => ({
        name: a.label,
        price: a.priceDelta
      }))
    });
  }

  return {
    id: item.id,
    name: item.name,
    category: item.categoryId,
    price: Number(item.basePrice || item.price || 0),
    description: item.description || '',
    badge: item.badge || '',
    emoji: item.emoji || '🍔',
    station: station,
    dietary: ['halal'],
    is_sold_out: !item.available,
    imageUrl: item.imageUrl || '',
    modifiers: itemModifiers
  };
});

const unifiedMenu = {
  restaurant: {
    name: "Woodfire Kulim",
    tagline: "Premium Smoked Meats & Gourmet Burgers",
    currency: "RM",
    locale: "en-MY",
    phone: "60169799778",
    tax_rate: 0.06
  },
  categories: transformedCategories,
  addonLibrary: addonLib,
  items: transformedItems
};

fs.writeFileSync(outputPath, JSON.stringify(unifiedMenu, null, 2));
console.log(`✅ Successfully compiled ${transformedItems.length} Woodfire menu items across ${transformedCategories.length} categories to ${outputPath}`);
