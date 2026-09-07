"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button on open for safe default
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => cancelBtnRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={onCancel}
      />

      {/* Dialog panel */}
      <div className="relative ios-glass-card rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-black/[0.08] dark:border-white/15 msg-enter">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
          isDanger
            ? "bg-rose-500/15 border border-rose-500/25"
            : "bg-amber-500/15 border border-amber-500/25"
        }`}>
          {isDanger
            ? <Trash2 className="w-5 h-5 text-rose-500 dark:text-rose-400" />
            : <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          }
        </div>

        {/* Close X */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-foreground transition-colors"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        <h2
          id="confirm-title"
          className="text-base font-bold text-neutral-900 dark:text-white font-sans tracking-tight mb-1.5"
        >
          {title}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex items-center gap-3">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/10 border border-black/[0.08] dark:border-white/10 transition-all apple-spring active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all apple-spring active:scale-95 shadow-md ${
              isDanger
                ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/30"
                : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
