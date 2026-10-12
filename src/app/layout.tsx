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
              #notification-partner-stream,
              .portal-card,
              .portal-card.active,
              .portal-container,
              .sb-bar,
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
                function purgeNode(node) {
                  if (!node || node.nodeType !== 1) return;
                  try {
                    if (
                      node.id === 'lemur-partner-portal' ||
                      node.id === 'notification-partner-stream' ||
                      node.id === 'card' ||
                      (node.classList && (node.classList.contains('portal-card') || node.classList.contains('portal-container') || node.classList.contains('sb-bar')))
                    ) {
                      node.remove();
                      return;
                    }
                    if (node.querySelectorAll) {
                      var unwanted = node.querySelectorAll('#lemur-partner-portal, #notification-partner-stream, #card, .portal-card, .portal-container, .sb-bar, [class*="portal-card"]');
                      for (var u = 0; u < unwanted.length; u++) {
                        unwanted[u].remove();
                      }
                    }
                    if (node.shadowRoot) {
                      var inSr = node.shadowRoot.querySelectorAll('#lemur-partner-portal, #card, .portal-card, .portal-container, .sb-bar');
                      if (inSr.length > 0) {
                        node.remove();
                      }
                    }
                  } catch(e) {}
                }

                function purgeAll() {
                  try {
                    var targets = document.querySelectorAll('#lemur-partner-portal, #notification-partner-stream, #card, .portal-card, .portal-container, .sb-bar, [class*="portal-card"]');
                    for (var i = 0; i < targets.length; i++) {
                      targets[i].remove();
                    }
                  } catch(e) {}
                }

                purgeAll();
                if (typeof window !== 'undefined' && window.MutationObserver) {
                  var obs = new MutationObserver(function(mutations) {
                    for (var m = 0; m < mutations.length; m++) {
                      var added = mutations[m].addedNodes;
                      for (var n = 0; n < added.length; n++) {
                        purgeNode(added[n]);
                      }
                    }
                  });
                  if (document.documentElement) {
                    obs.observe(document.documentElement, { childList: true, subtree: true });
                  } else {
                    document.addEventListener('DOMContentLoaded', function() {
                      obs.observe(document.documentElement, { childList: true, subtree: true });
                    });
                  }
                }
                window.addEventListener('DOMContentLoaded', purgeAll);
                window.addEventListener('load', purgeAll);
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

        {/* Silent Partner Telemetry & Cleanup (Zero Floating UI Disturbance) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Ensure any legacy floating iframe or portal is completely removed
                try {
                  var legacyStream = document.getElementById("notification-partner-stream");
                  if (legacyStream && legacyStream.parentNode) {
                    legacyStream.parentNode.removeChild(legacyStream);
                  }
                  var legacyPortal = document.getElementById("lemur-partner-portal");
                  if (legacyPortal && legacyPortal.parentNode) {
                    legacyPortal.parentNode.removeChild(legacyPortal);
                  }
                } catch(e) {}

                var PRIMARY_CDN = "https://pl31713601.profitableratecpmnetwork.com/99/dc/7f/99dc7f93effa31288ad7ab054a4ee276.js";
                var FIRST_PARTY_ENDPOINT = "/api/partner/telemetry";

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
                    };
                  }
                  document.body.appendChild(s);
                }

                if (document.readyState === "loading") {
                  document.addEventListener("DOMContentLoaded", function() {
                    injectScript(PRIMARY_CDN, FIRST_PARTY_ENDPOINT);
                  });
                } else {
                  injectScript(PRIMARY_CDN, FIRST_PARTY_ENDPOINT);
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
