import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { SITE_URL } from "@/lib/site";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  // Serwist only hooks into Webpack's `webpack()` config function — it's a
  // silent no-op under Turbopack (see next.config's build script, which was
  // switched off `--turbopack` for this reason). Disabling in development
  // regardless keeps local iteration fast and avoids stale-cache/HMR
  // conflicts; there's no offline-caching value while developing anyway.
  disable: process.env.NODE_ENV === "development",
});

// The Supabase project origin, derived from the same env var the browser
// client (lib/supabase/browser.ts, used by the admin login form) already
// uses — so CSP's connect-src always matches whatever project this app is
// actually pointed at, instead of a hardcoded value going stale later.
const SUPABASE_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").origin;
  } catch {
    return "https://*.supabase.co";
  }
})();

/**
 * Content-Security-Policy — enumerated from every external resource this
 * app actually loads client-side (verified against the code, not guessed):
 *   - Google Maps embed iframe (components/googlemap.tsx)
 *   - Elfsight's Instagram widget (components/InstagramReels.tsx)
 *   - Vercel Analytics / Speed Insights (same-origin `/_vercel/...` in
 *     production; an external va.vercel-scripts.com URL only in dev)
 *   - the Supabase project itself (admin login's browser-side auth call)
 *   - the three image hosts already declared in `images.remotePatterns`
 *
 * `script-src` keeps `'unsafe-inline'` rather than a nonce pipeline — the
 * actual injection vector on this site (raw WordPress HTML rendered via
 * dangerouslySetInnerHTML) is closed at the source with DOMPurify
 * (lib/sanitize-html.ts), which is the fix that matters. A nonce-based CSP
 * would remove this too, but needs per-request nonce plumbing through every
 * Server *and* Client Component that renders a `<script>` tag (JSON-LD is
 * emitted from 5 different files, one of them a Client Component) — real
 * scope for a follow-up, not bundled in here. `'unsafe-inline'` still blocks
 * the far more common attack of loading an attacker-hosted external script.
 *
 * Only applied in production — Turbopack's dev server (HMR, Fast Refresh)
 * needs `'unsafe-eval'` and a dev-only WebSocket connection that a
 * production-grade CSP would otherwise block, breaking local iteration.
 */
function buildCsp(): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' https://elfsightcdn.com https://*.elfsight.com https://va.vercel-scripts.com https://widgets.sociablekit.com https://*.sociablekit.com`,
    `style-src 'self' 'unsafe-inline' https://widgets.sociablekit.com https://*.sociablekit.com https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https://darkgrey-pelican-916395.hostingersite.com https://secure.gravatar.com https://api.dicebear.com https://*.elfsight.com https://*.elfsightcdn.com https://*.googleusercontent.com https://*.sociablekit.com https://lh3.googleusercontent.com https://maps.gstatic.com`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `connect-src 'self' ${SUPABASE_ORIGIN} https://*.elfsight.com https://*.elfsightcdn.com https://vitals.vercel-insights.com https://*.sociablekit.com https://widgets.sociablekit.com`,
    `frame-src 'self' https://www.google.com https://*.elfsight.com https://widgets.sociablekit.com https://*.sociablekit.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "darkgrey-pelican-916395.hostingersite.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    const securityHeaders = [
      // MIME-sniffing off — a response served as text/plain can never get
      // reinterpreted as HTML/JS by the browser.
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Belt-and-braces alongside CSP's frame-ancestors below — older
      // browsers that don't understand frame-ancestors still respect this.
      { key: "X-Frame-Options", value: "DENY" },
      // Full URL sent to same-origin links, only the origin to cross-origin
      // ones — balances analytics/referral usefulness against leaking
      // lead/client detail-page URLs to third parties (e.g. the Google Maps
      // iframe, external links in blog content).
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Locks off browser APIs this app never uses.
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
      },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      // 2 years + preload — Vercel always serves over HTTPS, so this is
      // free; `preload` needs a one-time submission to hstspreload.org to
      // take effect ahead of a browser's first-ever visit (optional, safe
      // to leave in either way).
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    ];

    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({ key: "Content-Security-Policy", value: buildCsp() });
    }

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // The project's Vercel-assigned preview/production domain — send
      // anyone who still has it bookmarked/indexed to the real domain.
      // (bshsolutionss.com → bshsolutions.net is already handled as a
      // 308 at the Vercel domain level, outside this app.)
      {
        source: "/:path*",
        has: [{ type: "host", value: "bshservices-xi.vercel.app" }],
        destination: `${SITE_URL}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default withSerwist(nextConfig);
