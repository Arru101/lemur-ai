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
        {/* Defensive Error Shield: Guarantees ad blocking on secure systems/firewalls never halts web app */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.filename && (e.filename.includes('profitableratecpmnetwork') || e.filename.includes('exemplarfederallithe') || e.filename.includes('fizzyacerbitymellow') || e.filename.includes('protrafficinspector'))) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                  return true;
                }
              }, true);
              window.addEventListener('unhandledrejection', function(e) {
                var reason = (e && e.reason) ? (e.reason.message || String(e.reason)) : '';
                if (reason && (reason.includes('profitableratecpmnetwork') || reason.includes('exemplarfederallithe') || reason.includes('fizzy'))) {
                  e.preventDefault();
                }
              });
            `,
          }}
        />
        <script async src="https://pl31713601.profitableratecpmnetwork.com/99/dc/7f/99dc7f93effa31288ad7ab054a4ee276.js" />
      </head>
      <body className="h-full bg-background text-foreground font-sans selection:bg-primary/25 selection:text-primary">
        <div className="animated-bg pointer-events-none" />
        {children}
      </body>
    </html>
  );
}
