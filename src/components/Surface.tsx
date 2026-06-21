import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

const surfaceVariants = cva("text-ink-1", {
  variants: {
    tone: {
      surface: "bg-ui-surface",
      "surface-2": "bg-ui-surface-2",
      inset: "bg-ui-surface-inset",
      mist: "bg-mist text-mist-ink",
    },
    elevation: {
      none: "shadow-none",
      sm: "shadow-tj-sm",
      md: "shadow-tj-md",
      lg: "shadow-tj-lg",
    },
    radius: {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    },
    border: {
      true: "border border-hairline",
      false: "",
    },
  },
  defaultVariants: {
    tone: "surface",
    elevation: "none",
    radius: "lg",
    padding: "none",
    border: false,
  },
});

export type SurfaceProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof surfaceVariants> & {
    /** Element to render. Defaults to `div`. */
    as?: React.ElementType;
  };

/**
 * Low-level box primitive — the building block behind cards, panels and rails.
 * Compose tone / elevation / radius / padding / border without writing CSS.
 */
export const Surface = React.forwardRef<HTMLElement, SurfaceProps>(
  (
    { className, tone, elevation, radius, padding, border, as, ...props },
    ref,
  ) => {
    const Comp = (as ?? "div") as React.ElementType;
    return (
      <Comp
        ref={ref}
        data-slot="surface"
        className={cn(
          surfaceVariants({ tone, elevation, radius, padding, border }),
          className,
        )}
        {...props}
      />
    );
  },
);
Surface.displayName = "Surface";

export { surfaceVariants };
