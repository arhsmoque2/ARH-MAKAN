import { hub } from '../shared/realtime-adapter.js';
import { QRCode } from '../shared/qr-generator.js';

let menuData = null;

async function init() {
  try {
    const res = await fetch('../shared/mock-data/menu.json');
    menuData = await res.json();
    updateSyncHUD();
    renderKPIs();
    renderAdminAnalytics();
    renderStockToggles();
    renderOrdersTable();
    renderQRGenerator();

    hub.subscribe(() => {
      updateSyncHUD();
      renderKPIs();
      renderAdminAnalytics();
      renderOrdersTable();
    });

    // Listen for DevCon feature gate broadcasts
    if (hub.bc) {
      hub.bc.addEventListener('message', (e) => {
        if (e.data?.type === 'CONFIG_TOGGLE' && e.data?.payload?.key === 'show_admin_analytics') {
          renderAdminAnalytics();
        }
      });
    }
  } catch (e) {
    console.error('Failed to init admin:', e);
  }
}

function updateSyncHUD() {
  const badge = document.getElementById('sync-status-text');
  if (!badge) return;
  const status = hub.getSyncStatus();
  badge.innerText = status.mode;
}

// Render KPI Cards
function renderKPIs() {
  const orders = hub.getOrders();
  const paidOrders = orders.filter(o => o.status === 'paid');
  const activeOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');

  const totalRev = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const aov = paidOrders.length > 0 ? (totalRev / paidOrders.length) : 0;

  const kpiRev = document.getElementById('kpi-rev');
  const kpiTotal = document.getElementById('kpi-total-orders');
  const kpiAov = document.getElementById('kpi-aov');
  const kpiActive = document.getElementById('kpi-active');
  const ordersSub = document.getElementById('admin-orders-sub');

  if (kpiRev) kpiRev.innerText = `RM ${totalRev.toFixed(2)}`;
  if (kpiTotal) kpiTotal.innerText = orders.length;
  if (kpiAov) kpiAov.innerText = `RM ${aov.toFixed(2)}`;
  if (kpiActive) kpiActive.innerText = activeOrders.length;
  if (ordersSub) ordersSub.innerText = `${paidOrders.length} Paid · ${activeOrders.length} Active`;
}

// In-App Sales & Velocity Section (Gated by DevCon Toggle)
function renderAdminAnalytics() {
  const section = document.getElementById('admin-analytics-section');
  if (!section) return;

  const isEnabled = localStorage.getItem('arh_admin_show_analytics') !== 'false';
  section.style.display = isEnabled ? 'block' : 'none';

  if (!isEnabled) return;

  const orders = hub.getOrders();

  // 1. Top Selling Products
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
    .slice(0, 4);

  const topListEl = document.getElementById('admin-top-products-list');
  if (topListEl) {
    if (sortedItems.length === 0) {
      topListEl.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 12px;">No shift sales recorded yet.</div>';
    } else {
      topListEl.innerHTML = sortedItems.map((item, idx) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--bg-surface-raised); border-radius: var(--radius-sm); font-size: 0.85rem;">
          <div>
            <span style="color: var(--gold-light); font-weight: bold; margin-right: 6px;">#${idx + 1}</span>
            <span style="font-weight: 500;">${item.name}</span>
            <span class="mono text-muted" style="font-size: 0.72rem; margin-left: 6px;">(${item.count} sold)</span>
          </div>
          <div class="mono text-gold" style="font-weight: bold;">RM ${item.revenue.toFixed(2)}</div>
        </div>
      `).join('');
    }
  }

  // 2. Hourly Heatmap
  const chartEl = document.getElementById('admin-hourly-heatmap');
  if (chartEl) {
    const hours = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    const hourCounts = new Array(12).fill(0);

    orders.forEach(o => {
      const d = new Date(o.created_at || Date.now());
      const h = d.getHours();
      const idx = hours.indexOf(h);
      if (idx !== -1) hourCounts[idx]++;
      else hourCounts[1]++;
    });

    const maxVal = Math.max(...hourCounts, 1);

    chartEl.innerHTML = hourCounts.map((val, idx) => {
      const pct = Math.max((val / maxVal) * 100, 8);
      return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;" title="${hours[idx]}:00 — ${val} orders">
          <div class="mono text-muted" style="font-size: 0.65rem; margin-bottom: 2px;">${val}</div>
          <div style="width: 100%; height: ${pct}%; background: linear-gradient(180deg, var(--gold-light) 0%, var(--gold-dark) 100%); border-radius: 3px 3px 0 0; min-height: 4px;"></div>
        </div>
      `;
    }).join('');
  }
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

