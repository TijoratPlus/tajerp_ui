import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { closeButtonClass, overlayClass } from "../lib/overlay";
import { useCommonMessages, useDensity, usePortalContainer } from "./TajUIProvider";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>((props, ref) => (
  <DialogPrimitive.Trigger ref={ref} data-slot="dialog-trigger" {...props} />
));
DialogTrigger.displayName = "DialogTrigger";

const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>((props, ref) => (
  <DialogPrimitive.Close ref={ref} data-slot="dialog-close" {...props} />
));
DialogClose.displayName = "DialogClose";

function DialogPortal({
  container,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  const providerContainer = usePortalContainer();
  return (
    <DialogPrimitive.Portal
      data-slot="dialog-portal"
      container={container ?? providerContainer}
      {...props}
    />
  );
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(overlayClass, className)}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

export type DialogContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  showCloseButton?: boolean;
  /** Accessible name of the close button. Defaults to the locale's "Close". */
  closeLabel?: string;
  /** Width preset. Defaults to "md" (32rem). */
  size?: "sm" | "md" | "lg" | "xl" | "full";
};

const dialogSizes: Record<NonNullable<DialogContentProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)] h-[calc(100dvh-2rem)]",
};

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    { className, children, showCloseButton = true, closeLabel, size = "md", ...props },
    ref,
  ) => {
    const t = useCommonMessages();
    const density = useDensity();
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          data-slot="dialog-content"
          data-density={density}
          className={cn(
            "fixed top-1/2 left-1/2 z-(--tj-z-modal) flex flex-col w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain -translate-x-1/2 -translate-y-1/2 gap-4 !rounded-xl border border-hairline bg-ui-surface p-5 text-ui-body text-ink-1 shadow-tj-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            dialogSizes[size],
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton ? (
            <DialogPrimitive.Close className={cn(closeButtonClass, "top-3 right-3")}>
              <XIcon className="size-4" aria-hidden />
              <span className="sr-only">{closeLabel ?? t.close}</span>
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="dialog-header"
      className={cn("flex shrink-0 flex-col gap-1 pr-8 text-left", className)}
      {...props}
    />
  ),
);
DialogHeader.displayName = "DialogHeader";

/**
 * Scrolling middle of a dialog: long forms scroll here while the header and footer stay put.
 * The negative margin lets the scrollbar sit at the dialog edge and keeps focus rings unclipped.
 */
const DialogBody = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="dialog-body"
      className={cn("-mx-5 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-0.5", className)}
      {...props}
    />
  ),
);
DialogBody.displayName = "DialogBody";

const DialogFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="dialog-footer"
      className={cn("flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end", className)}
      {...props}
    />
  ),
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="dialog-title"
    className={cn("text-ui-title font-semibold leading-snug text-ink-1", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="dialog-description"
    className={cn("text-ui-label text-ink-3", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
