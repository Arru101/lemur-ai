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
        {/* Apple-grade Luminous Liquid Gradients */}
        <linearGradient id="appleGlassFace" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        <linearGradient id="appleGlassAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        <linearGradient id="appleGlassMask" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>

        <linearGradient id="appleEarInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Optical Outer Glass Bezel Squircle */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="26"
        fill="url(#appleGlassMask)"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1.5"
      />

      {/* Ears */}
      {/* Left Ear */}
      <path
        d="M26 36 C22 20, 32 14, 40 24"
        stroke="url(#appleGlassFace)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M28 32 C25 24, 32 20, 37 26"
        fill="url(#appleEarInner)"
        opacity="0.8"
      />

      {/* Right Ear */}
      <path
        d="M74 36 C78 20, 68 14, 60 24"
        stroke="url(#appleGlassFace)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M72 32 C75 24, 68 20, 63 26"
        fill="url(#appleEarInner)"
        opacity="0.8"
      />

      {/* Lemur Face Contour Glass Dome */}
      <path
        d="M26 46 C26 32, 74 32, 74 46 C74 66, 62 82, 50 82 C38 82, 26 66, 26 46 Z"
        fill="url(#appleGlassFace)"
        fillOpacity="0.12"
        stroke="url(#appleGlassFace)"
        strokeWidth="2.5"
      />

      {/* Concentric Mask Arc */}
      <path
        d="M32 44 C38 38, 62 38, 68 44 C65 56, 56 60, 50 60 C44 60, 35 56, 32 44 Z"
        fill="url(#appleGlassMask)"
      />

      {/* Apple Optical Eyes */}
      {/* Left Eye */}
      <circle cx="40" cy="48" r="7.5" fill="#0b0d14" stroke="url(#appleGlassAccent)" strokeWidth="2" />
      <circle cx="40" cy="48" r="3.2" fill="#38bdf8" />
      <circle cx="42" cy="46" r="1.2" fill="#ffffff" />

      {/* Right Eye */}
      <circle cx="60" cy="48" r="7.5" fill="#0b0d14" stroke="url(#appleGlassAccent)" strokeWidth="2" />
      <circle cx="60" cy="48" r="3.2" fill="#38bdf8" />
      <circle cx="62" cy="46" r="1.2" fill="#ffffff" />

      {/* Refined Nose / Muzzle */}
      <path
        d="M48 62 C48 60, 52 60, 52 62 L51 65 C50.5 66, 49.5 66, 49 65 Z"
        fill="#818cf8"
      />

      {/* Hairline Glass Specular Reflection Highlight */}
      <path
        d="M18 18 C30 10, 70 10, 82 18"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
