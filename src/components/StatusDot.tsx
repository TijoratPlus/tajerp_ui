import * as React from "react";

import { cn } from "../lib/cn";

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "success" | "warning" | "error" | "brand" | "neutral";
  pulse?: boolean;
}

const toneMap: Record<NonNullable<StatusDotProps["tone"]>, string> = {
  success: "bg-tj-success",
  warning: "bg-tj-warning",
  error: "bg-tj-error",
  brand: "bg-brand",
  neutral: "bg-ink-4",
};

/** Small status indicator dot (e.g. stock level, shift open). */
export function StatusDot({
  tone = "neutral",
  pulse = false,
  className,
  ...props
}: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        toneMap[tone],
        pulse && "animate-pulse",
        className,
      )}
      {...props}
    />
  );
}
