import React, { type HTMLAttributes } from "react";
import type { AspectRatio as AspectRatioType } from "@/types/gallery";
import { cn } from "@/lib/utils";

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  readonly ratio: AspectRatioType;
}

const aspectMap: Record<AspectRatioType, string> = {
  "16:9": "aspect-[16/9]",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "3:2": "aspect-[3/2]",
  "4:5": "aspect-[4/5]",
};

export function AspectRatio({
  ratio,
  className,
  children,
  ...props
}: AspectRatioProps) {
  return (
    <div
      {...props}
      className={cn("relative w-full overflow-hidden", aspectMap[ratio], className)}
    >
      {children}
    </div>
  );
}
