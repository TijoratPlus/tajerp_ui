import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

const skeletonVariants = cva("bg-ui-surface-2 animate-pulse", {
  variants: {
    variant: {
      rect: "!rounded-md",
      text: "h-4 !rounded-md",
      circle: "!rounded-full",
    },
  },
  defaultVariants: {
    variant: "rect",
  },
});

export type SkeletonProps = React.ComponentProps<"div"> &
  VariantProps<typeof skeletonVariants> & {
    /**
     * Render a stack of `text` bars (the last one shorter, like a paragraph).
     * Only applies to `variant="text"`.
     */
    lines?: number;
  };

/** Animated placeholder for content that is still loading. */
export function Skeleton({
  className,
  variant,
  lines,
  ...props
}: SkeletonProps) {
  if (variant === "text" && lines && lines > 1) {
    return (
      <div
        data-slot="skeleton-group"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            data-slot="skeleton"
            className={cn(
              skeletonVariants({ variant: "text" }),
              i === lines - 1 ? "w-2/3" : "w-full",
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}
