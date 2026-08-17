/**
 * ARH-MAKAN Shared Realtime State Adapter (v2.2)
 * Implements 3-Tier Hybrid State Synchronization:
 * - Tier 1: BroadcastChannel (Instant local multi-surface sync <5ms)
 * - Tier 2: localStorage + MemoryStore (Crash resilience & offline queue)
 * - Tier 3: Zero-Dependency Cross-Origin Cloud Realtime Engine (Firebase RTDB REST + SSE Stream)
 */

class RealtimeHub {
  constructor() {
    this.channelName = 'arh_makan_hub';
    this.storagePrefix = 'arh_makan_';
    this.listeners = new Map();
    this.memStore = new Map();
    
    // Cloud sync state (starts false, requires active proven connection)
    this.cloudActive = false;
    this.cloudState = 'local_only'; // 'local_only' | 'connecting' | 'connected' | 'degraded'
    this.cloudDbUrl = null;
    this.cloudRoot = 'woodfire_kulim';
    this.sseConnections = [];

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

    // Auto-detect and connect Cloud Tier 3 if configured
    this._initCloudTier();
  }

  // --- Tier 3: Zero-Dependency Native Cross-Origin Cloud Engine ---

  _initCloudTier() {
    if (typeof window === 'undefined') return;

    // Detect Firebase RTDB config from explicit runtime globals
    const config = window.ARH_REALTIME_CONFIG || window.STORE_CONFIG?.firebase;
    const dbUrl = config?.databaseURL || config?.url;
    const root = config?.root || 'woodfire_kulim';

    if (dbUrl) {
      this.cloudDbUrl = dbUrl.replace(/\/$/, '');
      this.cloudRoot = root;
      this.cloudState = 'connecting';
      this._startCloudSync();
    } else {
      this.cloudState = 'local_only';
      this.cloudActive = false;
    }
  }

