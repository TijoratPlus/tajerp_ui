import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as React from "react";

import { cn } from "../lib/cn";
import { floatingPanelClass } from "../lib/overlay";
import { usePortalContainer } from "./TajUIProvider";

/**
 * Preview on hover or keyboard focus (customer card behind a name, product
 * details behind an SKU). Sighted-pointer enhancement only: the content
 * must also be reachable another way (the link it previews), and must not
 * hold the only copy of an action.
 */
function HoverCard({
  openDelay = 400,
  closeDelay = 150,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return (
    <HoverCardPrimitive.Root
      data-slot="hover-card"
      openDelay={openDelay}
      closeDelay={closeDelay}
      {...props}
    />
  );
}

const HoverCardTrigger = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger>
>((props, ref) => (
  <HoverCardPrimitive.Trigger ref={ref} data-slot="hover-card-trigger" {...props} />
));
HoverCardTrigger.displayName = "HoverCardTrigger";

export type HoverCardContentProps = React.ComponentPropsWithoutRef<
  typeof HoverCardPrimitive.Content
> & {
  /** Portal target. Defaults to the TajUIProvider container, then <body>. */
  container?: HTMLElement | null;
};

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(({ className, align = "center", sideOffset = 6, container, ...props }, ref) => {
  const providerContainer = usePortalContainer();
  return (
    <HoverCardPrimitive.Portal container={container ?? providerContainer}>
      <HoverCardPrimitive.Content
        ref={ref}
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          floatingPanelClass,
          "w-72 p-3 text-ui-body origin-(--radix-hover-card-content-transform-origin)",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
});
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardContent, HoverCardTrigger };
