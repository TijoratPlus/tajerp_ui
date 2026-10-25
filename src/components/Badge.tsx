import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-bold whitespace-nowrap",
  {
    variants: {
      tone: {
        brand: "bg-mist text-mist-ink",
        neutral: "bg-ui-surface-2 text-ink-2 border border-hairline",
        success: "bg-tj-success/12 text-tj-success-ink",
        warning: "bg-tj-warning/15 text-tj-warning-ink",
        danger: "bg-tj-error/12 text-tj-error-ink",
        /** Alias of `danger`. */
        error: "bg-tj-error/12 text-tj-error-ink",
        info: "bg-tj-info/12 text-tj-info-ink",
        solid: "bg-brand-solid text-on-brand",
      },
      size: {
        sm: "px-2 py-0.5 text-ui-micro tracking-[0.06em] !rounded-pill uppercase",
        md: "px-3 py-1 text-ui-caption tracking-[0.04em] !rounded-pill",
      },
    },
    defaultVariants: { tone: "brand", size: "md" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone, size, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="badge"
      className={cn(badgeVariants({ tone, size }), className)}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";

/**
 * Pill — a larger, bordered status/label chip from the design system.
 */
export type PillProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** Styling for dark hero surfaces. */
  surface?: "light" | "dark";
  /** @deprecated Use `surface="dark"`. */
  dark?: boolean;
};

export const Pill = React.forwardRef<HTMLSpanElement, PillProps>(
  ({ className, dark, surface, ...props }, ref) => {
    const onDark = (surface ?? (dark ? "dark" : "light")) === "dark";
    return (
      <span
        ref={ref}
        data-slot="pill"
        className={cn(
          "inline-flex items-center gap-2 !rounded-pill px-3 py-2 text-ui-label font-bold tracking-[0.04em] border-[1.5px]",
          onDark
            ? "bg-brand/20 border-brand/50 text-mist-ink"
            : "bg-mist border-brand/40 text-brand-ink",
          className,
        )}
        {...props}
      />
    );
  },
);
Pill.displayName = "Pill";

export { badgeVariants };
