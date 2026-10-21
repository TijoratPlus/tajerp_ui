import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { cn } from "../lib/cn";
import { floatingPanelClass } from "../lib/overlay";
import { useDensity, usePortalContainer } from "./TajUIProvider";

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>((props, ref) => (
  <PopoverPrimitive.Trigger ref={ref} data-slot="popover-trigger" {...props} />
));
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverAnchor = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Anchor>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor>
>((props, ref) => (
  <PopoverPrimitive.Anchor ref={ref} data-slot="popover-anchor" {...props} />
));
PopoverAnchor.displayName = "PopoverAnchor";

const PopoverClose = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>
>((props, ref) => (
  <PopoverPrimitive.Close ref={ref} data-slot="popover-close" {...props} />
));
PopoverClose.displayName = "PopoverClose";

export type PopoverContentProps = React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> & {
  /** Portal target. Defaults to the TajUIProvider container, then <body>. */
  container?: HTMLElement | null;
};

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, align = "center", sideOffset = 6, container, ...props }, ref) => {
  const providerContainer = usePortalContainer();
  const density = useDensity();
  return (
    <PopoverPrimitive.Portal container={container ?? providerContainer}>
      <PopoverPrimitive.Content
        ref={ref}
        data-slot="popover-content"
        data-density={density}
        align={align}
        sideOffset={sideOffset}
        className={cn(floatingPanelClass, "w-72 p-3", className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverClose };
