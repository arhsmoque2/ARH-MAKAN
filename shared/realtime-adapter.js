/**
 * ARH-MAKAN Shared Realtime State Adapter (v2.0)
 * Implements 3-Tier Hybrid State Synchronization:
 * - Tier 1: BroadcastChannel (Instant local multi-surface sync <5ms)
 * - Tier 2: localStorage (Crash resilience & offline queue)
 * - Tier 3: Cloud Realtime Provider (Firebase Firestore / REST SSE Cloud Stream)
 */

class RealtimeHub {
  constructor() {
    this.channelName = 'arh_makan_hub';
    this.storagePrefix = 'arh_makan_';
    this.listeners = new Map();
    this.cloudActive = false;
    this.cloudDb = null;
    this.cloudUnsubs = [];

    // BroadcastChannel init
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.bc = new BroadcastChannel(this.channelName);
      this.bc.onmessage = (event) => this._handleBroadcast(event.data);
    }

    // Storage event fallback for older contexts
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith(this.storagePrefix)) {
          this._notifyAll();
        }
      });
    }

    // Seed initial mock orders if completely empty
    this._seedIfEmpty();

    // Auto-detect and connect Cloud Tier 3 if available
    this._initCloudTier();
  }

  // --- Cloud Tier 3 Initialization (Firebase Firestore / Cloudflare D1) ---

  _initCloudTier() {
    if (typeof window === 'undefined') return;

    // Check for global configuration or embedded Firebase instance
    const config = window.ARH_REALTIME_CONFIG || window.firebaseConfig;

    if (window.firebase && window.firebase.firestore && (config || window.firebase.apps?.length)) {
      try {
        if (!window.firebase.apps?.length && config) {
          window.firebase.initializeApp(config);
        }
        this.cloudDb = window.firebase.firestore();
        this.cloudActive = true;
        this._bindCloudListeners();
        console.log('⚡ [ARH-MAKAN Hub] Connected to Tier 3 Cloud Realtime (Firestore)');
      } catch (err) {
        console.warn('⚠️ [ARH-MAKAN Hub] Cloud tier init skipped:', err.message);
      }
    }
  }

  _bindCloudListeners() {
    if (!this.cloudDb) return;

    // Listen to orders collection
    const unsubOrders = this.cloudDb.collection('arh_orders')
      .onSnapshot((snapshot) => {
        const cloudOrders = [];
        snapshot.forEach(doc => {
          cloudOrders.push({ ...doc.data(), order_id: doc.id });
        });
        if (cloudOrders.length > 0) {
          // Sort descending by created_at
          cloudOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          try {
            localStorage.setItem(this.storagePrefix + 'orders', JSON.stringify(cloudOrders));
          } catch (_) {}
          this._notify('orders', cloudOrders);
        }
      }, (err) => console.warn('Cloud orders sync error:', err));

    // Listen to service requests
    const unsubReqs = this.cloudDb.collection('arh_service_requests')
      .where('status', '==', 'active')
      .onSnapshot((snapshot) => {
        const cloudReqs = [];
        snapshot.forEach(doc => {
          cloudReqs.push({ ...doc.data(), id: doc.id });
        });
        try {
          localStorage.setItem(this.storagePrefix + 'service_requests', JSON.stringify(cloudReqs));
        } catch (_) {}
        this._notify('service_requests', cloudReqs);
      }, (err) => console.warn('Cloud requests sync error:', err));

    // Listen to 86 inventory
    const unsubInv = this.cloudDb.collection('arh_settings').doc('inventory')
      .onSnapshot((doc) => {
        if (doc.exists) {
          const list = doc.data().sold_out || [];
          try {
            localStorage.setItem(this.storagePrefix + 'sold_out', JSON.stringify(list));
          } catch (_) {}
          this._notify('inventory', list);
        }
      }, (err) => console.warn('Cloud inventory sync error:', err));

    this.cloudUnsubs = [unsubOrders, unsubReqs, unsubInv];
  }

  getSyncStatus() {
    return {
      tier: this.cloudActive ? 3 : (this.bc ? 2 : 1),
      mode: this.cloudActive ? 'Cloud Synced (Firebase/D1)' : 'Local Multi-Surface (BroadcastChannel)',
      cloudActive: this.cloudActive
    };
  }

  // --- Core State Accessors ---

  getOrders() {
    try {
      const raw = localStorage.getItem(this.storagePrefix + 'orders');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveOrders(orders) {
    try {
      localStorage.setItem(this.storagePrefix + 'orders', JSON.stringify(orders));
      this._broadcast({ type: 'ORDERS_UPDATED', timestamp: Date.now() });
      this._notify('orders', orders);
    } catch (err) {
      console.error('Failed to save orders to localStorage:', err);
    }
  }

  getServiceRequests() {
    try {
      const raw = localStorage.getItem(this.storagePrefix + 'service_requests');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveServiceRequests(requests) {
    try {
      localStorage.setItem(this.storagePrefix + 'service_requests', JSON.stringify(requests));
      this._broadcast({ type: 'SERVICE_REQUESTS_UPDATED', timestamp: Date.now() });
      this._notify('service_requests', requests);
    } catch (err) {
      console.error('Failed to save service requests:', err);
    }
  }

  getSoldOutItems() {
    try {
      const raw = localStorage.getItem(this.storagePrefix + 'sold_out');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  toggleSoldOut(itemId) {
    const list = this.getSoldOutItems();
    const idx = list.indexOf(itemId);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(itemId);
    }
    localStorage.setItem(this.storagePrefix + 'sold_out', JSON.stringify(list));
    this._broadcast({ type: 'INVENTORY_UPDATED', timestamp: Date.now() });
    this._notify('inventory', list);

    if (this.cloudActive && this.cloudDb) {
      this.cloudDb.collection('arh_settings').doc('inventory').set({ sold_out: list }, { merge: true })
        .catch(e => console.warn('Cloud inventory write failed:', e));
    }

    return list.includes(itemId);
  }

  // --- Order Mutation Operations ---

  createOrder(orderPayload) {
    const orders = this.getOrders();
    const orderId = orderPayload.order_id || 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      order_id: orderId,
      table_id: orderPayload.table_id || 'TAKEAWAY',
      type: orderPayload.type || 'dine_in',
      status: orderPayload.status || 'pending',
      items: (orderPayload.items || []).map((item, i) => ({
        ...item,
        is_bumped: Boolean(item.is_bumped),
        line_id: item.line_id || `${Date.now()}_${i}`
      })),
      subtotal: Number(orderPayload.subtotal || 0),
      tax: Number(orderPayload.tax || 0),
      total_amount: Number(orderPayload.total_amount || 0),
      payment_method: orderPayload.payment_method || 'unpaid',
      created_at: orderPayload.created_at || new Date().toISOString(),
      paid_at: orderPayload.paid_at || null,
      notes: orderPayload.notes || ''
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);

    if (this.cloudActive && this.cloudDb) {
      this.cloudDb.collection('arh_orders').doc(orderId).set(newOrder)
        .catch(e => console.warn('Cloud order write failed:', e));
    }

    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.order_id === orderId);
    if (order) {
      order.status = newStatus;
      if (newStatus === 'paid' && !order.paid_at) {
        order.paid_at = new Date().toISOString();
      }
      this.saveOrders(orders);

      if (this.cloudActive && this.cloudDb) {
        this.cloudDb.collection('arh_orders').doc(orderId).set({
          status: newStatus,
          paid_at: order.paid_at
        }, { merge: true }).catch(e => console.warn('Cloud status update failed:', e));
      }
    }
    return order;
  }

  bumpOrderItem(orderId, lineId) {
    const orders = this.getOrders();
    const order = orders.find(o => o.order_id === orderId);
    if (order) {
      const item = order.items.find(it => it.line_id === lineId);
      if (item) {
        item.is_bumped = !item.is_bumped;
      }
      // If all items bumped, mark order as ready
      const allBumped = order.items.every(it => it.is_bumped);
      if (allBumped && order.status === 'pending') {
        order.status = 'ready';
      }
      this.saveOrders(orders);

      if (this.cloudActive && this.cloudDb) {
        this.cloudDb.collection('arh_orders').doc(orderId).set({
          items: order.items,
          status: order.status
        }, { merge: true }).catch(e => console.warn('Cloud item bump failed:', e));
      }
    }
    return order;
  }

  settlePayment(orderId, paymentMethod = 'cash') {
    const orders = this.getOrders();
    const order = orders.find(o => o.order_id === orderId);
    if (order) {
      order.status = 'paid';
      order.payment_method = paymentMethod;
      order.paid_at = new Date().toISOString();
      this.saveOrders(orders);

      if (this.cloudActive && this.cloudDb) {
        this.cloudDb.collection('arh_orders').doc(orderId).set({
          status: 'paid',
          payment_method: paymentMethod,
          paid_at: order.paid_at
        }, { merge: true }).catch(e => console.warn('Cloud settlement write failed:', e));
      }
    }
    return order;
  }

  // --- Service Request Operations ---

  createServiceRequest(tableId, type = 'waiter', note = '') {
    const requests = this.getServiceRequests();
    const reqId = 'SR-' + Date.now().toString().slice(-6);
    const req = {
      id: reqId,
      table_id: tableId,
      type,
      note,
      status: 'active',
      created_at: new Date().toISOString()
    };
    requests.unshift(req);
    this.saveServiceRequests(requests);

    if (this.cloudActive && this.cloudDb) {
      this.cloudDb.collection('arh_service_requests').doc(reqId).set(req)
        .catch(e => console.warn('Cloud service request write failed:', e));
    }

    return req;
  }

  resolveServiceRequest(reqId) {
    const requests = this.getServiceRequests();
    const req = requests.find(r => r.id === reqId);
    if (req) {
      req.status = 'resolved';
      this.saveServiceRequests(requests.filter(r => r.id !== reqId));

      if (this.cloudActive && this.cloudDb) {
        this.cloudDb.collection('arh_service_requests').doc(reqId).set({ status: 'resolved' }, { merge: true })
          .catch(e => console.warn('Cloud service resolve failed:', e));
      }
    }
  }

  // --- Table Status Aggregator ---

  getTableStatusMatrix() {
    const tables = [
      { id: 'T01', capacity: 2 },
      { id: 'T02', capacity: 2 },
      { id: 'T03', capacity: 4 },
      { id: 'T04', capacity: 4 },
      { id: 'T05', capacity: 6 },
      { id: 'T06', capacity: 6 },
      { id: 'T07', capacity: 8 },
      { id: 'T08', capacity: 4 }
    ];

    const orders = this.getOrders();
    const serviceReqs = this.getServiceRequests();

    return tables.map(tbl => {
      const activeOrder = orders.find(o => o.table_id === tbl.id && o.status !== 'paid' && o.status !== 'cancelled');
      const activeReq = serviceReqs.find(r => r.table_id === tbl.id && r.status === 'active');

      let status = 'vacant';
      if (activeOrder) {
        status = activeOrder.status === 'ready' ? 'ready' : 'occupied';
      }
      if (activeReq && activeReq.type === 'bill') {
        status = 'billing';
      }

      return {
        ...tbl,
        status,
        active_order: activeOrder || null,
        service_alert: activeReq || null
      };
    });
  }

  // --- Event Subscriptions ---

  subscribe(topic, callback) {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    this.listeners.get(topic).add(callback);

    // Immediate initial call
    if (topic === 'orders') callback(this.getOrders());
    if (topic === 'service_requests') callback(this.getServiceRequests());
    if (topic === 'inventory') callback(this.getSoldOutItems());

    return () => {
      const set = this.listeners.get(topic);
      if (set) set.delete(callback);
    };
  }

  _notify(topic, data) {
    const set = this.listeners.get(topic);
    if (set) {
      set.forEach(cb => {
        try { cb(data); } catch (e) { console.error('Listener error:', e); }
      });
    }
  }

  _notifyAll() {
    this._notify('orders', this.getOrders());
    this._notify('service_requests', this.getServiceRequests());
    this._notify('inventory', this.getSoldOutItems());
  }

  _broadcast(msg) {
    if (this.bc) {
      try { this.bc.postMessage(msg); } catch (e) { console.warn('Broadcast failed:', e); }
    }
  }

  _handleBroadcast(msg) {
    if (!msg || !msg.type) return;
    this._notifyAll();
  }

  _seedIfEmpty() {
    try {
      if (!localStorage.getItem(this.storagePrefix + 'orders')) {
        const initialOrders = [
          {
            order_id: 'ORD-8921',
            table_id: 'T05',
            type: 'dine_in',
            status: 'pending',
            items: [
              {
                item_id: 'wf-gourmet-burger',
                name: 'Woodfire Gourmet Burger',
                qty: 2,
                unit_price: 24.90,
                total_price: 49.80,
                station: 'grill',
                selected_modifiers: [{ group_name: 'Bun', option_name: 'Toasted Brioche', price: 0 }],
                notes: '1x No Barbecue Sauce',
                is_bumped: false,
                line_id: 'line_1'
              },
              {
                item_id: 'wf-truffle-fries',
                name: 'Parmesan Truffle Fries',
                qty: 1,
                unit_price: 14.00,
                total_price: 14.00,
                station: 'fry',
                selected_modifiers: [],
                notes: '',
                is_bumped: false,
                line_id: 'line_2'
              },
              {
                item_id: 'wf-shake-salted-caramel',
                name: 'Salted Caramel Shake',
                qty: 2,
                unit_price: 16.00,
                total_price: 32.00,
                station: 'bar',
                selected_modifiers: [],
                notes: '',
                is_bumped: true,
                line_id: 'line_3'
              }
            ],
            subtotal: 95.80,
            tax: 5.75,
            total_amount: 101.55,
            payment_method: 'unpaid',
            created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
            paid_at: null
          },
          {
            order_id: 'ORD-8920',
            table_id: 'T02',
            type: 'dine_in',
            status: 'pending',
            items: [
              {
                item_id: 'wf-brisket-burger',
                name: 'Smoked Brisket Burger',
                qty: 1,
                unit_price: 29.90,
                total_price: 29.90,
                station: 'grill',
                selected_modifiers: [{ group_name: 'Spice', option_name: 'Spicy Chipotle', price: 0 }],
                notes: 'Extra Pickles',
                is_bumped: false,
                line_id: 'line_4'
              },
              {
                item_id: 'wf-curly-fries',
                name: 'Seasoned Curly Fries',
                qty: 1,
                unit_price: 9.50,
                total_price: 9.50,
                station: 'fry',
                selected_modifiers: [],
                notes: '',
                is_bumped: false,
                line_id: 'line_5'
              }
            ],
            subtotal: 39.40,
            tax: 2.36,
            total_amount: 41.76,
            payment_method: 'unpaid',
            created_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
            paid_at: null
          }
        ];
        localStorage.setItem(this.storagePrefix + 'orders', JSON.stringify(initialOrders));
      }

      if (!localStorage.getItem(this.storagePrefix + 'service_requests')) {
        const initialReqs = [
          {
            id: 'SR-001',
            table_id: 'T05',
            type: 'water',
            note: '2 glasses of iced water requested',
            status: 'active',
            created_at: new Date().toISOString()
          }
        ];
        localStorage.setItem(this.storagePrefix + 'service_requests', JSON.stringify(initialReqs));
      }
    } catch (e) {
      console.warn('Could not seed initial state:', e);
    }
  }
}

export const hub = new RealtimeHub();
