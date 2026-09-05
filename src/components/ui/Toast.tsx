"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export interface ToastProps {
  readonly message: string;
  readonly type?: "success" | "error" | "info";
  readonly duration?: number;
  readonly onClose?: () => void;
  readonly title?: string;
}

export function Toast({
  message,
  type = "success",
  duration = 4000,
  onClose,
  title,
}: ToastProps) {
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isError = type === "error";
  const isSuccess = type === "success";

  return (
    <aside
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-3.5 border bg-surface p-4 rounded-none transition-all duration-fast shadow-2xl",
        isSuccess && "border-accent text-text-primary",
        isError && "border-signal text-text-primary",
        type === "info" && "border-border text-text-primary"
      )}
    >
      <div className="shrink-0 pt-0.5" aria-hidden="true">
        {isSuccess && <CheckCircle2 className="h-4 w-4 text-accent" />}
        {isError && <AlertCircle className="h-4 w-4 text-signal" />}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-mono text-[10px] font-bold uppercase tracking-widest",
              isSuccess && "text-accent",
              isError && "text-signal",
              type === "info" && "text-text-muted"
            )}
          >
            [{type.toUpperCase()}]
          </span>
          {title && (
            <h5 className="font-display text-xs font-bold uppercase tracking-tight text-text-primary">
              {title}
            </h5>
          )}
        </div>
        <p className="font-body text-xs text-text-muted leading-relaxed select-text">
          {message}
        </p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="shrink-0 border border-border p-1 text-text-muted transition-colors duration-fast hover:border-text-primary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}
