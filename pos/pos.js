import { hub } from '../shared/realtime-adapter.js';
import { sound } from '../shared/audio-engine.js';

let menuData = null;
let currentCategory = 'burgers';
let currentTable = 'T01';
let cart = [];
let pendingModifierItem = null;

// Initialize
async function init() {
  try {
    const res = await fetch('../shared/mock-data/menu.json');
    menuData = await res.json();
    renderCategories();
    renderMenuGrid();
    renderTableSelector();
    updateCartUI();
  } catch (e) {
    console.error('Failed to load menu data:', e);
  }
}

// Category Rail
function renderCategories() {
  const rail = document.getElementById('pos-category-rail');
  if (!rail || !menuData) return;

  const categories = [
    { id: 'tables', name: 'Tables', icon: '🪑' },
    ...menuData.categories
  ];

  rail.innerHTML = categories.map(cat => `
    <button class="rail-btn ${cat.id === currentCategory ? 'active' : ''}" data-cat="${cat.id}">
      <div class="rail-icon">${cat.icon}</div>
      <div>${cat.name}</div>
    </button>
  `).join('');

  rail.querySelectorAll('.rail-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.rail-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentCategory = e.currentTarget.dataset.cat;
      if (currentCategory === 'tables') {
        renderTableFloorView();
      } else {
        renderMenuGrid();
      }
    });
  });
}

// Menu Grid Rendering
function renderMenuGrid(searchFilter = '') {
  const grid = document.getElementById('pos-menu-grid');
  if (!grid || !menuData) return;

  const soldOutList = hub.getSoldOutItems();
  let items = menuData.items;

  if (currentCategory !== 'all' && currentCategory !== 'tables') {
    items = items.filter(it => it.category === currentCategory);
  }

  if (searchFilter) {
    const q = searchFilter.toLowerCase();
    items = items.filter(it => it.name.toLowerCase().includes(q) || it.description.toLowerCase().includes(q));
  }

  grid.innerHTML = items.map(item => {
    const isSoldOut = soldOutList.includes(item.id);
    return `
      <div class="pos-item-card ${isSoldOut ? 'sold-out' : ''}" 
           onclick="${isSoldOut ? '' : `window.handleItemClick('${item.id}')`}">
        <div class="pos-item-img" style="display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">
          ${item.category === 'burgers' ? '🍔' : item.category === 'smoked' ? '🥩' : item.category === 'chicken' ? '🍗' : item.category === 'sides' ? '🍟' : '🥤'}
        </div>
        <div class="pos-item-title">${item.name}</div>
        <div class="pos-item-price">RM ${item.price.toFixed(2)}</div>
        ${isSoldOut ? '<div class="badge badge-danger" style="margin-top: 4px;">SOLD OUT</div>' : ''}
      </div>
    `;
  }).join('');
}

