# ARH-MAKAN · Desktop DevCon (Operator Plane Shell)

> Lightweight cross-platform native desktop shell built with Tauri v2. Mirrored directly from the `/devcon/` web surface for restaurant operators and developers.

---

## 🏛️ Architecture & Capabilities

* **Zero-Rebuild UI Mirroring**: The desktop shell loads the local DevCon web application (`../../devcon/index.html` or `http://localhost:8787/devcon/`), providing native window management and hardware monitoring.
* **Included Operator Modules**:
  * 📈 **Permanent In-App Sales & Velocity Analytics**: Gross sales, AOV, SST 6%, Day-over-Day growth velocity, and top-selling leaderboard.
  * 🚨 **Beacon-Style Error Telemetry**: Root-cause exception grouping with 1-click JSONL export.
  * 🧠 **3-Tier Realtime State Engine Inspector**: Live BroadcastChannel, memory footprint, and cloud state diagnostics.
  * ⚙️ **Admin Visibility Feature Gate**: Master toggle controlling whether the manager Admin Hub (`/admin/`) displays the Sales Analytics pane.

---

## 🚀 Running Locally (Developer Mode)

```bash
# 1. Start the local ARH-MAKAN edge dev server in root directory
npx wrangler dev

# 2. In a separate terminal, launch the desktop shell (Tauri dev mode)
cd operator-plane/desktop-devcon
pnpm install
pnpm tauri dev
```

> **Note**: Per ARH OS operational standards, production release binary compilation should be dispatched to remote build runners (e.g. RunPod / GitHub Actions) to prevent heavy local CPU lockups.
