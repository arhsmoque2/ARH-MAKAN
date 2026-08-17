# Operational Recipes & Agent Playbook — ARH-MAKAN

This document provides tested, copy-pasteable recipes for agents taking over development, maintenance, or debugging on the ARH-MAKAN suite.

---

## 🔐 Recipe 1: Decrypting Cloud Secrets & Credentials from SOPS Vault

All production credentials live in the encrypted SOPS vault (`_ARH-AGENT-OS/ARH-OS-Central/arh-secrets-vault/sops/`).

```python
import subprocess, os, yaml

env = os.environ.copy()
# SSH Identity configured for arhsmoque2 recipient
env['SOPS_AGE_KEY_FILE'] = 'C:/Users/Abdul Rahman Hilmi/.ssh/id_ed25519_arhsmoque2'
env['SOPS_AGE_SSH_PRIVATE_KEY_FILE'] = 'C:/Users/Abdul Rahman Hilmi/.ssh/id_ed25519_arhsmoque2'

vault_dir = 'D:/_ARH-AGENT-OS/ARH-OS-Central/arh-secrets-vault'

# Decrypt Firebase secrets (Project: arh-firebase-db)
res_fb = subprocess.run(['sops', '-d', 'sops/firebase.enc.yaml'], cwd=vault_dir, env=env, capture_output=True, text=True)
firebase_secrets = yaml.safe_load(res_fb.stdout)

# Decrypt Cloudflare / D1 / R2 secrets
res_cf = subprocess.run(['sops', '-d', 'sops/cloudflare.enc.yaml'], cwd=vault_dir, env=env, capture_output=True, text=True)
cloudflare_secrets = yaml.safe_load(res_cf.stdout)
```

---

## 🍔 Recipe 2: Adding a New Menu Item with Modifiers & Station Routing

1. **Add Item to `shared/mock-data/menu.json`**:
```json
{
  "id": "wf-truffle-mac",
  "name": "Smoked Truffle Mac & Cheese",
  "description": "Four-cheese blend infused with black truffle oil and topped with smoked beef bits.",
  "price": 18.90,
  "category_id": "sides",
  "station": "fry",
  "image": "../assets/images/menu/truffle-mac.webp",
  "modifier_group_ids": ["mod-spice-level", "mod-extra-cheese"]
}
```

2. **Verify Station Keyword in `shared/showroom-bridge.js`**:
If using a custom category name, ensure the keyword appears in `CategoryStationMap` or the regex in `resolveStation(category, itemName)`:
```javascript
// Keywords automatically route to 'fry' if category is omitted/custom
/fries|curly|truffle|wedges|nugget|onion|ring|mac|cheese/i.test(itemName) -> 'fry'
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

Always run the full suite before pushing:
```bash
node scripts/arh-ci-doctor.mjs
```

To run individual sub-tests:
```bash
# QR Code matrix density and scannability
node scripts/test-qr-verify.mjs

# Station routing unit suite
node scripts/test-showroom-bridge.mjs

# Infrastructure preflight (Wrangler + Firebase probe)
node scripts/verify-infra-preflight.mjs
```

---

## 🚀 Recipe 6: Deploying to Cloudflare Workers / Pages

```bash
# Test dry run build
npx wrangler deploy --dry-run

# Deploy to staging/production
npx wrangler deploy
```
