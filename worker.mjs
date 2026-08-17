/**
 * ARH-MAKAN Cloudflare Worker Static Assets & Realtime Config Router
 * Serves all static assets across customer, kds, pos, admin, and showroom.
 * Automatically injects Tier 3 Firebase RTDB runtime configuration into served HTML pages.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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

