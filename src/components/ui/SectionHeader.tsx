import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  readonly index: string;
  readonly label: string;
  readonly title: string;
  readonly as?: "h1" | "h2";
  readonly description?: string;
  readonly meta?: ReactNode;
  readonly action?: ReactNode;
  readonly className?: string;
}

export function SectionHeader({
  index,
  label,
  title,
  as: Heading = "h2",
  description,
  meta,
  action,
  className,
}: SectionHeaderProps) {
  const formattedIndex = index.startsWith("[") ? index : `[${index}]`;

  const headingStyles =
    Heading === "h1"
      ? "mt-2 font-display text-4xl font-bold uppercase tracking-tight text-text-primary sm:text-6xl"
      : "mt-1 font-display text-3xl font-bold uppercase tracking-tight text-text-primary sm:text-4xl";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>
        {meta ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              {formattedIndex} // {label}
            </span>
            {meta}
          </div>
        ) : (
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            {formattedIndex} // {label}
          </span>
        )}
        <Heading className={headingStyles}>
          {title}
        </Heading>
        {description && (
          <p className="mt-3 font-body text-base text-text-muted max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
