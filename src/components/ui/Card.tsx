import React, { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "interactive" | "bordered";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly variant?: CardVariant;
}

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  const baseStyles = "rounded-none select-text border transition-colors duration-fast";

  const variantStyles: Record<CardVariant, string> = {
    default: "bg-surface border-border text-text-primary",
    interactive:
      "bg-surface border-border text-text-primary hover:border-accent group focus-within:border-accent",
    bordered: "bg-transparent border-border text-text-primary",
  };

  return (
    <div
      {...props}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      {children}
    </div>
  );
}