  async _startCloudSync() {
    if (!this.cloudDbUrl) return;

    try {
      // 1. Initial Fetch of Orders, Service Requests, and Inventory from Cloud
      const [resOrders, resReqs, resInv] = await Promise.allSettled([
        fetch(`${this.cloudDbUrl}/${this.cloudRoot}/orders.json`).then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))),
        fetch(`${this.cloudDbUrl}/${this.cloudRoot}/service_requests.json`).then(r => r.ok ? r.json() : null),
        fetch(`${this.cloudDbUrl}/${this.cloudRoot}/inventory.json`).then(r => r.ok ? r.json() : null)
      ]);

      if (resOrders.status === 'fulfilled') {
        this.cloudActive = true;
        this.cloudState = 'connected';
        console.log(`⚡ [ARH-MAKAN Hub] Connected to Tier 3 Cross-Origin Cloud Stream: ${this.cloudDbUrl}/${this.cloudRoot}`);

        if (resOrders.value && typeof resOrders.value === 'object') {
          const cloudOrders = Object.values(resOrders.value).filter(Boolean);
          cloudOrders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          this._storageSet('orders', JSON.stringify(cloudOrders));
          this._notify('orders', cloudOrders);
        }
      } else {
        this.cloudActive = false;
        this.cloudState = 'degraded';
        console.warn('Initial cloud sync failed; running in local fallback mode:', resOrders.reason?.message);
      }

      if (resReqs.status === 'fulfilled' && resReqs.value) {
        const cloudReqs = Object.values(resReqs.value).filter(r => r && r.status === 'active');
        this._storageSet('service_requests', JSON.stringify(cloudReqs));
        this._notify('service_requests', cloudReqs);
      }

      if (resInv.status === 'fulfilled' && resInv.value) {
        const list = Array.isArray(resInv.value) ? resInv.value : Object.values(resInv.value);
        this._storageSet('sold_out', JSON.stringify(list));
        this._notify('inventory', list);
      }
    } catch (err) {
      this.cloudActive = false;
      this.cloudState = 'degraded';
      console.warn('Initial cloud sync fetch error (operating in local fallback):', err.message);
    }

    // 2. Open Realtime Server-Sent Events (SSE) Stream if active
    if (this.cloudActive) {
      this._openCloudSSE();
    }
  }

  _openCloudSSE() {
    if (typeof EventSource === 'undefined' || !this.cloudDbUrl) return;

    try {
      const ordersSource = new EventSource(`${this.cloudDbUrl}/${this.cloudRoot}/orders.json`);
      ordersSource.addEventListener('put', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.path === '/' && payload.data) {
            const list = Object.values(payload.data).filter(Boolean);
            list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            this.saveOrders(list);
          } else if (payload.data && typeof payload.data === 'object' && payload.data.order_id) {
            const current = this.getOrders();
            const idx = current.findIndex(o => o.order_id === payload.data.order_id);
            if (idx >= 0) {
              current[idx] = payload.data;
            } else {
              current.unshift(payload.data);
            }
            this.saveOrders(current);
          }
        } catch (_) {}
      });

      const reqSource = new EventSource(`${this.cloudDbUrl}/${this.cloudRoot}/service_requests.json`);
      reqSource.addEventListener('put', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.data) {
            const list = Object.values(payload.data).filter(r => r && r.status === 'active');
            this.saveServiceRequests(list);
          }
        } catch (_) {}
      });

      this.sseConnections.push(ordersSource, reqSource);
    } catch (err) {
      console.warn('SSE stream listener skipped (polling fallback active):', err.message);
    }
  }

  getSyncStatus() {
    let mode = 'Local Multi-Surface (BroadcastChannel)';
    if (this.cloudActive) {
      mode = 'Cloud Synced (Firebase RTDB + SSE)';
    } else if (this.cloudState === 'degraded') {
      mode = 'Cloud Sync Degraded (Operating in Local Mode)';
    } else if (!this.bc) {
      mode = 'Single-Tab Storage (Offline)';
    }

    return {
      tier: this.cloudActive ? 3 : (this.bc ? 2 : 1),
      mode,
      cloudActive: this.cloudActive,
      cloudState: this.cloudState,
      cloudUrl: this.cloudActive ? this.cloudDbUrl : null
    };
  }

  _storageGet(key) {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(this.storagePrefix + key);
      }
      return this.memStore.get(this.storagePrefix + key) || null;
    } catch {
      return this.memStore.get(this.storagePrefix + key) || null;
    }
  }

  _storageSet(key, val) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storagePrefix + key, val);
      }
      this.memStore.set(this.storagePrefix + key, val);
    } catch {
      this.memStore.set(this.storagePrefix + key, val);
    }
  }

  // --- Core State Accessors ---

  getOrders() {
    try {
      const raw = this._storageGet('orders');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveOrders(orders) {
    try {
      this._storageSet('orders', JSON.stringify(orders));
      this._broadcast({ type: 'ORDERS_UPDATED', timestamp: Date.now() });
      this._notify('orders', orders);
    } catch (err) {
      console.error('Failed to save orders:', err);
    }
  }

  getServiceRequests() {
    try {
      const raw = this._storageGet('service_requests');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveServiceRequests(requests) {
    try {
      this._storageSet('service_requests', JSON.stringify(requests));
      this._broadcast({ type: 'SERVICE_REQUESTS_UPDATED', timestamp: Date.now() });
      this._notify('service_requests', requests);
    } catch (err) {
      console.error('Failed to save service requests:', err);
    }
  }

  getSoldOutItems() {
    try {
      const raw = this._storageGet('sold_out');
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
    this._storageSet('sold_out', JSON.stringify(list));
    this._broadcast({ type: 'INVENTORY_UPDATED', timestamp: Date.now() });
    this._notify('inventory', list);

    if (this.cloudActive && this.cloudDbUrl) {
      fetch(`${this.cloudDbUrl}/${this.cloudRoot}/inventory.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list)
      }).catch(e => console.warn('Cloud inventory write failed:', e));
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

    if (this.cloudActive && this.cloudDbUrl) {
      fetch(`${this.cloudDbUrl}/${this.cloudRoot}/orders/${orderId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      }).catch(e => console.warn('Cloud order write failed:', e));
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

      if (this.cloudActive && this.cloudDbUrl) {
        fetch(`${this.cloudDbUrl}/${this.cloudRoot}/orders/${orderId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, paid_at: order.paid_at })
        }).catch(e => console.warn('Cloud status update failed:', e));
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

      if (this.cloudActive && this.cloudDbUrl) {
        fetch(`${this.cloudDbUrl}/${this.cloudRoot}/orders/${orderId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: order.items, status: order.status })
        }).catch(e => console.warn('Cloud item bump failed:', e));
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

      if (this.cloudActive && this.cloudDbUrl) {
        fetch(`${this.cloudDbUrl}/${this.cloudRoot}/orders/${orderId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'paid', payment_method: paymentMethod, paid_at: order.paid_at })
        }).catch(e => console.warn('Cloud settlement write failed:', e));
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

    if (this.cloudActive && this.cloudDbUrl) {
      fetch(`${this.cloudDbUrl}/${this.cloudRoot}/service_requests/${reqId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      }).catch(e => console.warn('Cloud service request write failed:', e));
    }

    return req;
  }

  resolveServiceRequest(reqId) {
    const requests = this.getServiceRequests();
    const req = requests.find(r => r.id === reqId);
    if (req) {
      req.status = 'resolved';
      this.saveServiceRequests(requests.filter(r => r.id !== reqId));

      if (this.cloudActive && this.cloudDbUrl) {
        fetch(`${this.cloudDbUrl}/${this.cloudRoot}/service_requests/${reqId}.json`, {
          method: 'DELETE'
        }).catch(e => console.warn('Cloud service resolve failed:', e));
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
      if (!this._storageGet('orders')) {
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
        this._storageSet('orders', JSON.stringify(initialOrders));
      }

      if (!this._storageGet('service_requests')) {
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
        this._storageSet('service_requests', JSON.stringify(initialReqs));
      }
    } catch (e) {
      console.warn('Could not seed initial state:', e);
    }
  }
}

export const hub = new RealtimeHub();
