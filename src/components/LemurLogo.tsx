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
      aria-label="Lemurs AI"
    >
      <defs>
        {/* Aurora Gradient — Indigo → Violet → Electric Blue */}
        <linearGradient id="lg-body" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="45%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>

        {/* Ear inner warm accent */}
        <linearGradient id="lg-ear" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.7" />
        </linearGradient>

        {/* Eye iris electric blue */}
        <radialGradient id="lg-iris" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </radialGradient>

        {/* Glass top-bevel specular */}
        <linearGradient id="lg-spec" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Muzzle patch */}
        <linearGradient id="lg-muzzle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.12" />
        </linearGradient>

        {/* Drop shadow filter */}
        <filter id="f-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#4338ca" floodOpacity="0.35" />
        </filter>

        {/* Inner glow filter for eyes */}
        <filter id="f-eye-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Squircle Background App-Icon Shape ── */}
      <rect x="4" y="4" width="92" height="92" rx="28"
        fill="url(#lg-body)"
        filter="url(#f-shadow)"
      />

      {/* Glass inner bevel highlight (top arc) */}
      <rect x="4" y="4" width="92" height="46" rx="28"
        fill="url(#lg-spec)"
      />

      {/* Subtle border ring */}
      <rect x="4" y="4" width="92" height="92" rx="28"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.5"
      />

      {/* ── LEFT EAR ── */}
      {/* Outer silhouette */}
      <path
        d="M27 42 C20 24, 30 10, 42 22"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner ear warm fill */}
      <path
        d="M29 38 C24 25, 32 17, 40 25"
        fill="url(#lg-ear)"
        opacity="0.85"
      />

      {/* ── RIGHT EAR ── */}
      <path
        d="M73 42 C80 24, 70 10, 58 22"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M71 38 C76 25, 68 17, 60 25"
        fill="url(#lg-ear)"
        opacity="0.85"
      />

      {/* ── FACE DOME ── */}
      <path
        d="M24 50 C24 34, 76 34, 76 50 C76 70, 63 86, 50 86 C37 86, 24 70, 24 50 Z"
        fill="rgba(255,255,255,0.13)"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
      />

      {/* ── MUZZLE PATCH ── */}
      <ellipse cx="50" cy="68" rx="11" ry="8"
        fill="url(#lg-muzzle)"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />

      {/* ── LEFT EYE ── */}
      {/* Sclera */}
      <circle cx="39" cy="52" r="8.5"
        fill="#06070f"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
      />
      {/* Iris */}
      <circle cx="39" cy="52" r="4.5" fill="url(#lg-iris)" filter="url(#f-eye-glow)" />
      {/* Pupil */}
      <circle cx="39" cy="52" r="2" fill="#020408" />
      {/* Specular dot */}
      <circle cx="41.2" cy="49.5" r="1.4" fill="white" opacity="0.9" />

      {/* ── RIGHT EYE ── */}
      <circle cx="61" cy="52" r="8.5"
        fill="#06070f"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
      />
      <circle cx="61" cy="52" r="4.5" fill="url(#lg-iris)" filter="url(#f-eye-glow)" />
      <circle cx="61" cy="52" r="2" fill="#020408" />
      <circle cx="63.2" cy="49.5" r="1.4" fill="white" opacity="0.9" />

      {/* ── NOSE ── */}
      <path
        d="M47.5 65 C47.5 63, 52.5 63, 52.5 65 L51.5 68 C51 69, 49 69, 48.5 68 Z"
        fill="rgba(255,255,255,0.7)"
      />

      {/* ── TOP SPECULAR ARC (glass lens shine) ── */}
      <path
        d="M16 20 C28 10, 72 10, 84 20"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
