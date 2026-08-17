/**
 * ESC/POS Thermal Receipt & Kitchen Prep Ticket Formatter
 * Ported from industry-standard POS patterns (Kasirku / escpos-php / Star Micronics).
 * Supports 58mm (32 cols) and 80mm (42/48 cols) thermal rolls, raw byte buffers,
 * and high-fidelity pixel-perfect browser thermal print previews.
 */

export const PaperWidth = {
  MM_58: 32,
  MM_80: 42,
  MM_80_WIDE: 48
};

export class EscPosReceiptBuilder {
  constructor(options = {}) {
    this.width = options.width || PaperWidth.MM_80;
    this.storeName = options.storeName || 'WOODFIRE KULIM';
    this.tagline = options.tagline || 'Gourmet Burgers & Smoked Meats';
    this.contact = options.contact || 'Tel: +60 16-979 9778';
    this.address = options.address || 'Kulim Square Commercial Centre, Kedah';
    this.taxRate = options.taxRate !== undefined ? options.taxRate : 0.06;
    this.taxName = options.taxName || 'SST (6%)';
    this.currency = options.currency || 'RM';
  }

  // --- String Formatting Helpers ---

  padLine(left, right, width = this.width) {
    const leftStr = String(left || '');
    const rightStr = String(right || '');
    const spaceCount = Math.max(1, width - leftStr.length - rightStr.length);
    return leftStr + ' '.repeat(spaceCount) + rightStr;
  }

  centerText(text, width = this.width) {
    const str = String(text || '');
    if (str.length >= width) return str.slice(0, width);
    const pad = Math.floor((width - str.length) / 2);
    return ' '.repeat(pad) + str;
  }

  divider(char = '-', width = this.width) {
    return char.repeat(width);
  }

  // --- HTML Thermal Receipt Generator (Pixel-Perfect 58mm/80mm) ---

  generateHtmlReceipt(order, options = {}) {
    const widthMm = this.width === PaperWidth.MM_58 ? '58mm' : '80mm';
    const dateStr = order.created_at ? new Date(order.created_at).toLocaleString('en-MY', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    }) : new Date().toLocaleString();

    const subtotal = order.subtotal || order.items.reduce((s, it) => s + (it.total_price || (it.unit_price * it.qty)), 0);
    const tax = order.tax !== undefined ? order.tax : (subtotal * this.taxRate);
    const total = order.total_amount || (subtotal + tax);

    return `
      <div class="escpos-receipt" style="
        font-family: 'Courier New', Courier, monospace;
        width: ${widthMm};
        max-width: 100%;
        margin: 0 auto;
        padding: 8px 6px;
        background: #ffffff;
        color: #000000;
        font-size: 12px;
        line-height: 1.35;
        box-sizing: border-box;
      ">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 6px;">
          <div style="font-weight: 900; font-size: 16px; letter-spacing: 0.5px;">${this.storeName}</div>
          <div style="font-size: 11px; margin-top: 2px;">${this.tagline}</div>
          <div style="font-size: 10px; color: #333;">${this.address}</div>
          <div style="font-size: 10px; color: #333;">${this.contact}</div>
        </div>

        <!-- Meta -->
        <div style="border-top: 1px dashed #000; padding: 4px 0; margin: 4px 0;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>ORD: #${order.order_id}</span>
            <span>TABLE ${order.table_id}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #444;">
            <span>${order.type ? order.type.toUpperCase() : 'DINE-IN'}</span>
            <span>${dateStr}</span>
          </div>
        </div>

        <!-- Items Table -->
        <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 4px 0; margin: 4px 0;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11px; margin-bottom: 4px;">
            <span style="flex: 1;">QTY ITEM</span>
            <span style="text-align: right;">PRICE (${this.currency})</span>
          </div>
          ${order.items.map(item => {
            const itemTotal = (item.total_price || (item.unit_price * item.qty)).toFixed(2);
            return `
              <div style="margin-bottom: 4px;">
                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                  <span style="flex: 1; padding-right: 8px;">${item.qty}x ${item.name}</span>
                  <span style="text-align: right; font-family: monospace;">${itemTotal}</span>
                </div>
                ${item.selected_modifiers && item.selected_modifiers.length ? `
                  <div style="font-size: 10px; color: #555; padding-left: 14px;">
                    ${item.selected_modifiers.map(m => `+ ${m.option_name || m.name}`).join(', ')}
                  </div>
                ` : ''}
                ${item.notes ? `
                  <div style="font-size: 10px; font-style: italic; color: #555; padding-left: 14px;">
                    Note: ${item.notes}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Financial Summary -->
        <div style="padding: 4px 0;">
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span>Subtotal:</span>
            <span style="font-family: monospace;">${this.currency} ${subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span>${this.taxName}:</span>
            <span style="font-family: monospace;">${this.currency} ${tax.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 15px; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px;">
            <span>TOTAL PAID:</span>
            <span style="font-family: monospace;">${this.currency} ${total.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 2px;">
            <span>Payment Method:</span>
            <span style="font-weight: bold;">${(order.payment_method || 'CASH').toUpperCase()}</span>
          </div>
        </div>

        <!-- QR Code / Footer -->
        <div style="border-top: 1px dashed #000; text-align: center; padding-top: 8px; margin-top: 6px; font-size: 10px;">
          <div style="font-weight: bold; margin-bottom: 2px;">Terima Kasih! Sila Datang Lagi.</div>
          <div style="color: #444;">WiFi: <strong>WoodfireGuest</strong> · Key: <strong>woodfire2026</strong></div>
          <div style="color: #888; font-size: 9px; margin-top: 4px;">Powered by ARH-MAKAN POS OS</div>
        </div>
      </div>
    `;
  }

