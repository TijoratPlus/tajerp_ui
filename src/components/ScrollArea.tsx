import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";

import { cn } from "../lib/cn";

export type ScrollAreaProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Root
> & {
  /** Which scrollbars to render. Defaults to "vertical". */
  orientation?: "vertical" | "horizontal" | "both";
  /** Props for the scrolling viewport (ref, aria-label, tabIndex, …). */
  viewportProps?: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport> & {
    ref?: React.Ref<HTMLDivElement>;
  };
};

/**
 * Scrollable region with thin themed scrollbars that keep native scrolling
 * (touch, wheel, keyboard). Use for cart lines, chat history and long menus
 * where the OS scrollbar is too heavy. Give it a height via `className`.
 * The viewport is focusable so keyboard users can scroll it.
 */
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, children, orientation = "vertical", viewportProps, ...props }, ref) => {
  const { className: viewportClassName, ref: viewportRef, ...viewportRest } =
    viewportProps ?? {};
  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        tabIndex={0}
        className={cn(
          "size-full !rounded-[inherit] outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset",
          viewportClassName,
        )}
        {...viewportRest}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {orientation !== "horizontal" ? <ScrollBar orientation="vertical" /> : null}
      {orientation !== "vertical" ? <ScrollBar orientation="horizontal" /> : null}
      <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
    </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = "ScrollArea";

export type ScrollBarProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
>;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    data-slot="scroll-area-scrollbar"
    orientation={orientation}
    className={cn(
      "flex touch-none select-none p-px transition-colors",
      orientation === "vertical" && "h-full w-2 border-l border-l-transparent",
      orientation === "horizontal" && "h-2 flex-col border-t border-t-transparent",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      data-slot="scroll-area-thumb"
      className="relative flex-1 !rounded-full bg-ink-4/50 transition-colors hover:bg-ink-3/60"
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };
