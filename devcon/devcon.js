import { hub } from '../shared/realtime-adapter.js';

let menuData = null;
let telemetryEvents = [];

async function init() {
  try {
    const res = await fetch('../shared/mock-data/menu.json');
    menuData = await res.json();
    initNavigation();
    initFeatureGates();
    refreshAll();

    // Listen to realtime updates
    hub.subscribe(() => {
      refreshAll();
    });

    // Capture telemetry events
    setupTelemetryCapture();
  } catch (e) {
    console.error('Failed to initialize DevCon:', e);
  }
}

function refreshAll() {
  updateSyncBadge();
  renderSalesAnalytics();
  renderStateInspector();
  renderTelemetryLogs();
}

// Navigation Tabs
function initNavigation() {
  const navBtns = document.querySelectorAll('.devcon-nav-btn');
  const panes = document.querySelectorAll('.devcon-pane');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.style.display = 'none');

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.target);
      if (target) target.style.display = 'block';
    });
  });
}

function updateSyncBadge() {
  const modeEl = document.getElementById('devcon-sync-mode');
  if (modeEl) {
    const status = hub.getSyncStatus();
    modeEl.innerText = `${status.mode} (${status.activeOrders} orders)`;
  }
}

// 1. In-App Sales & Velocity Analytics Engine
function renderSalesAnalytics() {
  const orders = hub.getOrders();
  const paidOrders = orders.filter(o => o.status === 'paid');
  const activeOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');

  const grossRev = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const taxTotal = grossRev - (grossRev / 1.06);
  const aov = paidOrders.length > 0 ? (grossRev / paidOrders.length) : 0;

  // Update KPIs
  const grossEl = document.getElementById('analytics-gross-rev');
  const totalVolEl = document.getElementById('analytics-total-orders');
  const paidSplitEl = document.getElementById('analytics-paid-split');
  const aovEl = document.getElementById('analytics-aov');
  const taxEl = document.getElementById('analytics-tax-total');

  if (grossEl) grossEl.innerText = `RM ${grossRev.toFixed(2)}`;
  if (totalVolEl) totalVolEl.innerText = `${orders.length} Orders`;
  if (paidSplitEl) paidSplitEl.innerText = `${paidOrders.length} Paid · ${activeOrders.length} In-Prep`;
  if (aovEl) aovEl.innerText = `RM ${aov.toFixed(2)}`;
  if (taxEl) taxEl.innerText = `RM ${taxTotal.toFixed(2)}`;

  // Calculate Product Leaderboard
  const itemMap = new Map();
  orders.forEach(o => {
    (o.items || []).forEach(it => {
      const current = itemMap.get(it.name) || { count: 0, revenue: 0, category: it.station || 'grill' };
      current.count += (it.qty || 1);
      current.revenue += (it.total_price || (it.unit_price || 0) * (it.qty || 1));
      itemMap.set(it.name, current);
    });
  });

  const sortedItems = Array.from(itemMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const leaderboardEl = document.getElementById('analytics-leaderboard');
  if (leaderboardEl) {
    if (sortedItems.length === 0) {
      leaderboardEl.innerHTML = '<div class="text-muted text-xs py-4 text-center">No orders recorded yet for this shift.</div>';
    } else {
      leaderboardEl.innerHTML = sortedItems.map((item, idx) => `
        <div class="leaderboard-item">
          <div style="display: flex; align-items: center;">
            <div class="leaderboard-rank">${idx + 1}</div>
            <div>
              <div style="font-weight: 600; font-size: 0.9rem;">${item.name}</div>
              <div class="text-xs text-muted">${item.category.toUpperCase()} · ${item.count} sold</div>
            </div>
          </div>
          <div class="mono text-gold" style="font-weight: 700;">RM ${item.revenue.toFixed(2)}</div>
        </div>
      `).join('');
    }
  }

  // Calculate Hourly Distribution
  renderHourlyHeatmap(orders);

  // Render Customer Sentiment & Reviews
  renderCustomerReviewsList();
}

function renderCustomerReviewsList() {
  const container = document.getElementById('devcon-reviews-list');
  const badge = document.getElementById('sentiment-score-badge');
  if (!container) return;

  const reviews = hub.getCustomerReviews();
  if (reviews.length === 0) {
    container.innerHTML = '<div class="text-muted text-xs py-4 text-center" style="grid-column: 1 / -1;">No customer reviews submitted yet. Submit a rating on the Customer screen to preview live telemetry.</div>';
    if (badge) badge.innerText = 'Avg: 5.0 / 5.0 ⭐ (0 Reviews)';
    return;
  }

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  if (badge) badge.innerText = `Avg: ${avgRating} / 5.0 ⭐ (${reviews.length} Reviews)`;

  container.innerHTML = reviews.slice(0, 6).map(r => `
    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-weight: 700; color: var(--gold-light);">Table ${r.table_id}</span>
        <span style="font-size: 0.9rem;">${'⭐'.repeat(r.rating)}</span>
      </div>
      ${r.tags && r.tags.length ? `
        <div style="display: flex; flex-wrap: wrap; gap: 4px; margin: 4px 0;">
          ${r.tags.map(t => `<span class="badge" style="font-size: 0.68rem; padding: 2px 6px;">${t}</span>`).join('')}
        </div>
      ` : ''}
      ${r.comment ? `<p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px; font-style: italic;">"${r.comment}"</p>` : ''}
      <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 6px; text-align: right;">${new Date(r.created_at).toLocaleTimeString()}</div>
    </div>
  `).join('');
}

function renderHourlyHeatmap(orders) {
  const chartEl = document.getElementById('analytics-hourly-chart');
  if (!chartEl) return;

  const hours = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  const hourCounts = new Array(12).fill(0);

  orders.forEach(o => {
    const d = new Date(o.created_at || Date.now());
    const h = d.getHours();
    const idx = hours.indexOf(h);
    if (idx !== -1) {
      hourCounts[idx]++;
    } else if (h >= 11 && h <= 22) {
      hourCounts[h - 11]++;
    } else {
      hourCounts[1]++; // default bucket
    }
  });

  const maxVal = Math.max(...hourCounts, 1);

  chartEl.innerHTML = hourCounts.map((val, idx) => {
    const pct = Math.max((val / maxVal) * 100, 6);
    return `
      <div class="hourly-bar-col" title="${hours[idx]}:00 — ${val} orders">
        <div class="hourly-bar-val">${val}</div>
        <div class="hourly-bar" style="height: ${pct}%;"></div>
      </div>
    `;
  }).join('');
}

// 2. Feature Gates & Admin Visibility Controls
function initFeatureGates() {
  const adminToggle = document.getElementById('gate-admin-analytics-toggle');
  const indicator = document.getElementById('admin-view-text');

  const isEnabled = localStorage.getItem('arh_admin_show_analytics') !== 'false';
  if (adminToggle) adminToggle.checked = isEnabled;
  if (indicator) {
    indicator.innerText = isEnabled ? 'ENABLED' : 'DISABLED';
    indicator.style.color = isEnabled ? 'var(--color-success)' : 'var(--color-danger)';
  }
}

window.toggleAdminAnalyticsView = (enabled) => {
  localStorage.setItem('arh_admin_show_analytics', enabled ? 'true' : 'false');
  const indicator = document.getElementById('admin-view-text');
  if (indicator) {
    indicator.innerText = enabled ? 'ENABLED' : 'DISABLED';
    indicator.style.color = enabled ? 'var(--color-success)' : 'var(--color-danger)';
  }

  // Broadcast toggle event across surfaces
  if (hub && hub.bc) {
    hub.bc.postMessage({
      type: 'CONFIG_TOGGLE',
      payload: { key: 'show_admin_analytics', value: enabled }
    });
  }
};

window.toggleAudioGate = (enabled) => {
  localStorage.setItem('arh_audio_enabled', enabled ? 'true' : 'false');
};

window.toggleTableSLAGate = (enabled) => {
  localStorage.setItem('arh_table_sla_enabled', enabled ? 'true' : 'false');
};

// 3. Error Telemetry & Monitoring (Beacon style)
function setupTelemetryCapture() {
  window.addEventListener('error', (evt) => {
    logTelemetryEvent('EXCEPTION', 'DevCon', evt.message, { filename: evt.filename, lineno: evt.lineno });
  });

  window.addEventListener('unhandledrejection', (evt) => {
    logTelemetryEvent('PROMISE_REJECTION', 'DevCon', evt.reason?.message || String(evt.reason), {});
  });
}

function logTelemetryEvent(type, surface, signature, details) {
  telemetryEvents.unshift({
    timestamp: new Date().toISOString(),
    type,
    surface,
    signature,
    details
  });
  if (telemetryEvents.length > 50) telemetryEvents.pop();
  renderTelemetryLogs();
}

function renderTelemetryLogs() {
  const tbody = document.getElementById('telemetry-log-tbody');
  const errCountEl = document.getElementById('telemetry-error-count');
  if (!tbody) return;

  if (errCountEl) {
    errCountEl.innerText = telemetryEvents.length;
    errCountEl.style.color = telemetryEvents.length === 0 ? 'var(--color-success)' : 'var(--color-danger)';
  }

  if (telemetryEvents.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">
          ✅ Clean Flight Record — 0 Active Exceptions captured.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = telemetryEvents.map(ev => `
    <tr>
      <td class="mono text-xs text-muted">${new Date(ev.timestamp).toLocaleTimeString()}</td>
      <td><span class="badge ${ev.type === 'EXCEPTION' ? 'badge-danger' : 'badge-gold'}">${ev.type}</span></td>
      <td><strong>${ev.surface}</strong></td>
      <td class="mono text-xs" style="color: var(--gold-light);">${ev.signature}</td>
      <td class="mono text-xs text-muted">${JSON.stringify(ev.details || {})}</td>
    </tr>
  `).join('');
}

window.simulateTestError = () => {
  logTelemetryEvent('EXCEPTION', 'KDS_Terminal', 'AudioContext autoplay blocked by browser policy', { code: 'AUTOPLAY_POLICY', frequency: 1 });
  logTelemetryEvent('NETWORK_WARN', 'ShowroomBridge', 'Cross-origin RTDB endpoint latency >120ms', { status: 'degraded' });
};

window.clearTelemetryLogs = () => {
  telemetryEvents = [];
  renderTelemetryLogs();
};

window.exportTelemetryJSONL = () => {
  const jsonl = telemetryEvents.map(e => JSON.stringify(e)).join('\n') || JSON.stringify({ status: "CLEAN_HEURISTIC_RECORD", timestamp: new Date().toISOString() });
  const blob = new Blob([jsonl], { type: 'application/jsonl' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `arh_telemetry_${Date.now()}.jsonl`;
  a.click();
};

// 4. Realtime State Inspector
function renderStateInspector() {
  const dumpEl = document.getElementById('raw-state-dump');
  const bytesEl = document.getElementById('state-storage-bytes');
  const countEl = document.getElementById('state-order-count');

  const orders = hub.getOrders();
  const rawDump = {
    syncMode: hub.getSyncStatus(),
    soldOutItems: hub.getSoldOutItems(),
    ordersCount: orders.length,
    orders: orders.slice(0, 5)
  };

  if (dumpEl) dumpEl.innerText = JSON.stringify(rawDump, null, 2);

  const rawStorage = JSON.stringify(localStorage);
  const sizeKb = (new Blob([rawStorage]).size / 1024).toFixed(1);
  if (bytesEl) bytesEl.innerText = `${sizeKb} KB`;
  if (countEl) countEl.innerText = `${orders.length} Active Orders in Memory`;
}

window.refreshStateInspector = () => {
  renderStateInspector();
};

// 5. Scenario Injections
window.injectRushHour = () => {
  const tables = ['T01', 'T04', 'T08', 'T12'];
  tables.forEach((tbl, idx) => {
    setTimeout(() => {
      hub.createOrder({
        order_id: 'RUSH-' + Math.floor(1000 + Math.random() * 9000),
        table_id: tbl,
        status: 'pending',
        items: [
          { name: 'Woodfire Double Beef', category: 'burgers', station: 'grill', qty: 2, unit_price: 29.90, total_price: 59.80 },
          { name: 'Curly Fries', category: 'fries', station: 'fry', qty: 1, unit_price: 8.90, total_price: 8.90 },
          { name: 'Salted Caramel Shake', category: 'shakes', station: 'bar', qty: 2, unit_price: 14.90, total_price: 29.80 }
        ],
        subtotal: 98.50,
        tax: 5.91,
        total_amount: 104.41,
        created_at: new Date().toISOString()
      });
    }, idx * 250);
  });
};

window.injectWaiterCalls = () => {
  hub.createServiceRequest('T03', 'water', 'Ice Water');
  hub.createServiceRequest('T07', 'cutlery', 'Extra Cutlery');
  hub.createServiceRequest('T05', 'bill', 'Request Bill');
};

window.injectStockToggle = () => {
  hub.toggleSoldOut('brisket-burger');
  hub.toggleSoldOut('gourmet-burger');
};

window.resetAllData = () => {
  if (confirm('Are you sure you want to reset all shift orders and local storage state?')) {
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  }
};

// Feature Gates Controllers
window.toggleAdminAnalyticsView = (enabled) => {
  localStorage.setItem('gate_show_admin_analytics', enabled ? 'true' : 'false');
  if (hub.bc) {
    hub.bc.postMessage({ type: 'CONFIG_TOGGLE', payload: { key: 'show_admin_analytics', value: enabled } });
  }
};

window.toggleAudioGate = (enabled) => {
  localStorage.setItem('gate_enable_audio', enabled ? 'true' : 'false');
  if (hub.bc) {
    hub.bc.postMessage({ type: 'CONFIG_TOGGLE', payload: { key: 'enable_audio', value: enabled } });
  }
};

window.toggleTableSLAGate = (enabled) => {
  localStorage.setItem('gate_enable_table_sla', enabled ? 'true' : 'false');
  if (hub.bc) {
    hub.bc.postMessage({ type: 'CONFIG_TOGGLE', payload: { key: 'enable_table_sla', value: enabled } });
  }
};

window.toggleDuitNowGate = (enabled) => {
  localStorage.setItem('gate_enable_duitnow', enabled ? 'true' : 'false');
  if (hub.bc) {
    hub.bc.postMessage({ type: 'CONFIG_TOGGLE', payload: { key: 'enable_duitnow', value: enabled } });
  }
};

// Start
init();
