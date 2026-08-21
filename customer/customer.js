import { hub } from '../shared/realtime-adapter.js';
import { sound } from '../shared/audio-engine.js';
import { qr } from '../shared/qr-generator.js';
import { compressImageFile } from '../shared/image-compressor.js';

let menuData = null;
let currentTable = 'T05';
let orderMode = 'dine_in'; // 'dine_in' | 'takeaway'
let activeDietary = 'all';
let cart = [];
let pendingModifierItem = null;
let activePlacedOrder = null;
let currentLang = localStorage.getItem('arh_lang') || 'en';
let selectedRating = 5;
let selectedReviewTags = [];
let pendingReceiptBase64 = null;
let currentDuitNowRef = '';
let countdownInterval = null;
let countdownSecondsRemaining = 900; // 15 mins
let isDemoModeEnabled = false; // gates the "Instant Test Pay (Demo)" button — never on for real customers

const translations = {
  en: {
    heroSub: 'Oak-Smoked Meats, Hand-Pressed Angus Burgers & Shakes',
    toggleBtn: '🇬🇧 EN',
    splitBtn: 'Split Bill 🧮',
    rateBtn: '⭐ Rate Dining',
    trackerTitle: 'Live Kitchen Tracker',
    step1: 'Placed',
    step2: 'Cooking',
    step3: 'Ready',
    step4: 'Served',
    step4Takeaway: 'Ready for Pickup',
    emptyCart: 'Your cart is empty.',
    sendOrder: '🔥 Send Order to Kitchen'
  },
  bm: {
    heroSub: 'Daging Salai Kayu Oak, Burger Daging Angus & Minuman Shake',
    toggleBtn: '🇲🇾 BM',
    splitBtn: 'Kongsi Bil 🧮',
    rateBtn: '⭐ Nilaikan Kami',
    trackerTitle: 'Penjejak Dapur Langsung',
    step1: 'Dihantar',
    step2: 'Dimasak',
    step3: 'Sedia',
    step4: 'Dihidang',
    step4Takeaway: 'Sedia Diambil',
    emptyCart: 'Troli anda kosong.',
    sendOrder: '🔥 Hantar Pesanan ke Dapur'
  }
};

// Single source of truth for tax/total rounding so the amount shown on the
// DuitNow QR/modal always matches the amount actually recorded on the order.
function computeCartTotals(cartItems) {
  const subtotal = cartItems.reduce((sum, it) => sum + it.total_price, 0);
  const tax = Number((subtotal * 0.06).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  return { subtotal, tax, total };
}

// Takeaway orders share the literal table_id 'TAKEAWAY', so remembering the
// exact order_id this session placed is the only way to find *this*
// customer's order again on reload — matching by table_id alone would show
// whichever takeaway order happens to be pending first, including a
// stranger's on a shared/kiosk device.
function rememberOwnOrder(order) {
  activePlacedOrder = order;
  if (order?.order_id) sessionStorage.setItem('arh_own_order_id', order.order_id);
}

window.toggleLanguage = () => {
  currentLang = currentLang === 'en' ? 'bm' : 'en';
  localStorage.setItem('arh_lang', currentLang);
  const btn = document.getElementById('lang-toggle-btn');
  if (btn) btn.innerText = translations[currentLang].toggleBtn;
  const heroSub = document.querySelector('.cust-hero-sub');
  if (heroSub) heroSub.innerText = translations[currentLang].heroSub;
  renderDietaryPills();
  renderMenu();
  if (activePlacedOrder) renderTrackerHUD(activePlacedOrder);
};

// Initialize Table & Order Mode Session from URL or Storage
function initTableSession() {
  const params = new URLSearchParams(window.location.search);
  const tableParam = params.get('table');
  const modeParam = params.get('mode');

  if (tableParam) {
    currentTable = tableParam.toUpperCase();
    sessionStorage.setItem('arh_table_id', currentTable);
  } else {
    currentTable = sessionStorage.getItem('arh_table_id') || 'T05';
  }

  if (modeParam === 'takeaway') {
    setOrderMode('takeaway');
  } else {
    setOrderMode('dine_in');
  }

  // Demo/instant-pay mode is opt-in per visit via ?demo=1 — it is never
  // persisted, so a real-money staging URL handed to a customer or tester
  // without that param never shows the auto-approve button.
  isDemoModeEnabled = params.get('demo') === '1';
  const demoBtn = document.getElementById('instant-demo-pay-btn');
  if (demoBtn) demoBtn.style.display = isDemoModeEnabled ? 'block' : 'none';

  updateTableBadge();
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) langBtn.innerText = translations[currentLang].toggleBtn;
}

function updateTableBadge() {
  const badge = document.getElementById('table-indicator');
  if (!badge) return;
  if (orderMode === 'dine_in') {
    badge.innerText = `TABLE ${currentTable} · DINE-IN ▾`;
    badge.style.display = 'inline-flex';
  } else {
    badge.innerText = `🛍️ TAKEAWAY / PICKUP ▾`;
    badge.style.display = 'inline-flex';
  }
}

// Order Mode Switcher (Dine-In vs Takeaway)
window.setOrderMode = (mode) => {
  orderMode = mode;
  const dineBtn = document.getElementById('mode-dine-in-btn');
  const takeBtn = document.getElementById('mode-takeaway-btn');
  const takeawayBox = document.getElementById('takeaway-details-box');
  const serviceBtn = document.getElementById('btn-service-call');
  const drawerTitle = document.getElementById('drawer-title');

  if (mode === 'dine_in') {
    if (dineBtn) dineBtn.classList.add('active');
    if (takeBtn) takeBtn.classList.remove('active');
    if (takeawayBox) takeawayBox.classList.remove('active');
    if (serviceBtn) serviceBtn.style.display = 'flex';
    if (drawerTitle) drawerTitle.innerText = `Table ${currentTable} Order`;
  } else {
    if (dineBtn) dineBtn.classList.remove('active');
    if (takeBtn) takeBtn.classList.add('active');
    if (takeawayBox) takeawayBox.classList.add('active');
    if (serviceBtn) serviceBtn.style.display = 'none';
    if (drawerTitle) drawerTitle.innerText = `Takeaway Web Order`;
  }

  updateTableBadge();
  sound.playGentlePing();
};

// Table Switcher
window.openTableSelectModal = () => {
  if (orderMode === 'takeaway') {
    setOrderMode('dine_in');
  }
  const modal = document.getElementById('table-select-modal');
  if (modal) modal.classList.add('active');
};

window.closeTableSelectModal = () => {
  const modal = document.getElementById('table-select-modal');
  if (modal) modal.classList.remove('active');
};

