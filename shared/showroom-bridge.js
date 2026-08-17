/**
 * ARH-MAKAN ↔ arh-fnb-tier-showroom Integration Bridge (v2.0)
 * Connects Showroom's Premium Customer Showcase to ARH-MAKAN KDS & POS backend.
 * Provides resilient schema mapping, category & keyword station routing,
 * table-bound order dispatching, and cross-origin cloud sync.
 */

import { hub } from './realtime-adapter.js';

// Comprehensive Category-to-Station Routing Matrix
export const CategoryStationMap = {
  // Grill / Meats Station
  burgers: 'grill',
  burger: 'grill',
  'signature-burgers': 'grill',
  'gourmet-burgers': 'grill',
  smoked: 'grill',
  'smoked-platters': 'grill',
  steaks: 'grill',
  steak: 'grill',
  bbq: 'grill',
  chicken: 'grill',
  lamb: 'grill',
  pasta: 'grill',
  mains: 'grill',
  combos: 'grill',
  platters: 'grill',
  hotdog: 'grill',

  // Fry / Sides Station
  fries: 'fry',
  fry: 'fry',
  sides: 'fry',
  side: 'fry',
  starters: 'fry',
  appetizers: 'fry',
  'finger-food': 'fry',
  snacks: 'fry',
  upgrades: 'fry',
  addons: 'fry',

  // Bar / Drinks & Sweets Station
  beverages: 'bar',
  beverage: 'bar',
  drinks: 'bar',
  drink: 'bar',
  shakes: 'bar',
  shake: 'bar',
  coffee: 'bar',
  tea: 'bar',
  mocktails: 'bar',
  desserts: 'bar',
  dessert: 'bar',
  'ice-cream': 'bar'
};

export class ShowroomBridge {
  constructor() {
    this.hub = hub;
  }

  /**
   * Resolves kitchen station from category with smart item-name keyword heuristics
   * Prevents silent fallthrough bugs for new or custom category labels.
   */
  resolveStation(category = '', itemName = '') {
    const catKey = String(category || '').toLowerCase().trim();
    if (CategoryStationMap[catKey]) {
      return CategoryStationMap[catKey];
    }

    // Smart Keyword Heuristic Fallback
    const nameLower = String(itemName || '').toLowerCase();
    
    // Check Fry keywords
    if (/(fries|curly|truffle|wedges|nugget|tenders|onion ring|popcorn|wings|corndog|nacho|fry)/i.test(nameLower)) {
      return 'fry';
    }

    // Check Bar / Drinks keywords
    if (/(shake|drink|coke|sprite|tea|coffee|latte|americano|mojito|mocktail|smoothie|water|juice|float|ice cream|sundae|cake|dessert)/i.test(nameLower)) {
      return 'bar';
    }

    // Check Grill keywords
    if (/(burger|patty|brisket|ribs|steak|meat|lamb|beef|chicken|bbq|bacon|grilled|sausage|platter)/i.test(nameLower)) {
      return 'grill';
    }

    // Default station fallback
    return 'grill';
  }

  /**
   * Translates a Showroom order payload into ARH-MAKAN canonical schema
   */
  normalizeShowroomOrder(showroomOrder) {
    const rawItems = showroomOrder.items || [];
    let subtotal = 0;

    const normalizedItems = rawItems.map((item, idx) => {
      const unitPrice = Number(item.price || item.unitPrice || item.basePrice || 0);
      const qty = Number(item.quantity || item.qty || 1);
      const itemTotal = unitPrice * qty;
      subtotal += itemTotal;

      const category = item.categoryId || item.category || '';
      const itemName = item.name || item.title || 'Menu Item';
      const station = item.station || this.resolveStation(category, itemName);

      return {
        item_id: item.id || `item_${idx}`,
        name: itemName,
        qty: qty,
        unit_price: unitPrice,
        total_price: itemTotal,
        station: station,
        selected_modifiers: (item.selectedOptions || item.modifiers || []).map(opt => ({
          group_name: opt.groupName || opt.group_name || 'Option',
          option_name: opt.name || opt.optionName || opt.option_name || opt.label || String(opt),
          price: Number(opt.price || opt.priceDelta || 0)
        })),
        notes: item.notes || item.specialInstructions || '',
        is_bumped: false,
        line_id: `line_${Date.now()}_${idx}`
      };
    });

    const tax = showroomOrder.tax !== undefined ? Number(showroomOrder.tax) : (subtotal * 0.06);
    const total = showroomOrder.total !== undefined ? Number(showroomOrder.total) : (subtotal + tax);

    return {
      order_id: showroomOrder.orderId || showroomOrder.id || ('ORD-' + Math.floor(1000 + Math.random() * 9000)),
      table_id: showroomOrder.tableId || showroomOrder.tableNumber || 'T01',
      type: showroomOrder.orderType || 'dine_in',
      customer_name: showroomOrder.customerName || showroomOrder.name || 'Guest',
      phone: showroomOrder.phone || '',
      items: normalizedItems,
      subtotal: subtotal,
      tax: tax,
      total_amount: total,
      payment_method: showroomOrder.paymentMethod || 'pay_at_counter',
      notes: showroomOrder.notes || '',
      created_at: showroomOrder.created_at || new Date().toISOString()
    };
  }

  /**
   * Direct Dispatch: Places order from Showroom directly into KDS & POS
   */
  async dispatchOrder(showroomOrder) {
    const canonicalOrder = this.normalizeShowroomOrder(showroomOrder);
    const created = this.hub.createOrder(canonicalOrder);
    console.log('🚀 [Showroom Bridge] Dispatched order to KDS & Cloud:', created.order_id);
    return created;
  }

  /**
   * Dispatches a waiter/bill service request from Showroom table menu
   */
  dispatchServiceRequest(tableId, type = 'waiter', note = '') {
    return this.hub.createServiceRequest(tableId, type, note);
  }

  /**
   * Retrieves active orders for customer live tracking
   */
  getOrderStatus(orderId) {
    const orders = this.hub.getOrders();
    return orders.find(o => o.order_id === orderId) || null;
  }
}

export const showroomBridge = new ShowroomBridge();

// Expose globally for showroom standalone pages
if (typeof window !== 'undefined') {
  window.ARH_SHOWROOM_BRIDGE = showroomBridge;
}
