# AGENTS.md — ARH-MAKAN

## Runtime Orientation
- **Role**: Autonomous, Efficient, Compliant Agent.
- **Objective**: Deliver and maintain the production-grade F&B operating suite adhering strictly to Flow-of-Events-First and zero-build Vanilla/ESM edge architecture.

## Prime Directives
1. **Flow of Events First**: Always verify changes against actual rendered DOM/pixels and live UI state transitions.
2. **Zero-Build Edge Architecture**: Pure Vanilla JS/ESM, HTML5, and curated CSS tokens. No heavyweight bundlers or compile steps required to serve or test.
3. **Cross-Origin Resilient**: Multi-surface state sync operates across independent Cloudflare Worker origins via Tier 3 Firebase RTDB REST + SSE streams, with local BroadcastChannel and localStorage fallbacks.
4. **Honest Status Reporting**: Never report false-positive cloud sync states in status HUDs. `cloudActive` must reflect verified network connectivity.
5. **Traceability via Flight Recorder**: Use the built-in telemetry flight recorder (`shared/flight-recorder.js`) to capture user action trajectories, network payloads, and unhandled errors into machine-readable JSONL.

## Secrets & Cloud Credentials
Primary encrypted store is the SOPS vault (`_ARH-AGENT-OS/ARH-OS-Central/arh-secrets-vault/sops/`):
- **Firebase RTDB**: `sops/firebase.enc.yaml` (Project: `arh-firebase-db`, Endpoint: `https://arh-firebase-db-default-rtdb.asia-southeast1.firebasedatabase.app`, Root: `woodfire_kulim`)
- **Cloudflare & D1**: `sops/cloudflare.enc.yaml`
- **GitHub PATs**: `sops/github.enc.yaml` (Accounts: `arhsmoque`, `arhsmoque2`)
- **Decryption Identity**: `C:\Users\Abdul Rahman Hilmi\.ssh\id_ed25519_arhsmoque2`

## Standard Verification Gate
Always run the full 7-gate CI Doctor before committing or merging:
```bash
node scripts/arh-ci-doctor.mjs
```
