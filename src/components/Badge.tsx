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
        success: "bg-tj-success/12 text-tj-success",
        warning: "bg-tj-warning/15 text-tj-warning",
        error: "bg-tj-error/12 text-tj-error",
        info: "bg-tj-info/12 text-tj-info",
        solid: "bg-brand text-on-brand",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] tracking-[0.06em] !rounded-pill uppercase",
        md: "px-3 py-1 text-[11.5px] tracking-[0.04em] !rounded-pill",
      },
    },
    defaultVariants: { tone: "brand", size: "md" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}

/**
 * Pill — a larger, bordered status/label chip from the design system.
 */
export type PillProps = React.HTMLAttributes<HTMLSpanElement> & {
  dark?: boolean;
};

export function Pill({ className, dark, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 !rounded-pill px-4 py-2.5 text-[13px] font-bold tracking-[0.04em] border-[1.5px]",
        dark
          ? "bg-brand/20 border-brand/50 text-mist-ink"
          : "bg-mist border-brand/40 text-brand-ink",
        className,
      )}
      {...props}
    />
  );
}

export { badgeVariants };
