/**
 * ARH Frontend Flight Recorder & Agent Telemetry Engine (v1.0)
 * Lightweight (2KB), zero-dependency client telemetry engine.
 * Records user interaction trajectories, network payloads, state mutations, and unhandled JS exceptions
 * into structured JSON Lines (.jsonl) for instant agent inspection without manual explanations.
 */

(function () {
  if (typeof window === 'undefined') return;
  if (window.__ARH_FLIGHT_RECORDER_INITIALIZED__) return;
  window.__ARH_FLIGHT_RECORDER_INITIALIZED__ = true;

  const STORAGE_KEY = 'arh_flight_record_events';
  const MAX_EVENTS = 200;
  const events = [];

  function getSurfaceName() {
    const p = window.location.pathname;
    if (p.includes('/customer')) return 'Customer';
    if (p.includes('/kds')) return 'KDS';
    if (p.includes('/pos')) return 'POS';
    if (p.includes('/admin')) return 'Admin';
    if (p.includes('/showroom')) return 'Showroom';
    return 'Hub';
  }

  function record(type, payload = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      surface: getSurfaceName(),
      url: window.location.href,
      type,
      ...payload
    };

    events.push(entry);
    if (events.length > MAX_EVENTS) events.shift();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (_) {}
  }

  // 1. Capture User Clicks & Interactions
  window.addEventListener('click', (e) => {
    try {
      const target = e.target.closest('button, a, input, select, [onclick], .clickable') || e.target;
      if (!target) return;

      const tag = target.tagName.toLowerCase();
      const id = target.id ? `#${target.id}` : '';
      const cls = target.className && typeof target.className === 'string' ? `.${target.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
      const text = (target.innerText || target.value || target.getAttribute('aria-label') || '').slice(0, 50).trim();

      record('USER_ACTION', {
        action: 'click',
        selector: `${tag}${id}${cls}`,
        text
      });
    } catch (_) {}
  }, true);

  // 2. Capture Form / Input Changes
  window.addEventListener('change', (e) => {
    try {
      const target = e.target;
      if (!target || !target.tagName) return;
      const tag = target.tagName.toLowerCase();
      const name = target.name || target.id || '';
      const val = target.type === 'password' ? '[REDACTED]' : String(target.value).slice(0, 50);

      record('USER_ACTION', {
        action: 'change',
        selector: `${tag}${name ? `[name="${name}"]` : ''}`,
        value: val
      });
    } catch (_) {}
  }, true);

  // 3. Capture Network Fetch Requests
  const originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = async function (...args) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || 'unknown';
      const method = (args[1] && args[1].method) || 'GET';
      const t0 = performance.now();

      try {
        const res = await originalFetch.apply(this, args);
        const durationMs = Math.round(performance.now() - t0);
        record('NETWORK_FETCH', {
          method,
          url,
          status: res.status,
          durationMs
        });
        return res;
      } catch (err) {
        const durationMs = Math.round(performance.now() - t0);
        record('NETWORK_ERROR', {
          method,
          url,
          error: err.message,
          durationMs
        });
        throw err;
      }
    };
  }

  // 4. Capture Uncaught Errors & Unhandled Rejections
  window.addEventListener('error', (e) => {
    record('UNCAUGHT_EXCEPTION', {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      stack: e.error && e.error.stack ? e.error.stack : null
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    record('UNHANDLED_REJECTION', {
      reason: e.reason ? (e.reason.message || String(e.reason)) : 'Unknown rejection',
      stack: e.reason && e.reason.stack ? e.reason.stack : null
    });
  });

  // 5. Expose Global API & Export Methods
  window.__ARH_FLIGHT_RECORDER__ = {
    record,
    getEvents: () => events,
    clear: () => {
      events.length = 0;
      localStorage.removeItem(STORAGE_KEY);
    },
    exportJsonl: () => {
      return events.map(ev => JSON.stringify(ev)).join('\n');
    },
    downloadTrace: () => {
      const jsonl = events.map(ev => JSON.stringify(ev)).join('\n');
      const blob = new Blob([jsonl], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `flight-record-${getSurfaceName().toLowerCase()}-${Date.now()}.jsonl`;
      a.click();
    }
  };

  // 6. Inject Floating Dev Pill for 1-Click Agent Trace Export
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      const pill = document.createElement('div');
      pill.id = 'arh-flight-recorder-pill';
      pill.style.cssText = `
        position: fixed;
        bottom: 12px;
        right: 12px;
        z-index: 999999;
        background: rgba(18, 20, 29, 0.88);
        border: 1px solid rgba(212, 175, 55, 0.4);
        color: #f1f5f9;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        user-select: none;
        transition: transform 0.15s ease, background 0.15s ease;
      `;
      pill.innerHTML = `<span>🐞</span><span>Agent Trace Log</span>`;
      pill.title = 'Click to download machine-readable flight record (.jsonl) for AI Agent';
      
      pill.onmouseenter = () => { pill.style.transform = 'scale(1.05)'; pill.style.background = 'rgba(28, 32, 48, 0.95)'; };
      pill.onmouseleave = () => { pill.style.transform = 'scale(1.0)'; pill.style.background = 'rgba(18, 20, 29, 0.88)'; };
      
      pill.onclick = () => {
        window.__ARH_FLIGHT_RECORDER__.downloadTrace();
        pill.innerHTML = `<span>✅</span><span>Trace Downloaded</span>`;
        setTimeout(() => {
          pill.innerHTML = `<span>🐞</span><span>Agent Trace Log</span>`;
        }, 2000);
      };

      document.body.appendChild(pill);
    });
  }

  record('RECORDER_BOOT', { surface: getSurfaceName() });
})();
