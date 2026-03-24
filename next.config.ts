import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// Directives are intentionally split onto separate lines for readability and
// easy extension when additional third-party integrations are added.
//
// Note on 'unsafe-inline' in script-src: Next.js App Router injects inline
// bootstrap scripts that cannot be nonce-gated without a custom middleware
// layer. 'unsafe-inline' still provides meaningful protection here because
// all other directives (object-src, base-uri, form-action) remain strict, and
// external scripts from unlisted hosts are still blocked regardless.
const CONTENT_SECURITY_POLICY = `
  default-src 'self';
  script-src
    'self'
    'unsafe-inline'
    https://www.googletagmanager.com
    https://pagead2.googlesyndication.com;
  style-src
    'self'
    'unsafe-inline';
  img-src
    'self'
    data:
    https:;
  font-src
    'self';
  connect-src
    'self'
    https://www.google-analytics.com
    https://analytics.google.com
    https://www.googletagmanager.com
    https://pagead2.googlesyndication.com
    https://googleads.g.doubleclick.net;
  frame-src
    https://googleads.g.doubleclick.net
    https://tpc.googlesyndication.com;
  object-src 'none';
  base-uri   'self';
  form-action 'self';
`
  .replace(/\s+/g, " ")
  .trim();

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  // Prevent the page from being embedded in an iframe on other domains
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Block MIME-type sniffing (already set on API routes; add globally here)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send origin only for same-origin requests; no referrer for cross-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features that this app does not use
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

export default function createNextConfig(phase: string): NextConfig {
  return {
    reactStrictMode: true,
    // Isolate dev artifacts from production build artifacts to avoid chunk mismatch
    // errors when switching between `next dev` and `next build`/`next start`.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: SECURITY_HEADERS,
        },
      ];
    },
  };
}
