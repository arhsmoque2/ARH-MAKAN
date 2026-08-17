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

## 4. Naive JSONC Comment Stripping Destroys String Literals with `//`
- **Symptom**: `JSON.parse()` fails with `Bad control character in string literal in JSON at position 181`.
- **Root Cause**: A regex like `replace(/\/\/.*$/gm, '')` blindly matches `//` inside URLs like `https://...` within JSON string values, truncating strings and leaving unclosed quotes.
- **Permanent Fix**: Use string-preserving regex:
  ```javascript
  const stripped = raw.replace(/("(?:\\.|[^\\"])*")|\/\*[\s\S]*?\*\/|\/\/.*$/gm, (match, str) => str || '');
  ```

## 5. Cloudflare Workers Static Assets vs Worker Fetch Precedence
- **Symptom**: Direct requests for existing HTML assets (`/`, `/index.html`) bypass Worker `fetch()` when Assets mode is enabled, preventing `HTMLRewriter` from modifying static HTML on edge cache hits.
- **Root Cause**: Cloudflare edge asset pipeline serves static assets before executing `worker.mjs`.
- **Permanent Fix**: Expose a dynamic JSON config route (`/api/config`) which bypasses static assets, and have client-side adapters (`realtime-adapter.js`) probe `/api/config` asynchronously upon startup.

## 6. Plaintext Secrets in `wrangler.jsonc` vs Deploy-Time Injection
- **Symptom**: Storing credentials or database endpoints under `vars` in `wrangler.jsonc` commits sensitive configuration directly to git history.
- **Root Cause**: `wrangler.jsonc` is tracked in version control.
- **Permanent Fix**: Remove `vars` from `wrangler.jsonc` and pass `--var KEY:${{ secrets.KEY }}` dynamically in the GitHub Actions `wrangler deploy` step.

## 7. Edge Worker Verification Gate in CI (Testing `worker.fetch`)
- **Symptom**: Repeated production deploy iterations due to runtime TypeErrors and header mutation bugs in `worker.mjs` that static linters miss.
- **Root Cause**: Syntax checkers only parse files; they never execute `worker.fetch(req, env)` against real request/response streams.
- **Permanent Fix**: Implement `scripts/test-worker-runtime.mjs` as Gate 8 in CI Doctor to simulate edge requests, header immutability, and endpoint payloads locally before deploy.

