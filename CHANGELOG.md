# Changelog — ARH-MAKAN

All notable changes to the ARH-MAKAN repository are documented in this file.

## [2.2.0] - 2026-08-17
### Added
- **Zero-Dependency Dynamic QR Engine (`shared/qr-generator.js`)**: Pure client-side ISO/IEC 18004 compliant QR matrix encoder (<12KB ESM) supporting dynamic table URL encoding, 1-click PNG export, and A4 printable Table Tent Card batch layout.
- **Expediter (Expo) Summary View (`kds/`)**: Aggregates all active un-bumped items across the floor with per-table counts.
- **ESC/POS Thermal Formatter (`shared/escpos-formatter.js`)**: 58mm/80mm formatted thermal receipt and kitchen prep ticket generator.
- **Fast Cash Denomination Pad (`pos/`)**: Instant change calculation pad (`Exact`, `RM 20`, `RM 50`, `RM 100`).
- **Showroom Bridge Station-Routing Engine (`shared/showroom-bridge.js`)**: Automatic category mapping and regex keyword fallback preventing station fallthrough.
- **Client-Side Flight Recorder (`shared/flight-recorder.js`)**: 2KB zero-dependency telemetry engine capturing user click trajectories, network payloads, and unhandled JS exceptions into JSONL.
- **Living Multi-Surface Test Sandbox (`test-sandbox.html`)**: Quad-split interactive dashboard with 1-click scenario injectors (Rush Hour, 86 Sold Out, Waiter calls).
- **Portable 7-Gate CI Doctor (`scripts/arh-ci-doctor.mjs`)**: Self-contained multi-gate quality and preflight suite.

### Fixed
- Station routing fallthrough for Woodfire menu categories (`fries`, `sides`, `upgrades`, `starters` -> `fry`).
- Double table prefix formatting in KDS Expo view (`TT05` -> `T05`).
- Honest sync status HUD gating preventing false-positive cloud badges when offline.