  // --- Kitchen Station Expedite / Prep Ticket (KDS Print) ---

  generateKitchenPrepTicket(order, station = 'all') {
    const filteredItems = station === 'all'
      ? order.items
      : order.items.filter(it => it.station === station);

    if (filteredItems.length === 0) return '';

    const timeStr = new Date(order.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="escpos-kitchen-ticket" style="
        font-family: 'Courier New', Courier, monospace;
        width: 80mm;
        margin: 0 auto;
        padding: 8px 6px;
        background: #ffffff;
        color: #000000;
        font-size: 13px;
        line-height: 1.4;
      ">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 6px;">
          <div style="font-size: 18px; font-weight: 900;">** KITCHEN TICKET **</div>
          <div style="font-size: 14px; font-weight: bold; background: #000; color: #fff; padding: 2px 4px; border-radius: 4px; display: inline-block; margin-top: 2px;">
            STATION: ${station.toUpperCase()}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; margin-bottom: 4px;">
          <span>TABLE ${order.table_id}</span>
          <span>#${order.order_id}</span>
        </div>
        <div style="font-size: 11px; color: #333; margin-bottom: 6px; border-bottom: 1px dashed #000; padding-bottom: 4px;">
          Time: ${timeStr} · Type: ${(order.type || 'dine_in').toUpperCase()}
        </div>

        <div style="padding: 4px 0;">
          ${filteredItems.map(item => `
            <div style="margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
              <div style="font-size: 16px; font-weight: 900; display: flex; align-items: flex-start;">
                <span style="min-width: 32px; font-size: 18px;">[ ]</span>
                <span style="min-width: 28px;">${item.qty}x</span>
                <span style="flex: 1;">${item.name}</span>
              </div>
              ${item.selected_modifiers && item.selected_modifiers.length ? `
                <div style="font-size: 12px; font-weight: bold; padding-left: 60px; color: #222;">
                  ${item.selected_modifiers.map(m => `* ${m.option_name || m.name}`).join('<br>')}
                </div>
              ` : ''}
              ${item.notes ? `
                <div style="font-size: 12px; font-weight: bold; background: #eee; padding: 2px 6px; margin-top: 2px; margin-left: 60px; border-left: 3px solid #000;">
                  ⚠️ ${item.notes}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <div style="border-top: 2px solid #000; text-align: center; padding-top: 4px; font-size: 11px; font-weight: bold;">
          TOTAL ITEMS: ${filteredItems.reduce((acc, i) => acc + (i.qty || 1), 0)}
        </div>
      </div>
    `;
  }

  // --- Direct Dispatch via Browser Window Print ---

  printHtml(htmlContent) {
    if (typeof window === 'undefined') return;

    const frameId = 'arh_escpos_print_iframe';
    let iframe = document.getElementById(frameId);
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = frameId;
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Thermal Print</title>
        <style>
          @page {
            margin: 0;
            size: auto;
          }
          body {
            margin: 0;
            padding: 0;
            background: #fff;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 250);
  }
}

export const escPos = new EscPosReceiptBuilder();
