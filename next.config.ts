import type { NextConfig } from "next";

// Define a strict Content Security Policy (CSP) compatible with Next.js
// Allows Google APIs, OpenRouter connections, CPM ad network, and same-origin PDF/frame viewing in secure environments.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.profitableratecpmnetwork.com https://pl31713154.profitableratecpmnetwork.com;
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' blob: data: https:;
  font-src 'self' data: https:;
  frame-src 'self' blob: https://*.profitableratecpmnetwork.com https:;
  object-src 'self' blob:;
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  connect-src 'self' https://generativelanguage.googleapis.com https://openrouter.ai https://*.profitableratecpmnetwork.com https://pl31713154.profitableratecpmnetwork.com https:;
  block-all-mixed-content;
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
