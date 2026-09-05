import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps {
  readonly label: string;
  readonly variant?: "neutral" | "signal" | "accent" | "outline";
  readonly showDot?: boolean;
  readonly className?: string;
}

export function Badge({
  label,
  variant = "neutral",
  showDot = false,
  className,
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider rounded-none select-none border";

  const variantStyles = {
    neutral: "bg-surface text-text-muted border-border",
    signal: "bg-signal/10 text-signal border-signal/40",
    accent: "bg-accent/10 text-accent border-accent/40",
    outline: "bg-transparent text-text-muted border-border",
  }[variant];

  return (
    <span className={cn(baseStyles, variantStyles, className)}>
      {showDot && (
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0",
            variant === "signal" && "bg-signal animate-pulse",
            variant === "accent" && "bg-accent",
            variant === "neutral" && "bg-text-muted",
            variant === "outline" && "bg-text-muted"
          )}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}
