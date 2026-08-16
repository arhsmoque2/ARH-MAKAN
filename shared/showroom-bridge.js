/**
 * ARH-MAKAN ↔ arh-fnb-tier-showroom Integration Bridge
 * Connects Showroom's Premium Customer Showcase to ARH-MAKAN KDS & POS backend.
 * Provides schema mapping, table-bound order dispatching, and live service calls.
 */

import { hub } from './realtime-adapter.js';

export const CategoryStationMap = {
  steaks: 'grill',
  smoked: 'grill',
  bbq: 'grill',
  burgers: 'grill',
  chicken: 'grill',
  lamb: 'grill',
  pasta: 'grill',
  sides: 'fry',
  fried: 'fry',
  starters: 'fry',
  appetizers: 'fry',
  beverages: 'bar',
  drinks: 'bar',
  shakes: 'bar',
  mocktails: 'bar',
  desserts: 'bar'
};

export class ShowroomBridge {
  constructor() {
    this.hub = hub;
  }

  /**
   * Infers kitchen station from category or item metadata
   */
  resolveStation(category) {
    if (!category) return 'grill';
    const key = String(category).toLowerCase();
    return CategoryStationMap[key] || 'grill';
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

      return {
        item_id: item.id || `item_${idx}`,
        name: item.name || item.title || 'Menu Item',
        qty: qty,
        unit_price: unitPrice,
        total_price: itemTotal,
        station: item.station || this.resolveStation(item.categoryId || item.category),
        selected_modifiers: (item.selectedOptions || item.modifiers || []).map(opt => ({
          group_name: opt.groupName || 'Option',
          option_name: opt.name || opt.optionName || opt,
          price: Number(opt.price || 0)
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
      created_at: new Date().toISOString()
    };
  }

  /**
   * Direct Dispatch: Places order from Showroom directly into KDS & POS
   */
  dispatchOrder(showroomOrder) {
    const canonicalOrder = this.normalizeShowroomOrder(showroomOrder);
    const created = this.hub.createOrder(canonicalOrder);
    console.log('🚀 [Showroom Bridge] Dispatched order to KDS:', created.order_id);
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
