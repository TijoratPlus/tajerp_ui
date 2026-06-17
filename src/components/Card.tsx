import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

const cardVariants = cva("rounded-lg border border-hairline bg-ui-surface text-ink-1", {
  variants: {
    variant: {
      default: "shadow-none",
      elevated: "shadow-tj-sm",
      strong: "shadow-tj-md",
      muted: "border-hairline bg-ui-surface-2 shadow-none",
      warning: "border-tj-warning/40 bg-ui-surface shadow-tj-md",
      interactive:
        "shadow-none transition-all duration-200 ease-tj-out hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-tj-md",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
  ),
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

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
