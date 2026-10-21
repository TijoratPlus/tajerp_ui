import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

const toggleVariants = cva(
  "inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 !rounded-lg font-semibold whitespace-nowrap text-ink-2 transition-colors duration-150 outline-none hover:bg-ui-surface-2 hover:text-ink-1 focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-mist data-[state=on]:text-mist-ink [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-hairline bg-transparent data-[state=on]:border-brand/40",
      },
      size: {
        sm: "h-control-sm min-w-control-sm px-2 text-ui-label",
        md: "h-control-md min-w-control-md px-2.5 text-ui-control",
        lg: "h-control-lg min-w-control-lg px-3 text-ui-control",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export type ToggleProps = React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>;

/**
 * Two-state button (bold, "show archived", favourite). Exposes `aria-pressed`.
 * Controlled via `pressed` / `onPressedChange`, or `defaultPressed`.
 * Icon-only toggles need an `aria-label`.
 */
const Toggle = React.forwardRef<React.ElementRef<typeof TogglePrimitive.Root>, ToggleProps>(
  ({ className, variant, size, ...props }, ref) => (
    <TogglePrimitive.Root
      ref={ref}
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };
