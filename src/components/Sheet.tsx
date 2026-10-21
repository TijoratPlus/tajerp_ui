import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { closeButtonClass, overlayClass } from "../lib/overlay";
import { useCommonMessages, usePortalContainer } from "./TajUIProvider";

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

const SheetTrigger = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Trigger>
>((props, ref) => (
  <SheetPrimitive.Trigger ref={ref} data-slot="sheet-trigger" {...props} />
));
SheetTrigger.displayName = "SheetTrigger";

const SheetClose = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Close>
>((props, ref) => (
  <SheetPrimitive.Close ref={ref} data-slot="sheet-close" {...props} />
));
SheetClose.displayName = "SheetClose";

function SheetPortal({
  container,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  const providerContainer = usePortalContainer();
  return (
    <SheetPrimitive.Portal
      data-slot="sheet-portal"
      container={container ?? providerContainer}
      {...props}
    />
  );
}

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    data-slot="sheet-overlay"
    className={cn(overlayClass, className)}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

export type SheetContentProps = React.ComponentPropsWithoutRef<
  typeof SheetPrimitive.Content
> & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
  /** Accessible name of the close button. Defaults to the locale's "Close". */
  closeLabel?: string;
};

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    { className, children, side = "right", showCloseButton = true, closeLabel, ...props },
    ref,
  ) => {
    const t = useCommonMessages();
    return (
      <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
          ref={ref}
          data-slot="sheet-content"
          data-side={side}
          className={cn(
            "fixed z-(--tj-z-modal) pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] flex flex-col gap-3 overflow-y-auto overscroll-contain bg-ui-bg shadow-tj-lg transition data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:duration-200 data-[state=open]:duration-300",
            side === "right" &&
              "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l border-hairline sm:max-w-sm",
            side === "left" &&
              "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r border-hairline sm:max-w-sm",
            side === "top" &&
              "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b border-hairline",
            side === "bottom" &&
              "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t border-hairline",
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton ? (
            <SheetPrimitive.Close
              className={cn(closeButtonClass, "right-2 top-[max(0.5rem,env(safe-area-inset-top))]")}
            >
              <XIcon className="size-4" aria-hidden />
              <span className="sr-only">{closeLabel ?? t.close}</span>
            </SheetPrimitive.Close>
          ) : null}
        </SheetPrimitive.Content>
      </SheetPortal>
    );
  },
);
SheetContent.displayName = "SheetContent";

const SheetHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1 p-3 pr-12", className)}
      {...props}
    />
  ),
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sheet-footer"
      className={cn("flex flex-col gap-1.5 mt-auto p-3", className)}
      {...props}
    />
  ),
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    data-slot="sheet-title"
    className={cn("text-base font-semibold text-ink-1", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    data-slot="sheet-description"
    className={cn("text-ink-3 text-sm", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
