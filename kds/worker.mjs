/**
 * Woodfire KDS Kitchen Display Cloudflare Worker
 * Direct edge router serving the standalone Woodfire Kitchen Display System.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Direct root request to /kds/index.html
    const targetPath = (url.pathname === '/' || url.pathname === '') ? '/kds/index.html' : url.pathname;
    const targetUrl = new URL(targetPath, url.origin);
    const targetRequest = new Request(targetUrl, request);

    const response = await env.ASSETS.fetch(targetRequest);

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