// Table Floor Plan View
function renderTableFloorView() {
  const grid = document.getElementById('pos-menu-grid');
  if (!grid) return;

  const tables = hub.getTableStatusMatrix();

  grid.innerHTML = `
    <div class="table-floor-grid" style="grid-column: 1 / -1;">
      ${tables.map(tbl => `
        <div class="table-node ${tbl.status}" onclick="window.selectTable('${tbl.id}')">
          <div style="font-size: 1.5rem; margin-bottom: 4px;">🪑</div>
          <div style="font-weight: 700; font-size: 1.1rem; color: var(--gold-light);">${tbl.id}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; margin-top: 4px;">
            ${tbl.status}
          </div>
          ${tbl.active_order ? `
            <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--gold-primary); margin-top: 6px;">
              RM ${tbl.active_order.total_amount.toFixed(2)}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

window.selectTable = (tableId) => {
  currentTable = tableId;
  const select = document.getElementById('cart-table-select');
  if (select) select.value = tableId;

  // Check if table has an active order to load
  const orders = hub.getOrders();
  const active = orders.find(o => o.table_id === tableId && o.status !== 'paid' && o.status !== 'cancelled');
  if (active) {
    cart = active.items.map(it => ({
      ...it,
      id: it.item_id
    }));
  } else {
    cart = [];
  }
  updateCartUI();
  sound.playGentlePing();
};

function renderTableSelector() {
  const select = document.getElementById('cart-table-select');
  if (!select) return;

  const tables = ['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'TAKEAWAY'];
  select.innerHTML = tables.map(t => `<option value="${t}" ${t === currentTable ? 'selected' : ''}>Table ${t}</option>`).join('');

  select.addEventListener('change', (e) => {
    window.selectTable(e.target.value);
  });
}

// Item Click Handler
window.handleItemClick = (itemId) => {
  const item = menuData.items.find(it => it.id === itemId);
  if (!item) return;

  if (item.modifiers && item.modifiers.length > 0) {
    openModifierModal(item);
  } else {
    addToCart(item, []);
  }
};

function openModifierModal(item) {
  pendingModifierItem = item;
  const modal = document.getElementById('modifier-modal');
  const title = document.getElementById('mod-modal-title');
  const body = document.getElementById('mod-modal-body');

  title.innerText = `Customize: ${item.name}`;
  body.innerHTML = item.modifiers.map(group => `
    <div style="margin-bottom: 16px;">
      <div style="font-weight: 700; color: var(--gold-light); margin-bottom: 8px;">
        ${group.name} ${group.required ? '<span style="color: var(--color-danger);">*</span>' : ''}
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${group.options.map((opt, i) => `
          <label style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-surface-raised); border-radius: var(--radius-sm); cursor: pointer;">
            <div>
              <input type="${group.type === 'single' ? 'radio' : 'checkbox'}" 
                     name="mod_${group.id}" 
                     value="${opt.name}" 
                     data-price="${opt.price}"
                     data-group="${group.name}"
                     ${group.type === 'single' && i === 0 ? 'checked' : ''}>
              <span style="margin-left: 8px;">${opt.name}</span>
            </div>
            ${opt.price > 0 ? `<span class="mono text-gold">+RM ${opt.price.toFixed(2)}</span>` : ''}
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  modal.classList.add('active');
}

window.closeModifierModal = () => {
  const modal = document.getElementById('modifier-modal');
  if (modal) modal.classList.remove('active');
  pendingModifierItem = null;
};

window.confirmModifiers = () => {
  if (!pendingModifierItem) return;

  const selectedMods = [];
  const inputs = document.querySelectorAll('#mod-modal-body input:checked');

  inputs.forEach(inp => {
    selectedMods.push({
      group_name: inp.dataset.group,
      option_name: inp.value,
      price: parseFloat(inp.dataset.price) || 0
    });
  });

  addToCart(pendingModifierItem, selectedMods);
  closeModifierModal();
};

// Cart Management
function addToCart(item, modifiers = []) {
  const extraPrice = modifiers.reduce((sum, m) => sum + (m.price || 0), 0);
  const unitPrice = item.price + extraPrice;

  cart.push({
    item_id: item.id,
    name: item.name,
    qty: 1,
    unit_price: unitPrice,
    total_price: unitPrice,
    station: item.station || 'grill',
    selected_modifiers: modifiers,
    notes: '',
    line_id: 'line_' + Date.now() + Math.random().toString(36).substr(2, 4)
  });

  updateCartUI();
  sound.playGentlePing();
}

function updateCartUI() {
  const list = document.getElementById('pos-cart-lines');
  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px 10px;">Cart is empty. Select items to order.</div>`;
  } else {
    list.innerHTML = cart.map((line, idx) => `
      <div class="cart-line-item">
        <div class="cart-line-info">
          <div class="cart-line-name">${line.name}</div>
          ${line.selected_modifiers && line.selected_modifiers.length ? `
            <div class="cart-line-mods">${line.selected_modifiers.map(m => m.option_name).join(', ')}</div>
          ` : ''}
          <div class="mono text-gold text-sm">RM ${line.total_price.toFixed(2)}</div>
        </div>
        <div class="cart-qty-ctrl">
          <button class="qty-btn" onclick="window.changeQty(${idx}, -1)">-</button>
          <span class="mono" style="font-weight: 700;">${line.qty}</span>
          <button class="qty-btn" onclick="window.changeQty(${idx}, 1)">+</button>
        </div>
      </div>
    `).join('');
  }

  // Calculations
  const subtotal = cart.reduce((sum, it) => sum + it.total_price, 0);
  const tax = subtotal * 0.06;
  const total = subtotal + tax;

  const subEl = document.getElementById('cart-subtotal');
  const taxEl = document.getElementById('cart-tax');
  const totalEl = document.getElementById('cart-total');

  if (subEl) subEl.innerText = `RM ${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.innerText = `RM ${tax.toFixed(2)}`;
  if (totalEl) totalEl.innerText = `RM ${total.toFixed(2)}`;
}

window.changeQty = (idx, delta) => {
  if (!cart[idx]) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].total_price = cart[idx].qty * cart[idx].unit_price;
  }
  updateCartUI();
};

window.clearCart = () => {
  cart = [];
  updateCartUI();
};

// Checkout & Multi-Tender Payment
window.openPaymentModal = () => {
  if (cart.length === 0) {
    alert('Cannot checkout an empty cart.');
    return;
  }
  const modal = document.getElementById('payment-modal');
  const subtotal = cart.reduce((sum, it) => sum + it.total_price, 0);
  const tax = subtotal * 0.06;
  const total = subtotal + tax;

  document.getElementById('pay-modal-total').innerText = `RM ${total.toFixed(2)}`;
  document.getElementById('pay-modal-table').innerText = `Table: ${currentTable}`;

  // Cash change auto calculation
  const cashInput = document.getElementById('cash-tender-input');
  if (cashInput) {
    cashInput.value = Math.ceil(total);
    calculateChange(total, Math.ceil(total));
    cashInput.oninput = (e) => calculateChange(total, parseFloat(e.target.value) || 0);
  }

  modal.classList.add('active');
};

function calculateChange(total, tendered) {
  const change = tendered - total;
  const changeEl = document.getElementById('cash-change-display');
  if (changeEl) {
    changeEl.innerText = change >= 0 ? `RM ${change.toFixed(2)}` : 'Insufficient Cash';
    changeEl.style.color = change >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
  }
}

window.closePaymentModal = () => {
  const modal = document.getElementById('payment-modal');
  if (modal) modal.classList.remove('active');
};

window.completePayment = (method = 'cash') => {
  const subtotal = cart.reduce((sum, it) => sum + it.total_price, 0);
  const tax = subtotal * 0.06;
  const total = subtotal + tax;

  const order = hub.createOrder({
    table_id: currentTable,
    type: 'dine_in',
    items: cart,
    subtotal,
    tax,
    total_amount: total,
    payment_method: method
  });

  // Automatically mark settled if cashier completes
  hub.settlePayment(order.order_id, method);

  sound.playNewOrderChime();
  closePaymentModal();

  // Print Receipt
  generateThermalReceipt(order);
  cart = [];
  updateCartUI();
};

function generateThermalReceipt(order) {
  const printContainer = document.getElementById('thermal-receipt-print');
  if (!printContainer) return;

  const dateStr = new Date().toLocaleString();
  printContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 8px;">
      <div style="font-weight: bold; font-size: 14px;">WOODFIRE KULIM</div>
      <div>Gourmet Burgers & Smoked Meats</div>
      <div>Tel: 016-9799778</div>
    </div>
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
    <div>Order: #${order.order_id}</div>
    <div>Table: ${order.table_id} · ${order.payment_method.toUpperCase()}</div>
    <div>Date: ${dateStr}</div>
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
    ${order.items.map(it => `
      <div style="display: flex; justify-content: space-between;">
        <span>${it.qty}x ${it.name}</span>
        <span>RM ${it.total_price.toFixed(2)}</span>
      </div>
      ${it.selected_modifiers && it.selected_modifiers.length ? `
        <div style="font-size: 10px; padding-left: 8px;">${it.selected_modifiers.map(m => m.option_name).join(', ')}</div>
      ` : ''}
    `).join('')}
    <div style="border-top: 1px dashed #000; margin: 4px 0;"></div>
    <div style="display: flex; justify-content: space-between;">
      <span>Subtotal:</span><span>RM ${order.subtotal.toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span>SST (6%):</span><span>RM ${order.tax.toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; margin-top: 4px;">
      <span>TOTAL PAID:</span><span>RM ${order.total_amount.toFixed(2)}</span>
    </div>
    <div style="border-top: 1px dashed #000; margin: 6px 0;"></div>
    <div style="text-align: center; font-size: 10px; margin-top: 6px;">
      Thank You! Please Come Again.<br>
      WiFi: WoodfireGuest / Key: woodfire2026
    </div>
  `;

  window.print();
}

// Search
const searchInput = document.getElementById('pos-search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    renderMenuGrid(e.target.value);
  });
}

// Start
init();
