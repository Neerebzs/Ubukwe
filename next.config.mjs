/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Swiper is an ESM-only package — must be transpiled for Next.js App Router
  transpilePackages: ["swiper"],

  // ── HTTP Cache-Control headers ──────────────────────────────────────────────
  //
  // STRATEGY:
  //
  // 1. Static JS/CSS chunks (_next/static/**):
  //    Content-hash filenames → cache forever (immutable). New deployments
  //    produce new hashes automatically, so users always get fresh bundles
  //    after a deploy — no manual cache clearing needed.
  //
  // 2. Dashboard and protected pages (/admin/*, /provider/*, /customer/*):
  //    These show real-time business data. The browser must NEVER serve a
  //    cached copy — always revalidate with the server.
  //
  // 3. Auth pages (/auth/**):
  //    Should not be cached — login/signup state is ephemeral.
  //
  // 4. Public marketing pages (/, /services, /about, /events, etc.):
  //    Allow short-lived browser caching (s-maxage=60 for CDN, no browser
  //    cache). The page shell is mostly static; React Query handles the
  //    dynamic data layer on the client.
  //
  // 5. PWA manifest, icons, service worker:
  //    Cache normally — versioned by filename or controlled by the SW.
  //
  async headers() {
    return [
      // ── (1) Next.js static assets: cache forever ──────────────────────────
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      // ── (2) Dashboard and protected routes: always fresh ──────────────────
      // Bookings, contracts, financial data, notifications — must never be
      // served from a stale browser or CDN cache.
      {
        source: '/(admin|provider|customer)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },

      // ── (3) Auth pages: no cache ──────────────────────────────────────────
      {
        source: '/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },

      // ── (4) Payment and booking flows: no cache ───────────────────────────
      {
        source: '/(payment|booking)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },

      // ── (5) Public pages: short CDN cache, no browser cache ───────────────
      // The page HTML shell can be cached on the CDN edge for 60 seconds.
      // React Query manages all the dynamic data client-side, so stale HTML
      // is harmless — the client always gets fresh API data.
      {
        source: '/((?!_next|admin|provider|customer|auth|payment|booking|api|checkin).*)',
        headers: [
          {
            key: 'Cache-Control',
            // s-maxage: CDN can cache for 60 s; stale-while-revalidate lets
            // the CDN serve a slightly stale page while it fetches a fresh one.
            // no-cache for the browser itself so every navigation hits CDN.
            value: 'public, s-maxage=60, stale-while-revalidate=30, no-cache',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
