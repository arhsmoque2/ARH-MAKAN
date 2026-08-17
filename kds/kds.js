import { hub } from '../shared/realtime-adapter.js';
import { sound } from '../shared/audio-engine.js';
import { escPos } from '../shared/escpos-formatter.js';

let currentStation = 'all';
let previousOrderCount = 0;

// Audio unlock handler
const audioBtn = document.getElementById('audio-toggle-btn');
const audioBanner = document.getElementById('audio-unlock-banner');

function handleUnlockAudio() {
  sound.unlock();
  if (audioBanner) audioBanner.style.display = 'none';
  if (audioBtn) {
    audioBtn.innerHTML = '🔔 Audio ON';
    audioBtn.classList.remove('btn-secondary');
    audioBtn.classList.add('btn-primary');
  }
}

if (audioBtn) audioBtn.addEventListener('click', handleUnlockAudio);
if (audioBanner) audioBanner.addEventListener('click', handleUnlockAudio);

// Station Filter Selection
document.querySelectorAll('.station-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.station-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    currentStation = e.currentTarget.dataset.station;
    renderTickets(hub.getOrders());
  });
});

// Live Service Requests
function renderServiceAlerts(requests) {
  const alertContainer = document.getElementById('service-alert-container');
  if (!alertContainer) return;

  const activeReqs = requests.filter(r => r.status === 'active');
  if (activeReqs.length === 0) {
    alertContainer.innerHTML = '';
    alertContainer.style.display = 'none';
    return;
  }

  alertContainer.style.display = 'flex';
  alertContainer.innerHTML = activeReqs.map(req => {
    const icon = req.type === 'water' ? '💧' : req.type === 'cutlery' ? '🍴' : req.type === 'bill' ? '🧾' : '🛎️';
    return `
      <div class="service-alert-item">
        <span>${icon} <strong>Table ${req.table_id}</strong>: ${req.note || req.type.toUpperCase()}</span>
        <button class="btn btn-sm btn-secondary" onclick="window.resolveService('${req.id}')">Dismiss</button>
      </div>
    `;
  }).join('');
}

window.resolveService = (id) => {
  hub.resolveServiceRequest(id);
  sound.playGentlePing();
};

// Ticket Timer & Aging Calculation
function getElapsedMinutes(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  return Math.floor(diff / 60000);
}

