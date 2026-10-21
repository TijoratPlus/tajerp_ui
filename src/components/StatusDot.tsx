import * as React from "react";

import { cn } from "../lib/cn";

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "success" | "warning" | "danger" | "error" | "info" | "brand" | "neutral";
  pulse?: boolean;
  /**
   * Text meaning of the dot (e.g. "In stock"). Colour alone is not perceivable
   * by every user, so pass this whenever no visible text sits next to the dot.
   */
  label?: string;
}

const toneMap: Record<NonNullable<StatusDotProps["tone"]>, string> = {
  success: "bg-tj-success",
  warning: "bg-tj-warning",
  danger: "bg-tj-error",
  error: "bg-tj-error",
  info: "bg-tj-info",
  brand: "bg-brand",
  neutral: "bg-ink-4",
};

/** Small status indicator dot (e.g. stock level, shift open). */
export const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ tone = "neutral", pulse = false, label, className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="status-dot"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-block size-2 !rounded-full",
        toneMap[tone],
        pulse && "motion-safe:animate-pulse",
        className,
      )}
      {...props}
    />
  ),
);
StatusDot.displayName = "StatusDot";
