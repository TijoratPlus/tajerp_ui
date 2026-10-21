import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as React from "react";

import { cn } from "../lib/cn";

/**
 * Show/hide one region (advanced filters, receipt details, "more fields").
 * For a list of sections where headings matter, use Accordion. Controlled
 * via `open` / `onOpenChange`, or `defaultOpen`.
 */
const Collapsible = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>
>((props, ref) => (
  <CollapsiblePrimitive.Root ref={ref} data-slot="collapsible" {...props} />
));
Collapsible.displayName = "Collapsible";

/** Unstyled; usually rendered `asChild` around a Button. */
const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>((props, ref) => (
  <CollapsiblePrimitive.Trigger ref={ref} data-slot="collapsible-trigger" {...props} />
));
CollapsibleTrigger.displayName = "CollapsibleTrigger";

/**
 * Animates height with the Accordion keyframes: the accordion height
 * variable is pointed at Radix's collapsible measurement. Under reduced
 * motion the region opens and closes instantly.
 */
const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    data-slot="collapsible-content"
    className={cn(
      "overflow-hidden [--radix-accordion-content-height:var(--radix-collapsible-content-height)] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none",
      className,
    )}
    {...props}
  />
));
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
