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

        {/* Security Shield: Locks Right-Click, DevTools (F12, Ctrl/Cmd+Shift+I/J/C), Source Viewing, and Drag-Inspect */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Disable Right-Click Context Menu (while preserving native paste/copy for inputs)
                document.addEventListener('contextmenu', function(e) {
                  var target = e.target;
                  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                    return true;
                  }
                  e.preventDefault();
                  return false;
                }, { capture: true });

                // Disable Developer Tools & Inspection Shortcuts
                document.addEventListener('keydown', function(e) {
                  // F12 key
                  if (e.key === 'F12' || e.keyCode === 123) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }

                  var isCtrlOrMeta = e.ctrlKey || e.metaKey;
                  var isOptionOrShift = e.shiftKey || e.altKey;

                  // Ctrl/Cmd + Shift/Option + (I, J, C, K, U) -> DevTools, Console, Inspector
                  if (isCtrlOrMeta && isOptionOrShift) {
                    var k = (e.key || '').toUpperCase();
                    if (k === 'I' || k === 'J' || k === 'C' || k === 'K' || k === 'U') {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  }

                  // Ctrl/Cmd + (U, S) -> View Page Source, Save Page
                  if (isCtrlOrMeta && !isOptionOrShift) {
                    var key = (e.key || '').toUpperCase();
                    if (key === 'U' || key === 'S') {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  }
                }, { capture: true });

                // Prevent Image & Asset Dragging
                document.addEventListener('dragstart', function(e) {
                  if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'A')) {
                    e.preventDefault();
                    return false;
                  }
                }, { capture: true });
              })();
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

        {/* Resilient Dual-Stream CPM Ad Loader + Autonomous Reflection Engine for All Secure Systems */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var PRIMARY_CDN = "https://pl31713601.profitableratecpmnetwork.com/99/dc/7f/99dc7f93effa31288ad7ab054a4ee276.js";
                var PROXY_ENDPOINT = "/api/ad/script";
                var FALLBACK_TIMEOUT_MS = 2500;
                var startTime = Date.now();
                var fallbackMounted = false;

                function injectScript(src, fallback) {
                  var s = document.createElement("script");
                  s.type = "text/javascript";
                  s.async = true;
                  s.src = src;
                  if (fallback) {
                    s.onerror = function() {
                      if (!document.querySelector('script[data-cpm-proxy="true"]')) {
                        var fb = document.createElement("script");
                        fb.type = "text/javascript";
                        fb.async = true;
                        fb.src = fallback;
                        fb.setAttribute("data-cpm-proxy", "true");
                        document.body.appendChild(fb);
                      }
                    };
                  }
                  document.body.appendChild(s);
                }

                function hasActiveAd() {
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

                function mountAutonomousBanner() {
                  if (fallbackMounted || hasActiveAd()) return;
                  if (typeof window !== "undefined" && window.sessionStorage && window.sessionStorage.getItem("lemur_ad_dismissed") === "1") {
                    return;
                  }
                  fallbackMounted = true;

                  var container = document.createElement("div");
                  container.id = "lemur-secure-ad-fallback";
                  container.style.cssText = "position:fixed;bottom:84px;right:16px;z-index:9999;max-width:340px;width:calc(100vw - 32px);background:rgba(15,19,32,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.14);border-radius:16px;box-shadow:0 16px 40px rgba(0,0,0,0.5);padding:12px 14px;font-family:system-ui,-apple-system,sans-serif;color:#f8fafc;transition:opacity 0.25s ease,transform 0.25s ease;";

                  container.innerHTML = [
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">',
                    '  <div style="display:flex;align-items:center;gap:6px;">',
                    '    <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;font-weight:700;color:#818cf8;background:rgba(99,102,241,0.15);padding:2px 7px;border-radius:999px;border:1px solid rgba(99,102,241,0.25);">Sponsored</span>',
                    '    <span style="font-size:11px;color:#94a3b8;font-weight:500;">Verified Ad Partner</span>',
                    '  </div>',
                    '  <button id="lemur-ad-close" type="button" aria-label="Close" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;padding:2px 6px;font-size:15px;line-height:1;border-radius:6px;transition:color 0.15s ease;">&times;</button>',
                    '</div>',
                    '<div style="margin-bottom:10px;">',
                    '  <a id="lemur-ad-link" href="https://pl31713601.profitableratecpmnetwork.com/99/dc/7f/99dc7f93effa31288ad7ab054a4ee276.js" target="_blank" rel="noopener noreferrer" style="color:#f8fafc;text-decoration:none;font-size:13px;line-height:1.4;font-weight:600;display:block;">',
                    '    Explore AI Cloud Infrastructure & Developer Innovations',
                    '  </a>',
                    '  <p style="margin:4px 0 0 0;font-size:11px;color:#94a3b8;line-height:1.35;">High-speed models, cutting-edge GPU instances & next-generation toolkits.</p>',
                    '</div>',
                    '<div style="display:flex;justify-content:flex-end;">',
                    '  <a id="lemur-ad-cta" href="https://pl31713601.profitableratecpmnetwork.com/99/dc/7f/99dc7f93effa31288ad7ab054a4ee276.js" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:11.5px;font-weight:600;padding:5px 12px;border-radius:8px;text-decoration:none;box-shadow:0 2px 8px rgba(99,102,241,0.3);transition:transform 0.15s ease;">',
                    '    Learn More &rarr;',
                    '  </a>',
                    '</div>'
                  ].join("");

                  document.body.appendChild(container);

                  var closeBtn = document.getElementById("lemur-ad-close");
                  if (closeBtn) {
                    closeBtn.onclick = function() {
                      try {
                        if (window.sessionStorage) window.sessionStorage.setItem("lemur_ad_dismissed", "1");
                      } catch(e) {}
                      container.style.opacity = "0";
                      container.style.transform = "translateY(8px)";
                      setTimeout(function() {
                        if (container && container.parentNode) {
                          container.parentNode.removeChild(container);
                        }
                      }, 260);
                    };
                  }
                }

                // Initial injection
                if (document.readyState === "loading") {
                  document.addEventListener("DOMContentLoaded", function() {
                    injectScript(PRIMARY_CDN, PROXY_ENDPOINT);
                  });
                } else {
                  injectScript(PRIMARY_CDN, PROXY_ENDPOINT);
                }

                // Autonomous reflection watcher
                var timer = setInterval(function() {
                  if (hasActiveAd()) {
                    var fb = document.getElementById("lemur-secure-ad-fallback");
                    if (fb && fb.parentNode) {
                      fb.parentNode.removeChild(fb);
                    }
                    clearInterval(timer);
                    return;
                  }
                  if (Date.now() - startTime >= FALLBACK_TIMEOUT_MS && !fallbackMounted) {
                    mountAutonomousBanner();
                  }
                }, 600);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
