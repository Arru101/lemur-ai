"use client";

import React, { useEffect, useRef } from "react";

interface AdBannerProps {
  className?: string;
}

/**
 * AdBanner Component
 * Integrates CPM native banner network (invoke.js) cleanly within React 19 / Next.js 16.
 * Adheres to strict Content Security Policy (CSP) and responsive mobile-first glassmorphism.
 */
export default function AdBanner({ className = "" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptInjectedRef = useRef<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    // Only execute on client side and if container exists
    if (!container || scriptInjectedRef.current) return;

    const targetDivId = "container-3246c4daf5d138c5de64d532a1814e8c";
    let targetDiv = document.getElementById(targetDivId);

    // If target container isn't already inside our ref, ensure it is created
    if (!targetDiv) {
      targetDiv = document.createElement("div");
      targetDiv.id = targetDivId;
      targetDiv.className = "w-full flex items-center justify-center min-h-[60px]";
      container.appendChild(targetDiv);
    }

    // Create the asynchronous CPM ad invocation script
    const script = document.createElement("script");
    script.src = "https://pl31713154.profitableratecpmnetwork.com/3246c4daf5d138c5de64d532a1814e8c/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.type = "text/javascript";

    script.onerror = () => {
      // Gracefully handle ad-blocker or network unavailability without console crash
      if (process.env.NODE_ENV !== "production") {
        console.info("[AdBanner] CPM ad script could not be loaded (likely blocked by AdBlocker or offline).");
      }
    };

    container.appendChild(script);
    scriptInjectedRef.current = true;

    return () => {
      scriptInjectedRef.current = false;
      if (container) {
        const injected = container.querySelector('script[src*="profitableratecpmnetwork"]');
        if (injected) {
          injected.remove();
        }
      }
    };
  }, []);

  return (
    <div
      className={`w-full max-w-xl mx-auto my-3 px-2 select-none transition-all duration-300 ${className}`}
      aria-label="Sponsored Content"
    >
      <div className="relative rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] p-2.5 sm:p-3 overflow-hidden shadow-sm backdrop-blur-sm group hover:border-black/10 dark:hover:border-white/15 transition-colors">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 font-mono">
            Sponsored
          </span>
          <span className="text-[9px] font-mono text-neutral-400/80 dark:text-neutral-500/80 bg-black/[0.03] dark:bg-white/[0.05] px-1.5 py-0.5 rounded-full border border-black/[0.04] dark:border-white/[0.06]">
            Ad
          </span>
        </div>
        
        {/* Dynamic Ad Placement Container */}
        <div
          ref={containerRef}
          className="w-full min-h-[60px] flex flex-col items-center justify-center overflow-hidden transition-all text-neutral-400 text-xs"
        >
          <div id="container-3246c4daf5d138c5de64d532a1814e8c" className="w-full flex items-center justify-center min-h-[60px]" />
        </div>
      </div>
    </div>
  );
}
