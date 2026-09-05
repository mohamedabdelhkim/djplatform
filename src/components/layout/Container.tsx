import React, { type ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface ContainerProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly size?: "default" | "narrow" | "wide";
}

export function Container({
  children,
  className,
  size = "default",
}: ContainerProps) {
  const sizeStyles = {
    narrow: "max-w-4xl",
    default: "max-w-6xl",
    wide: "max-w-7xl",
  }[size];

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeStyles,
        className
      )}
    >
      {children}
    </div>
  );
}
