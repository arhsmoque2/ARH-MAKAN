# Operational Recipes & Agent Playbook — ARH-MAKAN

This document provides tested, copy-pasteable recipes for agents taking over development, maintenance, or debugging on the ARH-MAKAN suite.

---

## ⚙️ Recipe 1: Configuring Environment & Running Local Development

ARH-MAKAN is a zero-build ESM web application. To serve and develop locally:

```bash
# 1. Serve with any standard static HTTP server (port 8080 recommended)
npx serve -p 8080 .
# or:
python -m http.server 8080

# 2. Open any surface in your browser:
# Customer Dine-In: http://localhost:8080/customer/?table=T05
# Kitchen Display:  http://localhost:8080/kds/
# Cashier Register: http://localhost:8080/pos/
# Manager Hub:      http://localhost:8080/admin/
# Living Sandbox:   http://localhost:8080/test-sandbox.html
```

---

## 🍔 Recipe 2: Adding a New Menu Item with Modifiers & Station Routing

1. **Add Item to `shared/mock-data/menu.json`**:
```json
{
  "id": "wf-truffle-mac",
  "name": "Smoked Truffle Mac & Cheese",
  "category": "sides",
  "price": 18.90,
  "description": "Four-cheese blend infused with black truffle oil and topped with smoked beef bits.",
  "badge": "Popular",
  "station": "fry",
  "dietary": ["halal"],
  "is_sold_out": false,
  "modifiers": [
    {
      "id": "spice_level",
      "name": "Spice Level",
      "type": "single",
      "required": true,
      "options": [
        { "name": "Mild", "price": 0 },
        { "name": "Spicy Jalapeno", "price": 1.50 }
      ]
    },
    {
      "id": "extra_cheese",
      "name": "Cheese Topping",
      "type": "single",
      "required": false,
      "options": [
        { "name": "Extra Melted Cheddar", "price": 3.00 },
        { "name": "Shaved Parmesan", "price": 2.50 }
      ]
    }
  ]
}
```

2. **Verify Station Keyword in `shared/showroom-bridge.js`**:
If using a custom category name, ensure the keyword appears in `CategoryStationMap` or the regex in `resolveStation(category, itemName)`:
```javascript
// Keywords automatically route to 'fry' if category is omitted or custom
/(fries|curly|truffle|wedges|nugget|tenders|onion ring|popcorn|wings|corndog|nacho|fry)/i.test(itemName) -> 'fry'
```

3. **Run Bridge Verification**:
```bash
node scripts/test-showroom-bridge.mjs
```

---

## 🪑 Recipe 3: Adding New Tables to Floor Plan & Batch QR Printing

1. **Update Table List in `shared/realtime-adapter.js` (`getTableStatusMatrix`)**:
```javascript
const tables = [
  { id: 'T01', capacity: 2 },
  { id: 'T02', capacity: 2 },
  { id: 'T03', capacity: 4 },
  { id: 'T04', capacity: 4 },
  { id: 'T05', capacity: 6 },
  { id: 'T06', capacity: 6 },
  { id: 'T07', capacity: 8 },
  { id: 'T08', capacity: 4 },
  { id: 'T09', capacity: 4 }, // <-- New Table
  { id: 'T10', capacity: 6 }  // <-- New Table
];
```

2. **Batch Print Table Tent Cards**:
Open `/admin/index.html` in your browser, scroll to **QR Code & Table Tent Cards**, and click **"🖨️ Print All Table Tent Cards"** (or call `window.printAllTentCards()`). It generates an A4 printable sheet formatted with QR codes, table numbers, and Wi-Fi instructions.

---

## 🐞 Recipe 4: Reproducing Bugs Using Flight Recorder Traces

When an operator encounters a bug during testing:
1. Operator clicks the **`🐞 Agent Trace Log`** pill at bottom-right of the screen (or clicks "Export Agent Trace" in `test-sandbox.html`).
2. Downloaded trace `flight-record-<surface>-<timestamp>.jsonl` contains the exact execution steps:
```jsonl
{"timestamp":"2026-08-17T08:24:12Z","surface":"KDS","type":"USER_ACTION","action":"click","selector":"button#station-fry","text":"🍟 Fry"}
{"timestamp":"2026-08-17T08:24:13Z","surface":"KDS","type":"USER_ACTION","action":"click","selector":"div.item-checkbox","text":"☐"}
{"timestamp":"2026-08-17T08:24:13Z","surface":"KDS","type":"NETWORK_FETCH","method":"PATCH","url":"https://arh-firebase-db.../orders/ORD-8921.json","status":200,"durationMs":140}
{"timestamp":"2026-08-17T08:24:14Z","surface":"KDS","type":"UNCAUGHT_EXCEPTION","message":"Cannot read properties of undefined (reading 'station')","filename":"kds.js","lineno":228,"stack":"TypeError: ... at renderExpoView (kds.js:228)"}
```
3. The agent reads the JSONL, sees the exact sequence of clicks, the failed line, and the call stack, allowing an immediate fix!

---

## 🧪 Recipe 5: Running CI Doctor & Quality Gates

Always run the full 8-gate suite before pushing:
```bash
node scripts/arh-ci-doctor.mjs
# or via npm:
npm test
```

To run individual sub-tests:
```bash
# 1. QR Code matrix density and scannability
node scripts/test-qr-verify.mjs

# 2. Station routing unit suite
node scripts/test-showroom-bridge.mjs

# 3. Infrastructure preflight (Wrangler config + Firebase probe)
node scripts/verify-infra-preflight.mjs

# 4. Cloudflare Worker Edge Runtime & Fetch Suite
node scripts/test-worker-runtime.mjs
```

---

## 🚀 Recipe 6: Deploying to Cloudflare Workers with Dynamic Secrets

Deployments are driven automatically by GitHub Actions on push to `main` or via `workflow_dispatch`.

To deploy manually via CLI with runtime secrets:
```bash
# 1. Test worker runtime simulation locally
node scripts/test-worker-runtime.mjs

# 2. Deploy with dynamically injected environment variable (no plaintext in wrangler.jsonc)
npx wrangler deploy -c ./wrangler.jsonc --var FIREBASE_DATABASE_URL:$FIREBASE_DATABASE_URL
```

