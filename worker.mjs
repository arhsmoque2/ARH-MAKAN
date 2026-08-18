/**
 * ARH-MAKAN Cloudflare Worker Static Assets & Realtime Config Router
 * Serves all static assets across customer, kds, pos, admin, and showroom.
 * Automatically injects Tier 3 Firebase RTDB runtime configuration into served HTML pages.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Cloudflare Zero Trust Access Gate (for testing phase protection)
    const isZeroTrustEnforced = env?.ZERO_TRUST_ENFORCED === 'true';
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

    if (isZeroTrustEnforced && !isLocalhost) {
      const authEmail = request.headers.get('cf-access-authenticated-user-email') ||
                        request.headers.get('Cf-Access-Authenticated-User-Email') || '';
      
      const allowedEmails = (env.ALLOWED_TEST_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);

      const isAllowed = allowedEmails.length === 0 || allowedEmails.includes(authEmail.toLowerCase());

      if (!authEmail || !isAllowed) {
        return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>403 Forbidden · Cloudflare Zero Trust Access Required</title>
  <style>
    body { background: #0c0a08; color: #F7F1E6; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #14100c; border: 1px solid rgba(212, 160, 23, 0.3); border-radius: 16px; padding: 40px; text-align: center; max-width: 480px; box-shadow: 0 16px 40px rgba(0,0,0,0.8); }
    h1 { color: #F3CA65; font-size: 1.5rem; margin-bottom: 12px; }
    p { color: #B8A996; font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px; }
    .badge { display: inline-block; padding: 4px 12px; background: rgba(231, 76, 60, 0.15); border: 1px solid #E74C3C; color: #E74C3C; border-radius: 999px; font-size: 0.75rem; font-weight: bold; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 2.5rem; margin-bottom: 8px;">🔒</div>
    <div class="badge">TESTING PHASE · ACCESS RESTRICTED</div>
    <h1>Cloudflare Zero Trust Access Required</h1>
    <p>This deployment of <strong>ARH-MAKAN</strong> is currently in restricted testing mode. Access is only permitted for authenticated Cloudflare Zero Trust testing accounts.</p>
    <div style="font-size: 0.78rem; color: #7A6F62;">Woodfire Kulim OS · Cloudflare Edge Zero Trust Gate</div>
  </div>
</body>
</html>`, {
          status: 403,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store'
          }
        });
      }
    }

    // Dynamic runtime config endpoint
    if (url.pathname === '/api/config') {
      const dbUrl = env.FIREBASE_DATABASE_URL || null;
      return new Response(JSON.stringify({
        firebase: dbUrl ? {
          url: dbUrl,
          root: 'woodfire_kulim'
        } : null
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Direct root request to index.html
    const targetRequest = (url.pathname === '/' || url.pathname === '')
      ? new Request(`${url.origin}/index.html`, request)
      : request;

    const response = await env.ASSETS.fetch(targetRequest);
    const contentType = response.headers.get('Content-Type') || '';

    // If serving HTML and cloud DB is configured, inject runtime window.ARH_REALTIME_CONFIG into <head>
    const isHtml = contentType.includes('text/html') ||
      url.pathname === '/' ||
      url.pathname === '' ||
      url.pathname.endsWith('.html') ||
      url.pathname.endsWith('/');

    const dbUrl = env.FIREBASE_DATABASE_URL || null;

    if (isHtml && dbUrl && typeof HTMLRewriter !== 'undefined') {
      const configScript = `<script>window.ARH_REALTIME_CONFIG = { url: ${JSON.stringify(dbUrl)}, root: "woodfire_kulim" };</script>`;
      
      const transformed = new HTMLRewriter()
        .on('head', {
          element(el) {
            el.append(configScript, { html: true });
          }
        })
        .transform(response);

      transformed.headers.set('X-Content-Type-Options', 'nosniff');
      transformed.headers.set('X-Frame-Options', 'SAMEORIGIN');
      transformed.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      return transformed;
    }

    // Default static response
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('X-Frame-Options', 'SAMEORIGIN');
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};

