import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "../lib/cn";
import { usePortalContainer } from "./TajUIProvider";

/** Set by TooltipProvider so Tooltip knows it need not create its own. */
const HasProvider = React.createContext(false);

/**
 * Mount once near the app root to share delay settings across tooltips
 * (moving between tooltips skips the delay). Optional — a Tooltip without a
 * provider above it creates one.
 */
function TooltipProvider({
  delayDuration = 200,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <HasProvider.Provider value>
      <TooltipPrimitive.Provider
        data-slot="tooltip-provider"
        delayDuration={delayDuration}
        {...props}
      />
    </HasProvider.Provider>
  );
}

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const hasProvider = React.useContext(HasProvider);
  const root = <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
  return hasProvider ? root : <TooltipProvider>{root}</TooltipProvider>;
}

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>((props, ref) => (
  <TooltipPrimitive.Trigger ref={ref} data-slot="tooltip-trigger" {...props} />
));
TooltipTrigger.displayName = "TooltipTrigger";

export type TooltipContentProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> & {
  /** Portal target. Defaults to the TajUIProvider container, then <body>. */
  container?: HTMLElement | null;
};

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 6, children, container, ...props }, ref) => {
  const providerContainer = usePortalContainer();
  return (
    <TooltipPrimitive.Portal container={container ?? providerContainer}>
      <TooltipPrimitive.Content
        ref={ref}
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-(--tj-z-tooltip) w-fit max-w-xs !rounded-md bg-brand-deep px-2 py-1 text-xs font-medium text-on-brand shadow-tj-md data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 !rounded-[2px] bg-brand-deep fill-brand-deep" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
