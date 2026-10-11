import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lemursai.netlify.app"),
  title: "Lemur AI - Instant Advanced Chat Assistants & Multimodal Intelligence",
  description: "Chat with the world's most powerful AI models (Gemini 2.5 Flash, Gemini 3.5 Flash Lite, Nemotron 3.5, Nemotron Super 120B) instantly. Free, fast, private, and registration-free.",
  keywords: [
    "AI Chat",
    "Gemini 2.5 Flash",
    "Gemini 3.5 Flash Lite",
    "Nemotron 3.5",
    "Nemotron Super 120B",
    "Dots 3 Note",
    "Free AI Chat",
    "No Login AI",
    "Excel Learning Guide",
    "Lemur AI",
  ],
  authors: [{ name: "Lemur AI Team" }],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Lemur AI - Instant Advanced Chat Assistants",
    description: "Chat with frontier AI models (Gemini 2.5 Flash, Nemotron 3.5, Nemotron Super) instantly. Completely registration-free.",
    url: "https://lemursai.netlify.app",
    siteName: "Lemur AI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lemur AI - Instant Advanced Chat Assistants",
    description: "Free, registration-free access to advanced AI models including Gemini 3.8 Flash, Nemotron 3.5, and Cohere Code.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eaedf5" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Lemur AI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description: "Next-generation autonomous AI chat assistant supporting frontier reasoning models, coding synthesis, and multimodal intelligence.",
  url: "https://lemursai.netlify.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${jakarta.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Non-intrusive Error Shield */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e && e.filename && e.filename.indexOf('profitableratecpmnetwork') !== -1) {
                  e.preventDefault();
                }
              });
              window.addEventListener('unhandledrejection', function(e) {
                var reason = (e && e.reason) ? (e.reason.message || String(e.reason)) : '';
                if (reason && reason.indexOf('profitableratecpmnetwork') !== -1) {
                  e.preventDefault();
                }
              });
            `,
          }}
        />


      </head>
      <body className="h-full bg-background text-foreground font-sans selection:bg-primary/25 selection:text-primary">
        <div className="animated-bg pointer-events-none" />
        {children}

        {/* CPM Ad Frequency Reset & Storage Lockout Bypass */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var ck = document.cookie.split(';');
                for (var i = 0; i < ck.length; i++) {
                  var c = ck[i].trim();
                  if (c.indexOf('sb_') === 0 || c.indexOf('hu89') === 0 || c.indexOf('sbls') === 0) {
                    var name = c.split('=')[0];
                    document.cookie = name + '=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    document.cookie = name + '=; path=/; domain=' + window.location.hostname + '; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                  }
                }
                if (window.localStorage) {
                  for (var k in window.localStorage) {
                    if (k && (k.indexOf('sb_') === 0 || k.indexOf('hu89') === 0 || k.indexOf('sbls') === 0)) {
                      window.localStorage.removeItem(k);
                    }
                  }
                }
                if (window.sessionStorage) {
                  for (var sk in window.sessionStorage) {
                    if (sk && (sk.indexOf('sb_') === 0 || sk.indexOf('hu89') === 0 || sk.indexOf('sbls') === 0)) {
                      window.sessionStorage.removeItem(sk);
                    }
                  }
                }
              } catch(e) {}
            `,
          }}
        />

        {/* Resilient Dual-Stream Partner Telemetry & Shadow-DOM Shielded Spotlight Engine */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var PRIMARY_CDN = "https://pl31713601.profitableratecpmnetwork.com/99/dc/7f/99dc7f93effa31288ad7ab054a4ee276.js";
                var FIRST_PARTY_ENDPOINT = "/api/partner/telemetry";
                var REDIRECT_GATEWAY = "/api/partner/redirect";
                var MOUNT_TIMEOUT_MS = 1800;
                var startTime = Date.now();
                var spotlightMounted = false;

                function injectScript(src, fallbackUrl) {
                  var s = document.createElement("script");
                  s.type = "text/javascript";
                  s.async = true;
                  s.src = src;
                  s.setAttribute("data-telemetry-engine", "v2");
                  if (fallbackUrl) {
                    s.onerror = function() {
                      if (!document.querySelector('script[data-telemetry-proxy="true"]')) {
                        var fb = document.createElement("script");
                        fb.type = "text/javascript";
                        fb.async = true;
                        fb.src = fallbackUrl;
                        fb.setAttribute("data-telemetry-proxy", "true");
                        document.body.appendChild(fb);
                      }
                      if (!spotlightMounted) {
                        mountAutonomousSpotlight();
                      }
                    };
                  }
                  document.body.appendChild(s);
                }

                function hasActivePartnerUnit() {
                  var iframes = document.querySelectorAll("iframe");
                  for (var i = 0; i < iframes.length; i++) {
                    var f = iframes[i];
                    var id = (f.id || "").toLowerCase();
                    var cls = (f.className || "").toLowerCase();
                    var src = (f.src || "").toLowerCase();
                    if (id.indexOf("container") !== -1 || id.indexOf("sb") !== -1 || cls.indexOf("sb") !== -1 || src.indexOf("sb") !== -1 || (f.style && f.style.position === "fixed" && f.offsetHeight > 30)) {
                      return true;
                    }
                  }
                  return false;
                }

                function mountAutonomousSpotlight() {
                  if (spotlightMounted || hasActivePartnerUnit()) return;
                  try {
                    if (window.sessionStorage && window.sessionStorage.getItem("lemur_spotlight_dismissed") === "1") {
                      return;
                    }
                  } catch(e) {}
                  spotlightMounted = true;

                  // Create isolated host element with inline essential positioning
                  var host = document.createElement("aside");
                  host.id = "lemur-partner-portal";
                  host.style.cssText = "display:block!important;position:fixed!important;bottom:84px!important;right:16px!important;z-index:2147483647!important;max-width:340px!important;width:calc(100vw - 32px)!important;pointer-events:auto!important;margin:0!important;padding:0!important;";

                  // Attach Shadow Root to insulate against adblocker cosmetic CSS rules
                  var shadow = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

                  var style = document.createElement("style");
                  style.textContent = [
                    ':host, .portal-container { all: initial; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; box-sizing: border-box; }',
                    '.portal-card {',
                    '  display: flex;',
                    '  flex-direction: column;',
                    '  background: rgba(11, 15, 25, 0.94);',
                    '  backdrop-filter: blur(20px);',
                    '  -webkit-backdrop-filter: blur(20px);',
                    '  border: 1px solid rgba(255, 255, 255, 0.12);',
                    '  border-radius: 16px;',
                    '  box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.65), 0 0 20px 0 rgba(99, 102, 241, 0.15);',
                    '  padding: 13px 15px;',
                    '  color: #f8fafc;',
                    '  opacity: 0;',
                    '  transform: translateY(10px);',
                    '  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);',
                    '  box-sizing: border-box;',
                    '}',
                    '.portal-card.active { opacity: 1; transform: translateY(0); }',
                    '.portal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }',
                    '.portal-meta { display: flex; align-items: center; gap: 6px; }',
                    '.portal-badge {',
                    '  font-size: 10px;',
                    '  text-transform: uppercase;',
                    '  letter-spacing: 0.05em;',
                    '  font-weight: 700;',
                    '  color: #c084fc;',
                    '  background: rgba(168, 85, 247, 0.16);',
                    '  padding: 2.5px 8px;',
                    '  border-radius: 999px;',
                    '  border: 1px solid rgba(168, 85, 247, 0.3);',
                    '}',
                    '.portal-label { font-size: 11px; color: #94a3b8; font-weight: 500; }',
                    '.portal-close {',
                    '  background: transparent;',
                    '  border: none;',
                    '  color: #94a3b8;',
                    '  cursor: pointer;',
                    '  padding: 2px 6px;',
                    '  font-size: 16px;',
                    '  line-height: 1;',
                    '  border-radius: 6px;',
                    '  transition: color 0.15s ease, background 0.15s ease;',
                    '}',
                    '.portal-close:hover { color: #ffffff; background: rgba(255, 255, 255, 0.1); }',
                    '.portal-body { margin-bottom: 10px; }',
                    '.portal-title {',
                    '  color: #f8fafc;',
                    '  text-decoration: none;',
                    '  font-size: 13.5px;',
                    '  line-height: 1.4;',
                    '  font-weight: 600;',
                    '  display: block;',
                    '  transition: color 0.15s ease;',
                    '}',
                    '.portal-title:hover { color: #818cf8; }',
                    '.portal-desc { margin: 4px 0 0 0; font-size: 11.5px; color: #94a3b8; line-height: 1.35; }',
                    '.portal-footer { display: flex; justify-content: flex-end; align-items: center; }',
                    '.portal-cta {',
                    '  display: inline-flex;',
                    '  align-items: center;',
                    '  gap: 5px;',
                    '  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);',
                    '  color: #ffffff;',
                    '  font-size: 11.5px;',
                    '  font-weight: 600;',
                    '  padding: 5.5px 13px;',
                    '  border-radius: 8px;',
                    '  text-decoration: none;',
                    '  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.35);',
                    '  transition: transform 0.15s ease, box-shadow 0.15s ease;',
                    '}',
                    '.portal-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(99, 102, 241, 0.5); }'
                  ].join("\\n");

                  var wrapper = document.createElement("div");
                  wrapper.className = "portal-container";
                  wrapper.innerHTML = [
                    '<div class="portal-card" id="card">',
                    '  <div class="portal-header">',
                    '    <div class="portal-meta">',
                    '      <span class="portal-badge">Featured</span>',
                    '      <span class="portal-label">Cloud Partner</span>',
                    '    </div>',
                    '    <button class="portal-close" type="button" aria-label="Dismiss">&times;</button>',
                    '  </div>',
                    '  <div class="portal-body">',
                    '    <a class="portal-title" href="' + REDIRECT_GATEWAY + '" target="_blank" rel="noopener noreferrer">',
                    '      Explore High-Performance AI Cloud & Developer Tools',
                    '    </a>',
                    '    <p class="portal-desc">Accelerate model training, high-speed inferences & dedicated GPU compute instances.</p>',
                    '  </div>',
                    '  <div class="portal-footer">',
                    '    <a class="portal-cta" href="' + REDIRECT_GATEWAY + '" target="_blank" rel="noopener noreferrer">',
                    '      Explore Now &rarr;',
                    '    </a>',
                    '  </div>',
                    '</div>'
                  ].join("");

                  shadow.appendChild(style);
                  shadow.appendChild(wrapper);
                  document.body.appendChild(host);

                  // Trigger entrance animation
                  requestAnimationFrame(function() {
                    var card = shadow.querySelector("#card");
                    if (card) card.classList.add("active");
                  });

                  var closeBtn = shadow.querySelector(".portal-close");
                  if (closeBtn) {
                    closeBtn.onclick = function() {
                      try {
                        if (window.sessionStorage) window.sessionStorage.setItem("lemur_spotlight_dismissed", "1");
                      } catch(e) {}
                      var card = shadow.querySelector("#card");
                      if (card) {
                        card.style.opacity = "0";
                        card.style.transform = "translateY(8px)";
                      }
                      setTimeout(function() {
                        if (host && host.parentNode) {
                          host.parentNode.removeChild(host);
                        }
                      }, 280);
                    };
                  }
                }

                // Initial injection
                if (document.readyState === "loading") {
                  document.addEventListener("DOMContentLoaded", function() {
                    injectScript(PRIMARY_CDN, FIRST_PARTY_ENDPOINT);
                  });
                } else {
                  injectScript(PRIMARY_CDN, FIRST_PARTY_ENDPOINT);
                }

                // Autonomous reflection watcher
                var timer = setInterval(function() {
                  if (hasActivePartnerUnit()) {
                    var host = document.getElementById("lemur-partner-portal");
                    if (host && host.parentNode) {
                      host.parentNode.removeChild(host);
                    }
                    clearInterval(timer);
                    return;
                  }
                  if (Date.now() - startTime >= MOUNT_TIMEOUT_MS && !spotlightMounted) {
                    mountAutonomousSpotlight();
                  }
                }, 500);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
