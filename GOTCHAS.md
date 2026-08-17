# GOTCHAS — ARH-MAKAN

## 1. Cross-Origin Realtime Synchronization
- **Gotcha**: `localStorage` and `BroadcastChannel` are strictly same-origin. If the Showroom runs on `showroom.workers.dev` and ARH-MAKAN runs on `makan.workers.dev`, they cannot exchange state via local events.
- **Solution**: Tier 3 Cloud Sync uses Firebase RTDB REST endpoints and SSE streams on the shared root `woodfire_kulim`, allowing cross-origin synchronization across independent domains.

## 2. Sync Status Badge Honesty
- **Gotcha**: Never hardcode `cloudActive = true` simply because a URL string is present. If network requests fail or permissions deny access, the HUD must reflect actual degraded/local status rather than showing a false positive.
- **Solution**: In `shared/realtime-adapter.js`, `cloudActive` transitions only upon validated HTTP 200 responses or active SSE event listener receipt.

## 3. Station Routing Fallback
- **Gotcha**: New menu items added with unanticipated category strings (e.g. `seasonal-fries`) could misroute to `grill` if only exact category maps are checked.
- **Solution**: `shared/showroom-bridge.js` applies category mapping followed by a regex keyword fallback (`resolveStation`), ensuring fries/shakes/burgers always route to their designated kitchen station (`fry`, `bar`, `grill`).
