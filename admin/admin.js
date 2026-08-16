import { hub } from '../shared/realtime-adapter.js';

let menuData = null;

async function init() {
  try {
    const res = await fetch('../shared/mock-data/menu.json');
    menuData = await res.json();
    renderKPIs();
    renderStockToggles();
    renderOrdersTable();
    renderQRGenerator();
  } catch (e) {
    console.error('Failed to init admin:', e);
  }
}

// Render KPI Cards
function renderKPIs() {
  const orders = hub.getOrders();
  const paidOrders = orders.filter(o => o.status === 'paid');
  const activeOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');

  const totalRev = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  document.getElementById('kpi-rev').innerText = `RM ${totalRev.toFixed(2)}`;
  document.getElementById('kpi-total-orders').innerText = orders.length;
  document.getElementById('kpi-active').innerText = activeOrders.length;
  document.getElementById('kpi-avg-prep').innerText = '14m';
}

// 86 / Sold Out Inventory Toggles
function renderStockToggles() {
  const container = document.getElementById('admin-stock-grid');
  if (!container || !menuData) return;

  const soldOutList = hub.getSoldOutItems();

  container.innerHTML = menuData.items.map(item => {
    const isSoldOut = soldOutList.includes(item.id);
    return `
      <div class="stock-card">
        <div>
          <div style="font-weight: 600;">${item.name}</div>
          <div class="mono text-muted text-xs">RM ${item.price.toFixed(2)} · ${item.station.toUpperCase()}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.75rem; color: ${isSoldOut ? 'var(--color-danger)' : 'var(--color-success)'}; font-weight: bold;">
            ${isSoldOut ? '86 / Sold Out' : 'Available'}
          </span>
          <label class="toggle-switch">
            <input type="checkbox" ${isSoldOut ? '' : 'checked'} onchange="window.toggleStock('${item.id}')">
            <span class="slider"></span>
          </label>
        </div>
      </div>
    `;
  }).join('');
}

window.toggleStock = (itemId) => {
  hub.toggleSoldOut(itemId);
  renderStockToggles();
};

// Orders Audit Table
function renderOrdersTable() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  const orders = hub.getOrders();

  tbody.innerHTML = orders.map(o => `
    <tr style="border-bottom: 1px solid var(--border-subtle);">
      <td class="mono" style="padding: 12px; font-weight: bold;">#${o.order_id}</td>
      <td style="padding: 12px;">TABLE ${o.table_id}</td>
      <td style="padding: 12px;">${o.items.length} items</td>
      <td class="mono text-gold" style="padding: 12px; font-weight: bold;">RM ${o.total_amount.toFixed(2)}</td>
      <td style="padding: 12px;">
        <span class="badge ${o.status === 'paid' ? 'badge-success' : o.status === 'ready' ? 'badge-gold' : 'badge-warning'}">
          ${o.status.toUpperCase()}
        </span>
      </td>
      <td class="mono text-muted text-xs" style="padding: 12px;">${new Date(o.created_at).toLocaleTimeString()}</td>
    </tr>
  `).join('');
}

// 1-Click Printable QR Codes Generator
function renderQRGenerator() {
  const container = document.getElementById('admin-qr-grid');
  if (!container) return;

  const tables = ['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08'];
  const host = window.location.origin;

  container.innerHTML = tables.map(t => {
    const url = `${host}/customer/?table=${t}`;
    return `
      <div class="card-glass" style="padding: 16px; text-align: center;">
        <div style="font-family: var(--font-display); font-weight: bold; font-size: 1.2rem; color: var(--gold-light);">
          TABLE ${t}
        </div>
        <div style="background: white; padding: 12px; border-radius: 8px; margin: 10px auto; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center;">
          <!-- SVG QR Code Placeholder -->
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <rect width="100" height="100" fill="#fff"/>
            <rect x="10" y="10" width="25" height="25" fill="#000"/>
            <rect x="15" y="15" width="15" height="15" fill="#fff"/>
            <rect x="65" y="10" width="25" height="25" fill="#000"/>
            <rect x="70" y="15" width="15" height="15" fill="#fff"/>
            <rect x="10" y="65" width="25" height="25" fill="#000"/>
            <rect x="15" y="70" width="15" height="15" fill="#fff"/>
            <rect x="42" y="42" width="16" height="16" fill="#000"/>
            <rect x="42" y="15" width="8" height="20" fill="#000"/>
            <rect x="65" y="45" width="20" height="8" fill="#000"/>
            <rect x="45" y="65" width="15" height="20" fill="#000"/>
          </svg>
        </div>
        <div class="text-xs text-muted mono" style="word-break: break-all;">?table=${t}</div>
        <a href="../customer/index.html?table=${t}" target="_blank" class="btn btn-sm btn-primary" style="margin-top: 8px; width: 100%;">
          Test Menu ↗
        </a>
      </div>
    `;
  }).join('');
}

// Navigation Tabs
document.querySelectorAll('.admin-nav-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-section-pane').forEach(p => p.style.display = 'none');

    e.currentTarget.classList.add('active');
    const target = e.currentTarget.dataset.target;
    const pane = document.getElementById(target);
    if (pane) pane.style.display = 'block';
  });
});

// Subscriptions
hub.subscribe('orders', () => {
  renderKPIs();
  renderOrdersTable();
});

init();
