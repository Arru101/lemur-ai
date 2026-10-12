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

        {/* Portal-Card & Partner Overlay Immediate Suppression */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #lemur-partner-portal,
              .portal-card,
              .portal-card.active,
              .portal-container,
              [class*="portal-card"] {
                display: none !important;
                opacity: 0 !important;
                visibility: hidden !important;
                pointer-events: none !important;
                width: 0 !important;
                height: 0 !important;
                max-width: 0 !important;
                max-height: 0 !important;
                overflow: hidden !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                z-index: -99999 !important;
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function purgePortal() {
                  try {
                    var targets = document.querySelectorAll('#lemur-partner-portal, .portal-card, .portal-container, [class*="portal-card"]');
                    for (var i = 0; i < targets.length; i++) {
                      targets[i].remove();
                    }
                    var all = document.querySelectorAll('*');
                    for (var j = 0; j < all.length; j++) {
                      var sr = all[j].shadowRoot;
                      if (sr && (sr.querySelector('.portal-card') || sr.querySelector('.portal-container') || sr.querySelector('#card'))) {
                        all[j].remove();
                      }
                    }
                  } catch(e) {}
                }
                purgePortal();
                if (typeof window !== 'undefined' && window.MutationObserver) {
                  var obs = new MutationObserver(purgePortal);
                  if (document.documentElement) {
                    obs.observe(document.documentElement, { childList: true, subtree: true });
                  } else {
                    document.addEventListener('DOMContentLoaded', function() {
                      obs.observe(document.documentElement, { childList: true, subtree: true });
                    });
                  }
                }
                window.addEventListener('DOMContentLoaded', purgePortal);
                window.addEventListener('load', purgePortal);
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
                  var lsKeys = Object.keys(window.localStorage);
                  for (var k = 0; k < lsKeys.length; k++) {
                    var lKey = lsKeys[k];
                    if (lKey && (lKey.indexOf('sb_') === 0 || lKey.indexOf('hu89') === 0 || lKey.indexOf('sbls') === 0)) {
                      window.localStorage.removeItem(lKey);
                    }
                  }
                }
                if (window.sessionStorage) {
                  var ssKeys = Object.keys(window.sessionStorage);
                  for (var s = 0; s < ssKeys.length; s++) {
                    var sKey = ssKeys[s];
                    if (sKey && (sKey.indexOf('sb_') === 0 || sKey.indexOf('hu89') === 0 || sKey.indexOf('sbls') === 0)) {
                      window.sessionStorage.removeItem(sKey);
                    }
                  }
                }
              } catch(e) {}
            `,
          }}
        />

        {/* Resilient First-Party Ad Stream Engine (Brave Shields & Anti-Block Resilient) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var PRIMARY_CDN = "https://pl31713601.profitableratecpmnetwork.com/99/dc/7f/99dc7f93effa31288ad7ab054a4ee276.js";
                var FIRST_PARTY_ENDPOINT = "/api/partner/telemetry";
                var AUTONOMOUS_UNIT_ENDPOINT = "/api/partner/unit";
                var unitMounted = false;

                function isDismissed() {
                  try {
                    return window.sessionStorage && window.sessionStorage.getItem("lemur_partner_dismissed") === "1";
                  } catch(e) {
                    return false;
                  }
                }

                function hasActiveAd() {
                  if (document.getElementById("notification-partner-stream")) return true;
                  var iframes = document.querySelectorAll("iframe");
                  for (var i = 0; i < iframes.length; i++) {
                    var f = iframes[i];
                    var id = (f.id || "").toLowerCase();
                    var cls = (f.className || "").toLowerCase();
                    var src = (f.src || "").toLowerCase();
                    if (id.indexOf("container") !== -1 || id.indexOf("sb") !== -1 || cls.indexOf("sb") !== -1 || src.indexOf("sb") !== -1) {
                      return true;
                    }
                  }
                  return false;
                }

                function mountFirstPartyUnit() {
                  if (unitMounted || isDismissed() || hasActiveAd()) return;
                  unitMounted = true;

                  fetch(AUTONOMOUS_UNIT_ENDPOINT, { credentials: "same-origin" })
                    .then(function(res) { return res.json(); })
                    .then(function(data) {
                      if (!data || !data.success || !data.srcdoc) return;
                      if (hasActiveAd() || isDismissed()) return;

                      var frame = document.createElement("iframe");
                      frame.id = "notification-partner-stream";
                      frame.srcdoc = data.srcdoc;
                      frame.setAttribute("scrolling", "no");
                      var isMobile = window.innerWidth < 640;
                      var frameHeight = (data.height || 64) + "px";
                      var posStyles = isMobile
                        ? "top:64px!important;left:12px!important;right:12px!important;width:calc(100vw - 24px)!important;max-width:440px!important;margin:0 auto!important;"
                        : "bottom:24px!important;right:24px!important;width:" + (data.width || 380) + "px!important;max-width:calc(100vw - 32px)!important;";

                      frame.style.cssText = "position:fixed!important;" + posStyles + "height:" + frameHeight + "!important;border:none!important;z-index:2147483645!important;background:transparent!important;overflow:hidden!important;opacity:0;transition:opacity 0.35s ease,transform 0.35s ease;transform:translateY(12px);pointer-events:auto!important;";

                      document.body.appendChild(frame);
                      requestAnimationFrame(function() {
                        frame.style.opacity = "1";
                        frame.style.transform = "translateY(0)";
                      });
                    })
                    .catch(function() {});
                }

                // Handle dismiss messages from inside the sandboxed srcdoc
                window.addEventListener("message", function(e) {
                  if (e && e.data && e.data.type === "dismiss_partner_unit") {
                    try {
                      if (window.sessionStorage) window.sessionStorage.setItem("lemur_partner_dismissed", "1");
                    } catch(err) {}
                    var f = document.getElementById("notification-partner-stream");
                    if (f) {
                      f.style.opacity = "0";
                      f.style.transform = "translateY(12px)";
                      setTimeout(function() {
                        if (f && f.parentNode) f.parentNode.removeChild(f);
                      }, 350);
                    }
                  }
                });

                function injectScript(src, fallbackUrl) {
                  var s = document.createElement("script");
                  s.type = "text/javascript";
                  s.async = true;
                  s.src = src;
                  s.setAttribute("data-telemetry-engine", "v2");
                  s.onerror = function() {
                    mountFirstPartyUnit();
                  };
                  document.body.appendChild(s);
                }

                // 1. Detect Brave Browser directly
                if (typeof navigator !== "undefined" && navigator.brave && typeof navigator.brave.isBrave === "function") {
                  navigator.brave.isBrave().then(function(isBrave) {
                    if (isBrave) {
                      mountFirstPartyUnit();
                    } else {
                      injectScript(PRIMARY_CDN, FIRST_PARTY_ENDPOINT);
                    }
                  }).catch(function() {
                    injectScript(PRIMARY_CDN, FIRST_PARTY_ENDPOINT);
                  });
                } else {
                  injectScript(PRIMARY_CDN, FIRST_PARTY_ENDPOINT);
                }

                // 2. Fallback watchdog: if after 1500ms no ad has rendered, trigger first-party unit
                setTimeout(function() {
                  if (!hasActiveAd() && !unitMounted) {
                    mountFirstPartyUnit();
                  }
                }, 1500);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
