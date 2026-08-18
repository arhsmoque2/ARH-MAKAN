import { hub } from '../shared/realtime-adapter.js';
import { sound } from '../shared/audio-engine.js';

let menuData = null;
let currentTable = 'T05';
let activeDietary = 'all';
let cart = [];
let pendingModifierItem = null;
let activePlacedOrder = null;

// Initialize Table Session from URL or Storage
function initTableSession() {
  const params = new URLSearchParams(window.location.search);
  const tableParam = params.get('table');
  if (tableParam) {
    currentTable = tableParam.toUpperCase();
    sessionStorage.setItem('arh_table_id', currentTable);
  } else {
    currentTable = sessionStorage.getItem('arh_table_id') || 'T05';
  }

  const badge = document.getElementById('table-indicator');
  if (badge) badge.innerText = `TABLE ${currentTable} · DINE-IN`;
}

// Load Menu
async function init() {
  initTableSession();
  try {
    const res = await fetch('../shared/mock-data/menu.json');
    menuData = await res.json();
    renderDietaryPills();
    renderMenu();
    updateCartUI();
    checkActiveTableOrder();
  } catch (e) {
    console.error('Failed to load customer menu:', e);
  }
}

// Dietary Filters
function renderDietaryPills() {
  const container = document.getElementById('dietary-filter-scroll');
  if (!container) return;

  const filters = [
    { id: 'all', name: '🔥 All Favorites' },
    { id: 'halal', name: '✅ 100% Halal' },
    { id: 'chef', name: '⭐ Chef Picks' },
    { id: 'keto', name: '🥑 Low Carb / Keto' },
    { id: 'vegetarian', name: '🌱 Vegetarian' }
  ];

  container.innerHTML = filters.map(f => `
    <button class="filter-pill ${f.id === activeDietary ? 'active' : ''}" data-filter="${f.id}">
      ${f.name}
    </button>
  `).join('');

  container.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      container.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      activeDietary = e.currentTarget.dataset.filter;
      renderMenu();
    });
  });
}

// Render Menu Sections
function renderMenu() {
  const container = document.getElementById('customer-menu-sections');
  if (!container || !menuData) return;

  const soldOutList = hub.getSoldOutItems();

  container.innerHTML = menuData.categories.map(cat => {
    let items = menuData.items.filter(it => it.category === cat.id);

    // Apply dietary filter
    if (activeDietary === 'halal') {
      items = items.filter(it => it.dietary && it.dietary.includes('halal'));
    } else if (activeDietary === 'chef') {
      items = items.filter(it => it.badge && it.badge.length > 0);
    } else if (activeDietary === 'keto') {
      items = items.filter(it => it.dietary && it.dietary.includes('keto'));
    } else if (activeDietary === 'vegetarian') {
      items = items.filter(it => it.dietary && it.dietary.includes('vegetarian'));
    }

    if (items.length === 0) return '';

    return `
      <section class="menu-section">
        <h2 class="section-title">${cat.icon} ${cat.name}</h2>
        <div class="menu-list">
          ${items.map(item => {
            const isSoldOut = soldOutList.includes(item.id);
            return `
              <div class="menu-card" onclick="${isSoldOut ? '' : `window.handleItemSelect('${item.id}')`}">
                <div class="menu-card-img">
                  ${item.emoji || cat.icon}
                </div>
                <div class="menu-card-body">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div class="menu-card-title">${item.name}</div>
                    ${item.badge ? `<span class="badge badge-gold">${item.badge}</span>` : ''}
                  </div>
                  <div class="menu-card-desc">${item.description}</div>
                  <div class="menu-card-footer">
                    <div class="mono text-gold" style="font-size: 1.1rem; font-weight: 700;">
                      RM ${item.price.toFixed(2)}
                    </div>
                    ${isSoldOut ? `
                      <span class="badge badge-danger">Sold Out</span>
                    ` : `
                      <button class="btn btn-sm btn-primary" style="padding: 4px 12px;">+ Add</button>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }).join('');
}

// Item Customization & Modifiers
window.handleItemSelect = (itemId) => {
  const item = menuData.items.find(it => it.id === itemId);
  if (!item) return;

  if (item.modifiers && item.modifiers.length > 0) {
    openItemModal(item);
  } else {
    addToCart(item, []);
  }
};

function openItemModal(item) {
  pendingModifierItem = item;
  const modal = document.getElementById('item-modal');
  const title = document.getElementById('item-modal-title');
  const price = document.getElementById('item-modal-base-price');
  const body = document.getElementById('item-modal-modifiers');

  title.innerText = item.name;
  price.innerText = `RM ${item.price.toFixed(2)}`;

  body.innerHTML = item.modifiers.map(group => `
    <div style="margin-bottom: 16px;">
      <div style="font-weight: 700; color: var(--gold-light); margin-bottom: 8px;">
        ${group.name} ${group.required ? '<span style="color: var(--color-danger);">*</span>' : ''}
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${group.options.map((opt, i) => `
          <label style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-surface-raised); border-radius: var(--radius-sm); cursor: pointer;">
            <div style="display: flex; align-items: center;">
              <input type="${group.type === 'single' ? 'radio' : 'checkbox'}" 
                     name="cust_mod_${group.id}" 
                     value="${opt.name}" 
                     data-price="${opt.price}"
                     data-group="${group.name}"
                     ${group.type === 'single' && i === 0 ? 'checked' : ''}
                     class="mod-input-control">
              <span style="margin-left: 10px; font-weight: 500;">${opt.name}</span>
            </div>
            ${opt.price > 0 ? `<span class="mono text-gold">+RM ${opt.price.toFixed(2)}</span>` : ''}
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  function recalcModalPrice() {
    let extra = 0;
    body.querySelectorAll('input:checked').forEach(inp => {
      extra += parseFloat(inp.dataset.price) || 0;
    });
    const finalPrice = item.price + extra;
    price.innerText = `RM ${finalPrice.toFixed(2)}`;
    const addBtn = document.querySelector('#item-modal .btn-primary');
    if (addBtn) addBtn.innerText = `Add to Order — RM ${finalPrice.toFixed(2)}`;
  }

  body.querySelectorAll('.mod-input-control').forEach(inp => {
    inp.addEventListener('change', recalcModalPrice);
  });

  recalcModalPrice();
  modal.classList.add('active');
}

window.closeItemModal = () => {
  const modal = document.getElementById('item-modal');
  if (modal) modal.classList.remove('active');
  pendingModifierItem = null;
};

window.confirmAddToCart = () => {
  if (!pendingModifierItem) return;

  const selectedMods = [];
  const inputs = document.querySelectorAll('#item-modal-modifiers input:checked');

  inputs.forEach(inp => {
    selectedMods.push({
      group_name: inp.dataset.group,
      option_name: inp.value,
      price: parseFloat(inp.dataset.price) || 0
    });
  });

  addToCart(pendingModifierItem, selectedMods);
  closeItemModal();
};

// Cart Logic
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
  const countEl = document.getElementById('float-cart-count');
  const totalEl = document.getElementById('float-cart-total');
  const drawerList = document.getElementById('drawer-cart-items');
  const drawerSubtotal = document.getElementById('drawer-subtotal');
  const drawerTotal = document.getElementById('drawer-total');

  const totalQty = cart.reduce((sum, it) => sum + it.qty, 0);
  const subtotal = cart.reduce((sum, it) => sum + it.total_price, 0);
  const tax = subtotal * 0.06;
  const total = subtotal + tax;

  if (countEl) countEl.innerText = `${totalQty} Item${totalQty === 1 ? '' : 's'}`;
  if (totalEl) totalEl.innerText = `RM ${total.toFixed(2)}`;

  if (drawerSubtotal) drawerSubtotal.innerText = `RM ${subtotal.toFixed(2)}`;
  if (drawerTotal) drawerTotal.innerText = `RM ${total.toFixed(2)}`;

  if (drawerList) {
    if (cart.length === 0) {
      drawerList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 30px;">Your cart is empty.</div>`;
    } else {
      drawerList.innerHTML = cart.map((line, idx) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-subtle);">
          <div>
            <div style="font-weight: 600;">${line.name}</div>
            ${line.selected_modifiers && line.selected_modifiers.length ? `
              <div style="font-size: 0.75rem; color: var(--gold-primary);">${line.selected_modifiers.map(m => m.option_name).join(', ')}</div>
            ` : ''}
            <div class="mono text-gold text-sm">RM ${line.total_price.toFixed(2)}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn-sm btn-secondary" onclick="window.changeCartQty(${idx}, -1)">-</button>
            <span class="mono" style="font-weight: bold;">${line.qty}</span>
            <button class="btn btn-sm btn-secondary" onclick="window.changeCartQty(${idx}, 1)">+</button>
          </div>
        </div>
      `).join('');
    }
  }
}

window.changeCartQty = (idx, delta) => {
  if (!cart[idx]) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].total_price = cart[idx].qty * cart[idx].unit_price;
  }
  updateCartUI();
};

window.openCartDrawer = () => {
  const drawer = document.getElementById('cart-drawer');
  if (drawer) drawer.classList.add('active');
};

window.closeCartDrawer = () => {
  const drawer = document.getElementById('cart-drawer');
  if (drawer) drawer.classList.remove('active');
};

// Send Order to Kitchen
window.submitOrderToKitchen = () => {
  if (cart.length === 0) {
    alert('Please add items to cart before submitting.');
    return;
  }

  const subtotal = cart.reduce((sum, it) => sum + it.total_price, 0);
  const tax = subtotal * 0.06;
  const total = subtotal + tax;
  const note = document.getElementById('drawer-order-note')?.value || '';

  const order = hub.createOrder({
    table_id: currentTable,
    type: 'dine_in',
    items: cart,
    subtotal,
    tax,
    total_amount: total,
    notes: note,
    payment_method: 'unpaid'
  });

  activePlacedOrder = order;
  cart = [];
  updateCartUI();
  closeCartDrawer();
  sound.playNewOrderChime();

  openTrackerModal(order);
};

// 1-Tap Service Requests
window.openServiceModal = () => {
  const modal = document.getElementById('service-modal');
  if (modal) modal.classList.add('active');
};

window.closeServiceModal = () => {
  const modal = document.getElementById('service-modal');
  if (modal) modal.classList.remove('active');
};

window.sendServiceRequest = (type, label) => {
  hub.createServiceRequest(currentTable, type, `${label} requested at Table ${currentTable}`);
  sound.playGentlePing();
  closeServiceModal();
  alert(`✅ Staff alerted: ${label} requested. Someone will assist you shortly!`);
};

// Order Tracker HUD
function checkActiveTableOrder() {
  const orders = hub.getOrders();
  const active = orders.find(o => o.table_id === currentTable && o.status !== 'paid' && o.status !== 'cancelled');
  if (active) {
    activePlacedOrder = active;
    renderTrackerHUD(active);
  }
}

function renderTrackerHUD(order) {
  const hud = document.getElementById('order-tracker-banner');
  if (!hud) return;

  hud.style.display = 'block';
  document.getElementById('tracker-order-id').innerText = `#${order.order_id}`;

  const step1 = document.getElementById('step-placed');
  const step2 = document.getElementById('step-cooking');
  const step3 = document.getElementById('step-ready');
  const step4 = document.getElementById('step-served');

  step1.classList.add('active');
  step2.classList.toggle('active', order.status === 'preparing' || order.status === 'ready' || order.status === 'served');
  step3.classList.toggle('active', order.status === 'ready' || order.status === 'served');
  step4.classList.toggle('active', order.status === 'served');
}

function openTrackerModal(order) {
  renderTrackerHUD(order);
}

// Split Bill Calculator
window.openSplitBillModal = () => {
  const modal = document.getElementById('split-bill-modal');
  const orders = hub.getOrders();
  const active = orders.find(o => o.table_id === currentTable && o.status !== 'paid');
  const total = active ? active.total_amount : cart.reduce((sum, it) => sum + it.total_price * 1.06, 0);

  document.getElementById('split-total-amount').innerText = `RM ${total.toFixed(2)}`;
  calculateSplit(total, 2);

  const peopleInput = document.getElementById('split-people-count');
  if (peopleInput) {
    peopleInput.value = 2;
    peopleInput.oninput = (e) => calculateSplit(total, parseInt(e.target.value) || 1);
  }

  modal.classList.add('active');
};

function calculateSplit(total, count) {
  const perPerson = total / Math.max(1, count);
  const shareEl = document.getElementById('split-share-display');
  if (shareEl) shareEl.innerText = `RM ${perPerson.toFixed(2)} per person`;
}

window.closeSplitBillModal = () => {
  const modal = document.getElementById('split-bill-modal');
  if (modal) modal.classList.remove('active');
};

// Subscriptions
hub.subscribe('orders', () => checkActiveTableOrder());

// Start
init();
