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
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
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
  // Bundles the server + all traced deps into .next/standalone for Docker.
  output: "standalone",
  // Trace from the monorepo root so shared packages (packages/*) are included.
  outputFileTracingRoot: path.join(__dirname, "../../"),
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