window.selectTable = (tbl) => {
  currentTable = tbl;
  sessionStorage.setItem('arh_table_id', currentTable);
  updateTableBadge();
  closeTableSelectModal();
  checkActiveTableOrder();
  sound.playGentlePing();
};

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

  const filters = currentLang === 'bm' ? [
    { id: 'all', name: '🔥 Semua Pilihan' },
    { id: 'halal', name: '✅ 100% Halal' },
    { id: 'chef', name: '⭐ Pilihan Chef' },
    { id: 'keto', name: '🥑 Rendah Karbo' },
    { id: 'vegetarian', name: '🌱 Vegetarian' }
  ] : [
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
                    <div class="mono text-gold" style="font-size: 1.05rem; font-weight: 700;">
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
  const drawerTax = document.getElementById('drawer-tax');
  const drawerTotal = document.getElementById('drawer-total');

  const totalQty = cart.reduce((sum, it) => sum + it.qty, 0);
  const subtotal = cart.reduce((sum, it) => sum + it.total_price, 0);
  const tax = Number((subtotal * 0.06).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  if (countEl) countEl.innerText = `${totalQty} Item${totalQty === 1 ? '' : 's'}`;
  if (totalEl) totalEl.innerText = `RM ${total.toFixed(2)}`;

  if (drawerSubtotal) drawerSubtotal.innerText = `RM ${subtotal.toFixed(2)}`;
  if (drawerTax) drawerTax.innerText = `RM ${tax.toFixed(2)}`;
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

// Send Order to Kitchen (Counter Cash / Direct)
window.submitOrderToKitchen = (paymentType = 'unpaid') => {
  if (cart.length === 0) {
    alert('Please add items to cart before submitting.');
    return;
  }

  const subtotal = cart.reduce((sum, it) => sum + it.total_price, 0);
  const tax = Number((subtotal * 0.06).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  const note = document.getElementById('drawer-order-note')?.value || '';

  const custName = document.getElementById('takeaway-cust-name')?.value || '';
  const custPhone = document.getElementById('takeaway-cust-phone')?.value || '';
  const pickupTime = document.getElementById('takeaway-pickup-time')?.value || 'asap';
  const carPlate = document.getElementById('takeaway-car-plate')?.value || '';

  const order = hub.createOrder({
    table_id: orderMode === 'dine_in' ? currentTable : 'TAKEAWAY',
    type: orderMode,
    customer_name: custName,
    customer_phone: custPhone,
    pickup_time: pickupTime,
    car_plate: carPlate,
    items: cart,
    subtotal,
    tax,
    total_amount: total,
    notes: note,
    payment_method: paymentType
  });

  rememberOwnOrder(order);
  cart = [];
  updateCartUI();
  closeCartDrawer();
  sound.playNewOrderChime();

  openTrackerModal(order);
};

// In-App DuitNow QR Flow (Dynamic Generation & Countdown)
window.openDuitNowModal = () => {
  if (cart.length === 0) {
    alert('Please add items to cart before paying.');
    return;
  }

  const { total } = computeCartTotals(cart);
  const totalStr = total.toFixed(2);
  const prefix = orderMode === 'dine_in' ? currentTable : 'WF-WEB';
  currentDuitNowRef = `${prefix}-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const amountEl = document.getElementById('duitnow-modal-amount');
  const refEl = document.getElementById('duitnow-modal-ref');
  const qrBox = document.getElementById('customer-duitnow-qr-box');
  const storeAccEl = document.getElementById('duitnow-store-acc-name');
  const storeBankEl = document.getElementById('duitnow-store-bank-info');

  if (amountEl) amountEl.innerText = `RM ${totalStr}`;
  if (refEl) refEl.innerText = currentDuitNowRef;

  const merchantCfg = hub.getMerchantPaymentConfig();
  if (storeAccEl) storeAccEl.innerText = merchantCfg.account_name;
  if (storeBankEl) storeBankEl.innerText = `${merchantCfg.bank_name} · ${merchantCfg.account_number}`;

  // Prefer the merchant's real, bank-issued DuitNow QR image (configured in
  // admin.js) — it's the only one a real banking app can actually scan and
  // pay against. The client-generated matrix code below is a placeholder
  // preview payload only, not a standards-compliant DuitNow QR, and should
  // never be presented as the thing to pay against for a real transaction.
  if (qrBox) {
    if (merchantCfg.qr_image_url) {
      qrBox.innerHTML = `<img src="${merchantCfg.qr_image_url}" style="max-height: 180px; max-width: 100%; border-radius: 6px;" alt="DuitNow QR">`;
    } else {
      const qrData = `DUITNOW|${merchantCfg.account_number}|${totalStr}|${currentDuitNowRef}`;
      const svg = qr.generateSvg(qrData, { size: 180, darkColor: '#000000', lightColor: '#FFFFFF' });
      qrBox.innerHTML = svg;
    }
  }

  // Reset file input & preview
  pendingReceiptBase64 = null;
  const fileInput = document.getElementById('customer-receipt-file-input');
  if (fileInput) fileInput.value = '';
  const previewBox = document.getElementById('receipt-preview-box');
  if (previewBox) previewBox.style.display = 'none';

  // Start 15m countdown
  startDuitNowCountdown();

  closeCartDrawer();
  const modal = document.getElementById('duitnow-modal');
  if (modal) modal.classList.add('active');
};

function startDuitNowCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownSecondsRemaining = 900; // 15 mins

  const countdownEl = document.getElementById('duitnow-countdown');
  const updateDisplay = () => {
    const mins = Math.floor(countdownSecondsRemaining / 60).toString().padStart(2, '0');
    const secs = (countdownSecondsRemaining % 60).toString().padStart(2, '0');
    if (countdownEl) countdownEl.innerText = `${mins}:${secs}`;
    if (countdownSecondsRemaining <= 0) {
      clearInterval(countdownInterval);
      if (countdownEl) countdownEl.innerText = 'EXPIRED';
    }
    countdownSecondsRemaining--;
  };

  updateDisplay();
  countdownInterval = setInterval(updateDisplay, 1000);
}

window.closeDuitNowModal = () => {
  if (countdownInterval) clearInterval(countdownInterval);
  const modal = document.getElementById('duitnow-modal');
  if (modal) modal.classList.remove('active');
};

window.copyDuitNowAmount = () => {
  const { total: totalNum } = computeCartTotals(cart);
  const total = totalNum.toFixed(2);
  navigator.clipboard.writeText(total).then(() => {
    sound.playGentlePing();
    alert(`📋 Copied amount RM ${total} to clipboard.`);
  }).catch(() => {});
};

window.copyDuitNowRef = () => {
  navigator.clipboard.writeText(currentDuitNowRef).then(() => {
    sound.playGentlePing();
    alert(`📋 Copied reference ${currentDuitNowRef} to clipboard.`);
  }).catch(() => {});
};

window.handleReceiptFileChosen = async (input) => {
  if (input.files && input.files[0]) {
    try {
      pendingReceiptBase64 = await compressImageFile(input.files[0], 800, 0.75);
      const previewBox = document.getElementById('receipt-preview-box');
      const previewImg = document.getElementById('receipt-preview-img');
      if (previewBox && previewImg && pendingReceiptBase64) {
        previewImg.src = pendingReceiptBase64;
        previewBox.style.display = 'block';
        sound.playGentlePing();
      }
    } catch (e) {
      console.warn('Could not compress receipt:', e);
    }
  }
};

window.openWhatsAppReceipt = () => {
  const merchantCfg = hub.getMerchantPaymentConfig();
  const phone = (merchantCfg.whatsapp_phone || '+60169799778').replace(/[^0-9]/g, '');
  const { total: totalNum } = computeCartTotals(cart);
  const total = totalNum.toFixed(2);
  const targetName = orderMode === 'dine_in' ? `Table ${currentTable}` : 'Takeaway';
  const text = encodeURIComponent(`Hi Woodfire Kulim, I have paid RM ${total} via DuitNow for ${targetName} (Ref: ${currentDuitNowRef}). Here is my proof of transfer.`);
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
};

window.confirmDuitNowPaymentMade = () => {
  if (cart.length === 0) return;

  const subtotal = cart.reduce((sum, it) => sum + it.total_price, 0);
  const tax = Number((subtotal * 0.06).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  const note = document.getElementById('drawer-order-note')?.value || '';

  const custName = document.getElementById('takeaway-cust-name')?.value || '';
  const custPhone = document.getElementById('takeaway-cust-phone')?.value || '';
  const pickupTime = document.getElementById('takeaway-pickup-time')?.value || 'asap';
  const carPlate = document.getElementById('takeaway-car-plate')?.value || '';

  const order = hub.createOrder({
    table_id: orderMode === 'dine_in' ? currentTable : 'TAKEAWAY',
    type: orderMode,
    customer_name: custName,
    customer_phone: custPhone,
    pickup_time: pickupTime,
    car_plate: carPlate,
    items: cart,
    subtotal,
    tax,
    total_amount: total,
    notes: note,
    payment_method: 'duitnow_qr',
    status: 'awaiting_verification',
    verification_status: 'pending',
    receipt_image_data: pendingReceiptBase64,
    payment_ref: currentDuitNowRef
  });

  rememberOwnOrder(order);
  cart = [];
  updateCartUI();
  closeDuitNowModal();
  sound.playNewOrderChime();

  openTrackerModal(order);
  alert('✅ DuitNow payment submitted! Our counter cashier is verifying your transfer. Your order will be sent to the kitchen instantly upon confirmation.');
};

// Instant Test Simulation (Instant Mock Auto-Approve) — gated behind ?demo=1,
// see initTableSession. Refuse to run even if the hidden button is somehow
// triggered directly, so a real customer's order can never be auto-approved
// without an actual payment.
window.simulateInstantPayment = () => {
  if (!isDemoModeEnabled) {
    alert('Demo pay is disabled on this order link.');
    return;
  }
  if (cart.length === 0) return;

  const subtotal = cart.reduce((sum, it) => sum + it.total_price, 0);
  const tax = Number((subtotal * 0.06).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  const note = document.getElementById('drawer-order-note')?.value || '';

  const custName = document.getElementById('takeaway-cust-name')?.value || 'Demo Customer';
  const custPhone = document.getElementById('takeaway-cust-phone')?.value || '016-9799778';

  const order = hub.createOrder({
    table_id: orderMode === 'dine_in' ? currentTable : 'TAKEAWAY',
    type: orderMode,
    customer_name: custName,
    customer_phone: custPhone,
    items: cart,
    subtotal,
    tax,
    total_amount: total,
    notes: note,
    payment_method: 'duitnow_qr',
    status: 'pending',
    verification_status: 'approved',
    payment_ref: currentDuitNowRef
  });

  rememberOwnOrder(order);
  cart = [];
  updateCartUI();
  closeDuitNowModal();
  sound.playNewOrderChime();

  openTrackerModal(order);
  alert('⚡ Instant Demo Payment Approved! Kitchen KDS is now preparing your order.');
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
  let active;
  if (orderMode === 'takeaway') {
    // All takeaway orders share the literal table_id 'TAKEAWAY', so match
    // this session's own order_id — never "any pending takeaway order" — or
    // a shared/kiosk device could surface a different customer's order.
    const ownOrderId = sessionStorage.getItem('arh_own_order_id');
    active = ownOrderId
      ? orders.find(o => o.order_id === ownOrderId && o.status !== 'paid' && o.status !== 'cancelled')
      : undefined;
  } else {
    active = orders.find(o => o.table_id === currentTable && o.status !== 'paid' && o.status !== 'cancelled');
  }
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

  const t = translations[currentLang] || translations.en;
  
  if (order.status === 'awaiting_verification') {
    if (step1.querySelector('span')) step1.querySelector('span').innerText = 'Verifying ⏳';
    step1.classList.add('active');
    step2.classList.remove('active');
    step3.classList.remove('active');
    step4.classList.remove('active');
    return;
  }

  if (step1.querySelector('span')) step1.querySelector('span').innerText = t.step1;
  if (step2.querySelector('span')) step2.querySelector('span').innerText = t.step2;
  if (step3.querySelector('span')) step3.querySelector('span').innerText = t.step3;
  if (step4.querySelector('span')) step4.querySelector('span').innerText = order.type === 'takeaway' ? t.step4Takeaway : t.step4;

  const isCooking = order.status === 'pending' || order.status === 'preparing' || order.status === 'ready' || order.status === 'served' || (order.items && order.items.some(it => it.is_bumped));
  const isReady = order.status === 'ready' || order.status === 'served' || (order.items && order.items.every(it => it.is_bumped));
  const isServed = order.status === 'served' || order.status === 'paid';

  step1.classList.add('active');
  step2.classList.toggle('active', isCooking);
  step3.classList.toggle('active', isReady);
  step4.classList.toggle('active', isServed);

  // If order is ready or served, show review prompt option
  if (isReady || isServed) {
    const splitBtn = hud.querySelector('button');
    if (splitBtn && !document.getElementById('rate-dining-btn')) {
      const rateBtn = document.createElement('button');
      rateBtn.id = 'rate-dining-btn';
      rateBtn.className = 'btn btn-sm btn-primary';
      rateBtn.style.marginLeft = '8px';
      rateBtn.innerText = t.rateBtn;
      rateBtn.onclick = () => window.openReviewModal();
      splitBtn.parentNode.appendChild(rateBtn);
    }
  }
}

function openTrackerModal(order) {
  renderTrackerHUD(order);
}

// 5-Star Customer Feedback & Rating Logic
window.openReviewModal = () => {
  const modal = document.getElementById('review-modal');
  if (modal) modal.classList.add('active');
};

window.closeReviewModal = () => {
  const modal = document.getElementById('review-modal');
  if (modal) modal.classList.remove('active');
};

window.setRating = (num) => {
  selectedRating = num;
  const stars = document.querySelectorAll('#star-rating-row .star-node');
  stars.forEach((s, idx) => {
    s.style.opacity = (idx < num) ? '1' : '0.3';
    s.style.transform = (idx < num) ? 'scale(1.15)' : 'scale(1)';
  });
  sound.playGentlePing();
};

window.toggleReviewTag = (btn, tag) => {
  if (selectedReviewTags.includes(tag)) {
    selectedReviewTags = selectedReviewTags.filter(t => t !== tag);
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
  } else {
    selectedReviewTags.push(tag);
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-primary');
  }
  sound.playGentlePing();
};

window.submitReviewFeedback = () => {
  const comment = document.getElementById('review-comment')?.value || '';
  const orderId = activePlacedOrder?.order_id || 'ORD-DIRECT';

  hub.submitCustomerReview(orderId, currentTable, selectedRating, selectedReviewTags, comment);
  sound.playGentlePing();
  closeReviewModal();
  alert('⭐ Terima kasih! Thank you for rating Woodfire Kulim. Your feedback helps us smoke perfection!');
};

// Split Bill Calculator
window.openSplitBillModal = () => {
  const modal = document.getElementById('split-bill-modal');
  const orders = hub.getOrders();
  const active = orders.find(o => o.table_id === currentTable && o.status !== 'paid');
  const total = active ? active.total_amount : computeCartTotals(cart).total;

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
