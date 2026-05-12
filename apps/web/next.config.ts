import type { NextConfig } from "next";
import path from "node:path";

/**
 * HTTP security headers applied to every response.
 *
 * CSP notes:
 *  - 'unsafe-inline' in script-src is required because Next.js App Router
 *    emits inline RSC payload scripts (__next_f). A nonce-based approach via
 *    middleware would harden this further but is out of scope here.
 *  - 'unsafe-inline' in style-src is required by Recharts (inline SVG styles)
 *    and Radix UI (CSS custom-property overrides).
 *  - Google Fonts (Plus Jakarta Sans) are self-hosted by next/font, so no
 *    external font origin is needed.
 *  - Stripe Checkout / Billing Portal are full-page redirects
 *    (window.location.href), not iframes or fetch calls, so no extra CSP
 *    allowances are required beyond form-action 'self'.
 */
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  // 'unsafe-eval' is required in dev for webpack HMR / React Refresh.
  // googletagmanager.com is required by @next/third-parties/google (GA4 script loader).
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // google-analytics.com covers GA4 img-beacon fallback.
  "img-src 'self' data: blob: https://www.google-analytics.com",
  "font-src 'self'",
  // GA4 sends measurement data via fetch/XHR to these endpoints.
  // api.stripe.com is included for any future client-side Stripe calls.
  // In dev, webpack HMR uses WebSocket connections.
  `connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://api.stripe.com${isDev ? " ws://localhost:* ws://127.0.0.1:*" : ""}`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Remove the X-Powered-By: Next.js header to avoid stack fingerprinting.
  poweredByHeader: false,
  // Bundles the server + all traced deps into .next/standalone for Docker.
  output: "standalone",
  // Trace from the monorepo root so shared packages (packages/*) are included.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // In Next.js 16, Turbopack is the default bundler. Config must be top-level,
  // NOT under `experimental.turbo` (which is deprecated and silently ignored).
  turbopack: {
    // The monorepo root node_modules hoists tailwindcss@3 (from NativeWind/mobile).
    // Force Turbopack's CSS resolver to use the local tailwindcss@4 installation
    // inside apps/web/node_modules so `@import "tailwindcss"` resolves correctly.
    resolveAlias: {
      tailwindcss: path.resolve(__dirname, "node_modules/tailwindcss"),
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
