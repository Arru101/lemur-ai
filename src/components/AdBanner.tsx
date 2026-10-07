"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Sparkles } from "lucide-react";

interface AdBannerProps {
  className?: string;
}

/**
 * Premium Minimal AdBanner Component
 * 
 * Embeds ONLY the authorized CPM native banner:
 *   <script async="async" data-cfasync="false" src="https://pl31713154.profitableratecpmnetwork.com/3246c4daf5d138c5de64d532a1814e8c/invoke.js"></script>
 *   <div id="container-3246c4daf5d138c5de64d532a1814e8c"></div>
 * 
 * - Ultra-minimalist liquid glass design matching Lemurs AI dark aesthetic
 * - Zero intrusive pop-up / pop-under disruptions
 * - One-click session dismissal (✕) so it never hinders user experience
 * - Fully isolated DOM lifecycle with automatic cleanup
 */
export default function AdBanner({ className = "" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem("lemur_ad_dismissed") === "1";
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || dismissed) return;

    // Reset container contents to prevent duplicates
    el.innerHTML = "";

    // 1. Create the container element with the exact required zone ID
    const adContainer = document.createElement("div");
    adContainer.id = "container-3246c4daf5d138c5de64d532a1814e8c";
    adContainer.className = "w-full flex items-center justify-center min-h-[50px] overflow-hidden";

    // 2. Create the ad invocation script with exact specified attributes
    const script = document.createElement("script");
    script.src = "https://pl31713154.profitableratecpmnetwork.com/3246c4daf5d138c5de64d532a1814e8c/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.type = "text/javascript";

    script.onerror = () => {
      if (process.env.NODE_ENV !== "production") {
        console.info("[AdBanner] CPM banner could not be reached (AdBlocker or offline).");
      }
    };

    // Append script then container
    el.appendChild(script);
    el.appendChild(adContainer);

    return () => {
      if (el) {
        el.innerHTML = "";
      }
    };
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("lemur_ad_dismissed", "1");
    } catch {
      // Storage unavailable or restricted
    }
  };

  if (dismissed) return null;

  return (
    <div
      className={`w-full max-w-xl mx-auto my-2.5 px-2 select-none msg-enter transition-all duration-300 ${className}`}
      aria-label="Sponsored Content"
    >
      <div className="relative rounded-2xl bg-black/[0.02] dark:bg-white/[0.025] hover:dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] hover:dark:border-white/15 p-2 sm:p-2.5 shadow-sm backdrop-blur-md transition-all">
        {/* Minimal Header */}
        <div className="flex items-center justify-between mb-1 px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-2.5 h-2.5 text-indigo-400 opacity-70" />
            <span className="text-[9.5px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 font-mono">
              Sponsored
            </span>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Dismiss ad for this session"
            aria-label="Dismiss ad"
          >
            <X className="w-3 h-3 stroke-[2]" />
          </button>
        </div>

        {/* Dynamic Ad Placement Container */}
        <div
          ref={containerRef}
          className="w-full min-h-[50px] flex flex-col items-center justify-center overflow-hidden transition-all text-neutral-400 text-xs"
        />
      </div>
    </div>
  );
}
