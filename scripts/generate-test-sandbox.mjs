/**
 * Living Multi-Surface Test Sandbox Generator
 * Builds a standalone, interactive test harness HTML page allowing operators
 * to view, test, and manipulate all 4 surfaces (Customer, KDS, POS, Admin) side-by-side.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const sandboxHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARH-MAKAN Living Test Sandbox & Operator Review Suite</title>
  <style>
    :root {
      --bg-dark: #0b0d14;
      --bg-surface: #121520;
      --border-color: #242938;
      --gold: #d4af37;
      --gold-light: #f3e5ab;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg-dark);
      color: var(--text);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      z-index: 100;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand {
      font-family: Georgia, serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--gold-light);
      letter-spacing: 0.5px;
    }
    .badge {
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid var(--gold);
      color: var(--gold-light);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
    }
    .scenario-bar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .btn-scenario {
      background: #1e2433;
      border: 1px solid #334155;
      color: #f1f5f9;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .btn-scenario:hover {
      background: #334155;
      border-color: var(--gold);
      color: var(--gold-light);
    }
    .btn-scenario.danger:hover {
      background: #7f1d1d;
      border-color: #ef4444;
      color: #fff;
    }
    .sandbox-grid {
      display: grid;
      grid-template-columns: 360px 1fr 1fr 1fr;
      flex: 1;
      height: calc(100vh - 60px);
      gap: 1px;
      background: var(--border-color);
    }
    @media (max-width: 1400px) {
      .sandbox-grid {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
      }
    }
    .frame-container {
      background: var(--bg-dark);
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }
    .frame-header {
      background: #151926;
      border-bottom: 1px solid var(--border-color);
      padding: 6px 12px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .frame-header span.tag {
      color: var(--gold);
    }
    iframe {
      border: none;
      width: 100%;
      height: 100%;
      background: #0b0d14;
    }
  </style>
</head>
<body>

  <header>
    <div class="header-left">
      <div class="brand">ARH-MAKAN</div>
      <div class="badge">Living Test Sandbox</div>
      <div style="font-size: 0.8rem; color: var(--text-muted);">Interactive Multi-Surface Live Review</div>
    </div>

    <div class="scenario-bar">
      <button class="btn-scenario" onclick="injectRushHour()">⚡ Inject Rush Hour (4 Orders)</button>
      <button class="btn-scenario" onclick="toggleTruffleFries()">🍟 Toggle Sold Out (86'd)</button>
      <button class="btn-scenario" onclick="callWaiterT05()">🛎️ Call Waiter (T05)</button>
      <button class="btn-scenario" onclick="reloadAllFrames()">🔄 Sync & Reload Views</button>
      <button class="btn-scenario danger" onclick="resetDefaultState()">🧹 Reset State</button>
      <button class="btn-scenario" style="border-color: var(--gold);" onclick="exportAgentFlightTrace()">🐞 Export Agent Trace</button>
    </div>
  </header>

  <main class="sandbox-grid">
    <!-- Frame 1: Customer Mobile View -->
    <div class="frame-container">
      <div class="frame-header">
        <span>📱 <span class="tag">CUSTOMER MOBILE</span> (Table T05)</span>
        <a href="../customer/?table=T05" target="_blank" style="color: var(--gold); text-decoration: none;">↗ Open Tab</a>
      </div>
      <iframe id="frame-customer" src="../customer/index.html?table=T05"></iframe>
    </div>

    <!-- Frame 2: KDS Kitchen Display -->
    <div class="frame-container">
      <div class="frame-header">
        <span>🥩 <span class="tag">KITCHEN DISPLAY (KDS)</span> (Expo & Stations)</span>
        <a href="../kds/" target="_blank" style="color: var(--gold); text-decoration: none;">↗ Open Tab</a>
      </div>
      <iframe id="frame-kds" src="../kds/index.html"></iframe>
    </div>

    <!-- Frame 3: POS Cashier -->
    <div class="frame-container">
      <div class="frame-header">
        <span>💻 <span class="tag">POS CASHIER REGISTER</span></span>
        <a href="../pos/" target="_blank" style="color: var(--gold); text-decoration: none;">↗ Open Tab</a>
      </div>
      <iframe id="frame-pos" src="../pos/index.html"></iframe>
    </div>

    <!-- Frame 4: Admin Control & QR Matrix -->
    <div class="frame-container">
      <div class="frame-header">
        <span>⚙️ <span class="tag">ADMIN CONTROL & QR MATRIX</span></span>
        <a href="../admin/" target="_blank" style="color: var(--gold); text-decoration: none;">↗ Open Tab</a>
      </div>
      <iframe id="frame-admin" src="../admin/index.html"></iframe>
    </div>
  </main>

  <script type="module">
    import { hub } from '../shared/realtime-adapter.js';

    window.reloadAllFrames = () => {
      document.querySelectorAll('iframe').forEach(f => f.src = f.src);
    };

    window.injectRushHour = () => {
      const sampleOrders = [
        {
          order_id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
          table_id: 'T01',
          items: [
            { item_id: 'wf-double-beef', name: 'Woodfire Double Beef', qty: 2, unit_price: 26.90, station: 'grill', is_bumped: false, line_id: 'l1' },
            { item_id: 'wf-truffle-fries', name: 'Truffle Fries', qty: 2, unit_price: 14.00, station: 'fry', is_bumped: false, line_id: 'l2' }
          ],
          total_amount: 81.80
        },
        {
          order_id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
          table_id: 'T03',
          items: [
            { item_id: 'wf-smoked-ribs', name: 'Texas Smoked Ribs', qty: 1, unit_price: 45.00, station: 'grill', is_bumped: false, line_id: 'l3' },
            { item_id: 'wf-caramel-shake', name: 'Salted Caramel Shake', qty: 2, unit_price: 16.00, station: 'bar', is_bumped: false, line_id: 'l4' }
          ],
          total_amount: 77.00
        }
      ];

      sampleOrders.forEach(o => hub.createOrder(o));
      console.log('⚡ [Sandbox] Injected Rush Hour orders.');
    };

    window.toggleTruffleFries = () => {
      const isSoldOut = hub.toggleSoldOut('wf-truffle-fries');
      alert(\`Truffle Fries is now: \${isSoldOut ? '86 (SOLD OUT)' : 'AVAILABLE'}\`);
    };

    window.callWaiterT05 = () => {
      hub.createServiceRequest('T05', 'waiter', 'Table requested assistance');
    };

    window.resetDefaultState = () => {
      localStorage.clear();
      window.reloadAllFrames();
    };

    window.exportAgentFlightTrace = () => {
      const raw = localStorage.getItem('arh_flight_record_events');
      if (!raw) {
        alert('No flight records found yet. Interact with the surfaces first!');
        return;
      }
      const events = JSON.parse(raw);
      const jsonl = events.map(e => JSON.stringify(e)).join('\\n');
      const blob = new Blob([jsonl], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = \`flight-record-agent-\${Date.now()}.jsonl\`;
      a.click();
    };
  </script>
</body>
</html>
`;

// Write to root test-sandbox.html and evidence/test-sandbox.html
fs.writeFileSync(path.join(root, 'test-sandbox.html'), sandboxHtml, 'utf-8');

const evidenceDir = path.join(root, 'evidence');
if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(path.join(evidenceDir, 'test-sandbox.html'), sandboxHtml, 'utf-8');

console.log('✅ Generated standalone test sandboxes:');
console.log('   └─ test-sandbox.html');
console.log('   └─ evidence/test-sandbox.html');
