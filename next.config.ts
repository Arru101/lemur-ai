import type { NextConfig } from "next";

// Define a strict Content Security Policy (CSP) compatible with Next.js
// Allows Google APIs, OpenRouter connections, CPM ad network, and same-origin PDF/frame viewing in secure environments.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: https: http:;
  script-src-elem 'self' 'unsafe-inline' blob: data: https: http:;
  style-src 'self' 'unsafe-inline' https: http:;
  img-src 'self' blob: data: https: http:;
  font-src 'self' data: https: http:;
  frame-src 'self' blob: data: https: http:;
  worker-src 'self' blob: data: https: http:;
  child-src 'self' blob: data: https: http:;
  media-src 'self' blob: data: https: http:;
  object-src 'self' blob:;
  base-uri 'self';
  form-action 'self' https: http:;
  frame-ancestors 'self';
  connect-src 'self' https://generativelanguage.googleapis.com https://openrouter.ai blob: data: wss: ws: https: http:;
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, " ").trim();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
