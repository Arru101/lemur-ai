import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lemur AI - Instant Advanced Chat Assistants",
  description: "Chat with the world's most powerful AI models (Gemini, Llama, DeepSeek, Qwen) instantly. No registration, no login, completely free.",
  keywords: ["AI Chat", "Gemini Free", "DeepSeek", "Llama 3", "Qwen Coder", "Free AI", "No Login AI", "Lemur AI"],
  authors: [{ name: "Lemur AI Team" }],
  openGraph: {
    title: "Lemur AI - Instant Advanced Chat Assistants",
    description: "Chat with the world's most powerful AI models instantly, completely registration-free.",
    type: "website",
    siteName: "Lemur AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lemur AI - Instant Advanced Chat Assistants",
    description: "Free, registration-free access to advanced AI models including Gemini, DeepSeek, and Llama.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#020205",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full bg-background text-foreground selection:bg-primary/30 selection:text-white">
        <div className="animated-bg" />
        {children}
      </body>
    </html>
  );
}
