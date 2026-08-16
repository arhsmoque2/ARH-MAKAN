/**
 * ARH-MAKAN Cloudflare Worker Static Assets Router
 * Directs root traffic to /showroom/ and serves all static assets across customer, kds, pos, admin.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Root path redirects to the interactive showroom
    if (url.pathname === '/' || url.pathname === '') {
      return Response.redirect(`${url.origin}/showroom/index.html`, 302);
    }

    const response = await env.ASSETS.fetch(request);

    // Add security and performance headers
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
