"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { AlertTriangle } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { overlayClass } from "../lib/overlay";
import { buttonVariants } from "./Button";
import { useCommonMessages, usePortalContainer } from "./TajUIProvider";

/**
 * Modal confirmation that interrupts the user and requires an explicit answer
 * (void a receipt, delete an invoice, approve a TijoratAI draft). Unlike
 * Dialog it has no close button and does not close on outside click; Escape
 * cancels. Focus starts on Cancel, the safe choice.
 */
function AlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

const AlertDialogTrigger = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger>
>((props, ref) => (
  <AlertDialogPrimitive.Trigger ref={ref} data-slot="alert-dialog-trigger" {...props} />
));
AlertDialogTrigger.displayName = "AlertDialogTrigger";

function AlertDialogPortal({
  container,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  const providerContainer = usePortalContainer();
  return (
    <AlertDialogPrimitive.Portal
      data-slot="alert-dialog-portal"
      container={container ?? providerContainer}
      {...props}
    />
  );
}

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    data-slot="alert-dialog-overlay"
    className={cn(overlayClass, className)}
    {...props}
  />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

export type AlertDialogContentProps = React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Content
> & {
  /** Width preset. Defaults to "sm" (24rem). */
  size?: "sm" | "md";
};

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogContentProps
>(({ className, size = "sm", ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      data-slot="alert-dialog-content"
      className={cn(
        "fixed top-1/2 left-1/2 z-(--tj-z-modal) grid w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain -translate-x-1/2 -translate-y-1/2 gap-4 !rounded-xl border border-hairline bg-ui-surface p-5 text-ink-1 shadow-tj-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        size === "sm" ? "max-w-sm" : "max-w-lg",
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-dialog-header"
    className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
    {...props}
  />
));
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-dialog-footer"
    className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
));
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    data-slot="alert-dialog-title"
    className={cn("text-base font-bold leading-snug text-ink-1", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    data-slot="alert-dialog-description"
    className={cn("text-ui-body leading-relaxed text-ink-3", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

export type AlertDialogTone = "brand" | "danger";

export type AlertDialogActionProps = React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Action
> & {
  /** `danger` for destructive confirmations. Defaults to "brand". */
  tone?: AlertDialogTone;
};

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  AlertDialogActionProps
>(({ className, tone = "brand", ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    data-slot="alert-dialog-action"
    data-tone={tone}
    className={cn(
      buttonVariants({ variant: tone === "danger" ? "danger" : "solid", size: "md" }),
      className,
    )}
    {...props}
  />
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    data-slot="alert-dialog-cancel"
    className={cn(buttonVariants({ variant: "subtle", size: "md" }), className)}
    {...props}
  />
));
AlertDialogCancel.displayName = "AlertDialogCancel";

// ── Imperative confirm() ────────────────────────────────────────────────────

export interface ConfirmOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Defaults to the locale's "Confirm". */
  confirmLabel?: React.ReactNode;
  /** Defaults to the locale's "Cancel". */
  cancelLabel?: React.ReactNode;
  /** `danger` for destructive actions. Defaults to "brand". */
  tone?: AlertDialogTone;
}

interface ConfirmRequest {
  id: number;
  options: ConfirmOptions;
  resolve: (ok: boolean) => void;
  /** Element focused when confirm() was called; focus returns there. */
  returnFocus: HTMLElement | null;
}

let queue: ConfirmRequest[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
const getSnapshot = () => queue;

let counter = 0;

/**
 * Ask the user to confirm an action. Resolves `true` on confirm and `false`
 * on cancel or Escape. Requires a mounted `<ConfirmHost />`; calls made
 * while another confirmation is open are queued.
 *
 *   if (await confirm({ title: "Удалить счёт?", tone: "danger" })) remove();
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const active =
      typeof document !== "undefined" && document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    queue = [...queue, { id: ++counter, options, resolve, returnFocus: active }];
    emit();
  });
}

function settle(id: number, ok: boolean) {
  const req = queue.find((r) => r.id === id);
  if (!req) return;
  queue = queue.filter((r) => r.id !== id);
  emit();
  req.resolve(ok);
}

export interface ConfirmHostProps {
  /** Width preset of the dialog. Defaults to "sm". */
  size?: AlertDialogContentProps["size"];
}

/**
 * Renders dialogs requested with `confirm()`. Mount once near the app root,
 * next to `<Toaster />`.
 */
export function ConfirmHost({ size }: ConfirmHostProps) {
  const pending = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const head = pending[0];
  const t = useCommonMessages();

  // Keep the last request on screen while the exit animation plays.
  const [shown, setShown] = React.useState<ConfirmRequest | undefined>(head);
  if (head && head !== shown) setShown(head);

  if (!shown) return null;
  const { options } = shown;
  const tone = options.tone ?? "brand";
  const id = shown.id;

  return (
    <AlertDialog
      open={!!head && head.id === id}
      onOpenChange={(open) => {
        if (!open) settle(id, false);
      }}
    >
      <AlertDialogContent
        size={size}
        data-slot="confirm-dialog"
        // No description: opt out of Radix's aria-describedby (and its warning).
        {...(options.description ? {} : { "aria-describedby": undefined })}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          if (shown.returnFocus?.isConnected) shown.returnFocus.focus();
        }}
      >
        <div className="flex items-start gap-3">
          {tone === "danger" ? (
            <span className="flex size-9 shrink-0 items-center justify-center !rounded-full bg-tj-error-bg text-tj-error-ink">
              <AlertTriangle className="size-5" aria-hidden />
            </span>
          ) : null}
          <AlertDialogHeader className="min-w-0 flex-1 pt-1 text-left">
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            {options.description ? (
              <AlertDialogDescription>{options.description}</AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{options.cancelLabel ?? t.cancel}</AlertDialogCancel>
          <AlertDialogAction tone={tone} onClick={() => settle(id, true)}>
            {options.confirmLabel ?? t.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
