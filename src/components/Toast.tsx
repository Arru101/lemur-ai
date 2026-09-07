"use client";

import React, { useEffect, useRef } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

function SingleToast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const duration = toast.duration ?? (toast.type === "error" ? 5000 : 3000);
    timerRef.current = setTimeout(() => onDismiss(toast.id), duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.type, toast.duration, onDismiss]);

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 stroke-[2]" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 stroke-[2]" />,
    info: <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 stroke-[2]" />,
  };

  const borders = {
    success: "border-emerald-500/30",
    error: "border-rose-500/30",
    info: "border-indigo-500/30",
  };

  const glows = {
    success: "shadow-[0_8px_24px_rgba(16,185,129,0.15)]",
    error: "shadow-[0_8px_24px_rgba(244,63,94,0.15)]",
    info: "shadow-[0_8px_24px_rgba(99,102,241,0.15)]",
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl ios-glass border ${borders[toast.type]} ${glows[toast.type]} min-w-[240px] max-w-[360px] msg-enter`}
      role="alert"
    >
      {icons[toast.type]}
      <p className="text-sm font-medium text-foreground flex-1 font-sans leading-snug">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 rounded-lg hover:bg-black/[0.08] dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-foreground transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <SingleToast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

// Hook for easy toast usage
let globalToastFn: ((type: ToastType, message: string, duration?: number) => void) | null = null;

export function setGlobalToastFn(fn: typeof globalToastFn) {
  globalToastFn = fn;
}

export function toast(type: ToastType, message: string, duration?: number) {
  globalToastFn?.(type, message, duration);
}