// 1-Click Printable Dynamic Scannable QR Codes Generator
function renderQRGenerator() {
  const container = document.getElementById('admin-qr-grid');
  if (!container) return;

  const tables = ['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08'];
  const origin = window.location.origin;
  const pathPrefix = window.location.pathname.replace(/\/admin\/.*$/, '');

  container.innerHTML = tables.map(t => {
    const targetUrl = `${origin}${pathPrefix}/customer/index.html?table=${t}`;
    const svgContent = QRCode.generateSvg(targetUrl, {
      size: 140,
      margin: 1,
      dark: '#080604',
      light: '#ffffff'
    });

    return `
      <div class="card-glass" style="padding: 16px; text-align: center; display: flex; flex-direction: column; align-items: center;">
        <div style="font-family: var(--font-display); font-weight: bold; font-size: 1.25rem; color: var(--gold-light);">
          TABLE ${t}
        </div>
        <div style="background: white; padding: 8px; border-radius: 12px; margin: 10px auto; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,0.3);">
          ${svgContent}
        </div>
        <div class="text-xs text-muted mono" style="word-break: break-all; margin-bottom: 8px;">?table=${t}</div>
        <div style="display: flex; gap: 6px; width: 100%;">
          <a href="../customer/index.html?table=${t}" target="_blank" class="btn btn-sm btn-secondary" style="flex: 1; text-align: center; text-decoration: none; padding: 6px 4px; font-size: 0.75rem;">
            Test ↗
          </a>
          <button class="btn btn-sm btn-primary" onclick="window.downloadTableQR('${t}', '${targetUrl}')" style="flex: 1; padding: 6px 4px; font-size: 0.75rem;">
            Download
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.downloadTableQR = (tableId, targetUrl) => {
  const canvas = document.createElement('canvas');
  QRCode.renderCanvas(canvas, targetUrl, { size: 600, margin: 2 });
  const a = document.createElement('a');
  a.download = `table-${tableId}-qr.png`;
  a.href = canvas.toDataURL('image/png');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

window.printAllTentCards = () => {
  const tables = ['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08'];
  const origin = window.location.origin;
  const pathPrefix = window.location.pathname.replace(/\/admin\/.*$/, '');

  const cardsHtml = tables.map(t => {
    const targetUrl = `${origin}${pathPrefix}/customer/index.html?table=${t}`;
    const svg = QRCode.generateSvg(targetUrl, { size: 180, margin: 2 });
    return `
      <div style="
        border: 2px solid #000;
        border-radius: 12px;
        padding: 20px;
        width: 240px;
        text-align: center;
        page-break-inside: avoid;
        margin: 10px;
        display: inline-block;
        font-family: sans-serif;
      ">
        <div style="font-size: 16px; font-weight: bold; letter-spacing: 1px;">WOODFIRE</div>
        <div style="font-size: 11px; color: #555; margin-bottom: 12px;">DINE-IN ORDERING</div>
        <div style="display: flex; justify-content: center; margin-bottom: 12px;">${svg}</div>
        <div style="font-size: 20px; font-weight: 900;">TABLE ${t}</div>
        <div style="font-size: 10px; color: #777; margin-top: 6px;">Scan to view menu & order</div>
      </div>
    `;
  }).join('');

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <html>
      <head>
        <title>Table Tent Cards</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { margin: 0; padding: 0; background: #fff; text-align: center; }
        </style>
      </head>
      <body>
        <div style="display: flex; flex-wrap: wrap; justify-content: center;">
          ${cardsHtml}
        </div>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 250);
};

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
