import React, { type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "secondary" | "outline" | "ghost";
  readonly size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-mono font-medium uppercase tracking-wider transition-colors duration-fast rounded-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 select-none";

  const sizeStyles = {
    sm: "h-8 px-3 text-xs",
    md: "h-11 px-5 text-xs",
    lg: "h-12 px-7 text-sm",
  }[size];

  const variantStyles = {
    primary:
      "bg-accent text-background font-bold border border-accent hover:bg-transparent hover:text-accent active:bg-accent/90",
    secondary:
      "bg-surface text-text-primary border border-border hover:border-accent hover:text-accent hover:bg-surface-active",
    outline:
      "bg-transparent text-text-primary border border-border hover:border-text-primary hover:bg-surface",
    ghost:
      "bg-transparent text-text-muted hover:text-text-primary hover:bg-surface/50 border border-transparent",
  }[variant];

  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(baseStyles, sizeStyles, variantStyles, className)}
    >
      {children}
    </button>
  );
}
