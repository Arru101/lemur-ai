"use client";

import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface AdBannerProps {
  className?: string;
}

/**
 * AdBanner Component
 * Integrates CPM native banner network (invoke.js) cleanly within React 19 / Next.js 16.
 * Supports dismissal (remove) and mount (add) with zero memory leaks.
 */
export default function AdBanner({ className = "" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || dismissed) return;

    // Reset container contents
    el.innerHTML = "";

    // 1. Create the container div with the exact requested ID
    const adContainer = document.createElement("div");
    adContainer.id = "container-3246c4daf5d138c5de64d532a1814e8c";
    adContainer.className = "w-full flex items-center justify-center min-h-[60px]";

    // 2. Create the ad invoke script with exact attributes
    const script = document.createElement("script");
    script.src = "https://pl31713154.profitableratecpmnetwork.com/3246c4daf5d138c5de64d532a1814e8c/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.type = "text/javascript";

    script.onerror = () => {
      if (process.env.NODE_ENV !== "production") {
        console.info("[AdBanner] CPM ad script could not be loaded (likely blocked by AdBlocker or offline).");
      }
    };

    // Append script and target container
    el.appendChild(script);
    el.appendChild(adContainer);

    return () => {
      if (el) {
        el.innerHTML = "";
      }
    };
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div
      className={`w-full max-w-xl mx-auto my-3 px-2 select-none transition-all duration-300 ${className}`}
      aria-label="Sponsored Content"
    >
      <div className="relative rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] p-2.5 sm:p-3 overflow-hidden shadow-sm backdrop-blur-sm group hover:border-black/10 dark:hover:border-white/15 transition-colors">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 font-mono">
              Sponsored
            </span>
            <span className="text-[9px] font-mono text-neutral-400/80 dark:text-neutral-500/80 bg-black/[0.03] dark:bg-white/[0.05] px-1.5 py-0.5 rounded-full border border-black/[0.04] dark:border-white/[0.06]">
              Ad
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Remove ad"
            aria-label="Remove ad"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Ad Placement Host */}
        <div
          ref={containerRef}
          className="w-full min-h-[60px] flex flex-col items-center justify-center overflow-hidden transition-all text-neutral-400 text-xs"
        />
      </div>
    </div>
  );
}
