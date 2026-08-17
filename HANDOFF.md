# HANDOFF — ARH-MAKAN

## Architecture & Realtime State Sync
ARH-MAKAN implements a 3-tier hybrid state synchronization model in `shared/realtime-adapter.js`:
- **Tier 1: Local Intra-Browser Sync (`BroadcastChannel`)**
  - Instant (<5ms) event propagation across browser tabs and iframes on the same origin.
- **Tier 2: Crash Resilience & Offline Queue (`localStorage` + Memory Store)**
  - Retains open orders, bump progress, and 86'd inventory across browser reloads.
- **Tier 3: Cross-Origin Cloud Engine (`Firebase RTDB REST + SSE Stream`)**
  - **Firebase Project**: `arh-firebase-db`
  - **Live RTDB Endpoint**: `https://arh-firebase-db-default-rtdb.asia-southeast1.firebasedatabase.app`
  - **Root Namespace**: `woodfire_kulim`
  - **Protocol**: Zero-dependency `fetch` PUT/PATCH/DELETE + Server-Sent Events (`EventSource`) stream.
  - **Honest Status Gate**: `cloudActive` is only `true` when a proven, successful connection (HTTP 200) or SSE stream is confirmed. Otherwise, status accurately reports `Local Multi-Surface (BroadcastChannel)` or `Cloud Sync Degraded (Operating in Local Mode)`.

## Secrets & Infrastructure Configuration
- Master keys and Cloudflare/Firebase credentials are maintained in the SOPS secrets vault:
  - `_ARH-AGENT-OS/ARH-OS-Central/arh-secrets-vault/sops/firebase.enc.yaml`
  - `_ARH-AGENT-OS/ARH-OS-Central/arh-secrets-vault/sops/cloudflare.enc.yaml`

## Verification & CI Suite
Run all 7 quality and infrastructure preflight gates:
```bash
node scripts/arh-ci-doctor.mjs
```
