import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

const cardVariants = cva("text-ink-1", {
  variants: {
    // Semantic presets — a quick way to get a complete look.
    variant: {
      default: "border-hairline bg-ui-surface shadow-none",
      elevated: "border-hairline bg-ui-surface shadow-tj-sm",
      strong: "border-hairline bg-ui-surface shadow-tj-md",
      muted: "border-hairline bg-ui-surface-2 shadow-none",
      warning: "border-tj-warning/40 bg-ui-surface shadow-tj-md",
      interactive:
        "border-hairline bg-ui-surface shadow-none transition-all duration-200 ease-tj-out hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-tj-md",
    },
    // Composable axes — override individual properties of the preset.
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
      true: "border",
      false: "",
    },
  },
  // Axes are declared after `variant`, so an explicitly-set axis wins over the
  // preset via tailwind-merge. Defaults reconstruct the original Card look.
  defaultVariants: {
    variant: "default",
    radius: "lg",
    padding: "none",
    border: true,
  },
});

export type CardProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof cardVariants> & {
    /** Element to render. Defaults to `div`. */
    as?: React.ElementType;
  };

const Card = React.forwardRef<HTMLElement, CardProps>(
  (
    { className, variant, tone, elevation, radius, padding, border, as, ...props },
    ref,
  ) => {
    const Comp = (as ?? "div") as React.ElementType;
    return (
      <Comp
        ref={ref}
        data-slot="card"
        className={cn(
          cardVariants({ variant, tone, elevation, radius, padding, border }),
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

const cardHeaderVariants = cva("flex flex-col space-y-1.5", {
  variants: {
    padding: { default: "p-6", none: "p-0", compact: "px-4 py-3" },
  },
  defaultVariants: { padding: "default" },
});

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardHeaderVariants>;

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardHeaderVariants({ padding }), className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold text-2xl text-ink-1 leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-ink-3 text-sm", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const cardContentVariants = cva("", {
  variants: {
    padding: { default: "p-6 pt-0", none: "p-0", compact: "px-4 pb-4 pt-0" },
  },
  defaultVariants: { padding: "default" },
});

export type CardContentProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardContentVariants>;

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardContentVariants({ padding }), className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const cardFooterVariants = cva("flex items-center", {
  variants: {
    padding: { default: "p-6 pt-0", none: "p-0", compact: "px-4 py-3" },
  },
  defaultVariants: { padding: "default" },
});

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardFooterVariants>;

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardFooterVariants({ padding }), className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  cardVariants,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
