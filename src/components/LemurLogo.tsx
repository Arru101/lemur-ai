"use client";

import React from "react";

interface LemurLogoProps {
  className?: string;
}

export default function LemurLogo({ className = "w-8 h-8" }: LemurLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      className={className}
    >
      <defs>
        {/* Dynamic Gradients */}
        <linearGradient id="lemurGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--secondary)" />
        </linearGradient>
        
        <linearGradient id="earGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>

        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Cyber Ears */}
      {/* Left Ear */}
      <path
        d="M32 28 L14 8 L22 34 Z"
        fill="url(#earGrad)"
        opacity="0.8"
        stroke="var(--card-border)"
        strokeWidth="1"
      />
      {/* Right Ear */}
      <path
        d="M68 28 L86 8 L78 34 Z"
        fill="url(#earGrad)"
        opacity="0.8"
        stroke="var(--card-border)"
        strokeWidth="1"
      />

      {/* Poly Outer Shield */}
      <path
        d="M50 16 L76 38 L68 72 L50 88 L32 72 L24 38 Z"
        fill="url(#lemurGrad)"
        opacity="0.08"
        stroke="url(#lemurGrad)"
        strokeWidth="1.5"
      />

      {/* Low-Poly Forehead Plane */}
      <path
        d="M50 16 L62 36 L38 36 Z"
        fill="url(#lemurGrad)"
        opacity="0.85"
      />

      {/* Low-Poly Left Cheek Patch */}
      <path
        d="M38 36 L50 52 L26 56 L24 38 Z"
        fill="#06060c"
        stroke="var(--card-border)"
        strokeWidth="1"
      />

      {/* Low-Poly Right Cheek Patch */}
      <path
        d="M62 36 L76 38 L74 56 L50 52 Z"
        fill="#06060c"
        stroke="var(--card-border)"
        strokeWidth="1"
      />

      {/* Geometric Muzzle / Nose */}
      <path
        d="M50 52 L56 72 L44 72 Z"
        fill="url(#lemurGrad)"
        opacity="0.9"
      />
      <path
        d="M50 72 L53 78 L47 78 Z"
        fill="var(--secondary)"
        filter="url(#glow)"
      />

      {/* Glowing Cybernetic Eyes */}
      {/* Left Eye */}
      <circle
        cx="37"
        cy="47"
        r="6"
        fill="none"
        stroke="var(--secondary)"
        strokeWidth="1.8"
        filter="url(#glow)"
      />
      <circle cx="37" cy="47" r="2.2" fill="var(--secondary)" />

      {/* Right Eye */}
      <circle
        cx="63"
        cy="47"
        r="6"
        fill="none"
        stroke="var(--secondary)"
        strokeWidth="1.8"
        filter="url(#glow)"
      />
      <circle cx="63" cy="47" r="2.2" fill="var(--secondary)" />

      {/* Constellation Neural Connections */}
      <line x1="50" y1="16" x2="50" y2="36" stroke="var(--secondary)" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="37" y1="47" x2="24" y2="38" stroke="var(--primary)" strokeWidth="0.8" opacity="0.6" />
      <line x1="63" y1="47" x2="76" y2="38" stroke="var(--primary)" strokeWidth="0.8" opacity="0.6" />
      <line x1="50" y1="88" x2="50" y2="78" stroke="var(--secondary)" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