function formatTimer(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const totalSecs = Math.floor(diffMs / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Update station count badges
function updateStationCounts(activeOrders) {
  let grillCount = 0;
  let fryCount = 0;
  let barCount = 0;
  let allCount = 0;

  activeOrders.forEach(o => {
    (o.items || []).forEach(it => {
      if (!it.is_bumped) {
        allCount += (it.qty || 1);
        if (it.station === 'grill') grillCount += (it.qty || 1);
        if (it.station === 'fry') fryCount += (it.qty || 1);
        if (it.station === 'bar') barCount += (it.qty || 1);
      }
    });
  });

  const cAll = document.getElementById('count-all');
  const cGrill = document.getElementById('count-grill');
  const cFry = document.getElementById('count-fry');
  const cBar = document.getElementById('count-bar');

  if (cAll) cAll.innerText = allCount;
  if (cGrill) cGrill.innerText = grillCount;
  if (cFry) cFry.innerText = fryCount;
  if (cBar) cBar.innerText = barCount;
}

// Render Order Tickets
function renderTickets(orders) {
  const grid = document.getElementById('kds-tickets-grid');
  if (!grid) return;

  // Filter active (non-paid, non-cancelled) orders
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready');

  // Check for new incoming order to trigger chime
  if (activeOrders.length > previousOrderCount) {
    sound.playNewOrderChime();
  }
  previousOrderCount = activeOrders.length;

  // Update counts
  const counter = document.getElementById('active-count');
  if (counter) counter.innerText = `${activeOrders.length} Active Tickets`;

  updateStationCounts(activeOrders);

  if (activeOrders.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 3.5rem; margin-bottom: 12px;">👨‍🍳</div>
        <h2 style="font-family: var(--font-display); color: var(--gold-light);">All Clear, Chef!</h2>
        <p style="margin-top: 6px;">No pending kitchen tickets at the moment.</p>
      </div>
    `;
    return;
  }

  // Handle Expo Summary Mode
  if (currentStation === 'expo') {
    renderExpoView(activeOrders, grid);
    return;
  }

  grid.innerHTML = activeOrders.map(order => {
    const elapsedMins = getElapsedMinutes(order.created_at);
    let timerClass = 'timer-green';
    if (elapsedMins >= 20) {
      timerClass = 'timer-red';
    } else if (elapsedMins >= 10) {
      timerClass = 'timer-amber';
    }

    // Filter items by current active station
    const items = currentStation === 'all'
      ? order.items
      : order.items.filter(it => it.station === currentStation);

    if (items.length === 0 && currentStation !== 'all') {
      return ''; // No items for this station in this ticket
    }

    const allItemsBumped = (order.items || []).every(it => it.is_bumped);
    const isReady = order.status === 'ready' || allItemsBumped;

    return `
      <div class="ticket-card ${isReady ? 'ready-card' : ''}" id="ticket-${order.order_id}">
        <div class="ticket-header">
          <div>
            <div class="ticket-table">TABLE ${order.table_id}</div>
            <div class="ticket-id">#${order.order_id} · ${(order.type || 'dine_in').replace('_', ' ').toUpperCase()}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button class="btn btn-sm btn-secondary" onclick="window.printKitchenTicket('${order.order_id}')" title="Print Kitchen Slip" style="padding: 4px 8px; font-size: 0.75rem;">
              🖨️
            </button>
            <div class="ticket-timer ${timerClass}">
              ⏱️ ${formatTimer(order.created_at)}
            </div>
          </div>
        </div>

        <div class="ticket-items">
          ${items.map(item => `
            <div class="ticket-item ${item.is_bumped ? 'bumped' : ''}" 
                 onclick="window.toggleItemBump('${order.order_id}', '${item.line_id}')">
              <div class="item-checkbox">${item.is_bumped ? '☑' : '☐'}</div>
              <div class="item-qty">${item.qty}x</div>
              <div class="item-details">
                <div class="item-name">${item.name}</div>
                ${item.selected_modifiers && item.selected_modifiers.length ? `
                  <div class="item-mods">
                    ${item.selected_modifiers.map(m => `+ ${m.option_name || m.name}`).join(', ')}
                  </div>
                ` : ''}
                ${item.notes ? `<div class="item-note">Note: ${item.notes}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="ticket-footer">
          <button class="btn-bump ${isReady ? 'ready' : ''}" 
                  onclick="window.bumpTicket('${order.order_id}')">
            ${isReady ? '✅ Ready · Bump Ticket' : 'Mark Ready'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Render Expo Aggregated Summary Mode
function renderExpoView(activeOrders, container) {
  const aggregated = {};

  activeOrders.forEach(o => {
    (o.items || []).forEach(it => {
      if (!it.is_bumped) {
        const key = it.name;
        if (!aggregated[key]) {
          aggregated[key] = {
            name: it.name,
            station: it.station,
            totalQty: 0,
            tables: []
          };
        }
        aggregated[key].totalQty += (it.qty || 1);
        const tblStr = String(o.table_id || '').toUpperCase();
        const formattedTbl = tblStr.startsWith('T') ? tblStr : `T${tblStr}`;
        aggregated[key].tables.push(`${formattedTbl} (${it.qty}x)`);
      }
    });
  });

  const itemList = Object.values(aggregated).sort((a, b) => b.totalQty - a.totalQty);

  container.innerHTML = `
    <div class="expo-panel" style="grid-column: 1 / -1; background: var(--bg-surface-raised); border: 1px solid var(--border-card); border-radius: var(--radius-md); padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
        <div>
          <h2 style="font-family: var(--font-display); color: var(--gold-light); margin: 0;">📋 Expediter Summary Board</h2>
          <div class="text-xs text-muted" style="margin-top: 4px;">Aggregated live items to fire across all active tickets</div>
        </div>
        <div class="badge badge-gold" style="font-size: 0.9rem;">${activeOrders.length} Open Orders</div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px;">
        ${itemList.map(it => `
          <div style="background: rgba(0,0,0,0.35); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-primary);">${it.name}</div>
              <div class="text-xs text-muted mono" style="margin-top: 4px;">${it.tables.join(' · ')}</div>
              <span class="badge ${it.station === 'grill' ? 'badge-warning' : it.station === 'fry' ? 'badge-gold' : 'badge-secondary'}" style="margin-top: 6px; font-size: 0.65rem;">
                ${(it.station || 'EXPO').toUpperCase()}
              </span>
            </div>
            <div style="font-family: var(--font-mono); font-size: 1.8rem; font-weight: 900; color: var(--gold-light); min-width: 45px; text-align: right;">
              ${it.totalQty}x
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Print 80mm kitchen slip
window.printKitchenTicket = (orderId) => {
  const order = hub.getOrders().find(o => o.order_id === orderId);
  if (!order) return;
  const ticketHtml = escPos.generateKitchenPrepTicket(order, currentStation);
  escPos.printHtml(ticketHtml);
};

// Global Actions
window.toggleItemBump = (orderId, lineId) => {
  hub.bumpOrderItem(orderId, lineId);
  sound.playBumpChime();
};

window.bumpTicket = (orderId) => {
  hub.updateOrderStatus(orderId, 'ready');
  sound.playBumpChime();
};

// Subscriptions
hub.subscribe('orders', (orders) => renderTickets(orders));
hub.subscribe('service_requests', (reqs) => renderServiceAlerts(reqs));

// Timer refresh interval
setInterval(() => {
  renderTickets(hub.getOrders());
}, 1000);
