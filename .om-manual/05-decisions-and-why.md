# 5. ARH-MAKAN — decisions and why

_Decision and design records found in the project, quoted from the source documents. Generated directly from project records._

## Standing guidance (AGENTS.md)

Source: `AGENTS.md` (opening, quoted verbatim):

> # AGENTS.md — ARH-MAKAN
>
> ## Runtime Orientation
> - **Role**: Autonomous, Efficient, Compliant Agent.
> - **Objective**: Deliver and maintain the production-grade F&B operating suite adhering strictly to Flow-of-Events-First and zero-build Vanilla/ESM edge architecture.
>
> ## Prime Directives
> 1. **Flow of Events First**: Always verify changes against actual rendered DOM/pixels and live UI state transitions.
> 2. **Zero-Build Edge Architecture**: Pure Vanilla JS/ESM, HTML5, and curated CSS tokens. No heavyweight bundlers or compile steps required to serve or test.
> 3. **Cross-Origin Resilient**: Multi-surface state sync operates across independent Cloudflare Worker origins via Tier 3 Firebase RTDB REST + SSE streams, with local BroadcastChannel and localStorage fallbacks.
> 4. **Honest Status Reporting**: Never report false-positive cloud sync states in status HUDs. `cloudActive` must reflect verified network connectivity.
> 5. **Traceability via Flight Recorder**: Use the built-in telemetry flight recorder (`shared/flight-recorder.js`) to capture user action trajectories, network payloads, and unhandled errors into machine-readable JSONL.
>
> ## Secrets & Configuration Governance
> - **Zero Plaintext Secrets**: Never commit plaintext API keys, tokens, or private identity paths to this repository.
> - **Environment Injection**: Configuration and runtime tokens are injected via standard environment variables (e.g. `FIREBASE_RTDB_URL`, `CLOUDFLARE_API_TOKEN`) or resolved through the central ARH secret injector mechanism.
> - **Offline-First Resilience**: The multi-surface suite operates fully offline-first using local `BroadcastChannel` and `localStorage` state buses. Cloud database sync is an optional tier configured strictly via environment or runtime settings.
>
> ## Standard Verification Gate
> Always run the full 7-gate CI Doctor before committing or merging:
> ```bash
> node scripts/arh-ci-doctor.mjs
> ```

