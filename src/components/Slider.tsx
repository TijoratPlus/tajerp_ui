import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "../lib/cn";

export type SliderProps = React.ComponentProps<typeof SliderPrimitive.Root>;

/** Range slider (one or more thumbs) styled with the brand palette. */
export const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, value, defaultValue, min = 0, max = 100, ...props }, ref) => {
  const thumbCount = Array.isArray(value)
    ? value.length
    : Array.isArray(defaultValue)
      ? defaultValue.length
      : 1;

  return (
    <SliderPrimitive.Root
      ref={ref}
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none select-none items-center data-[disabled]:opacity-60",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full bg-ui-surface-inset",
          "h-1.5 w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-brand data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          data-slot="slider-thumb"
          className={cn(
            "block size-4 cursor-grab rounded-full border-2 border-brand bg-ui-surface shadow-tj-sm outline-none transition-colors active:cursor-grabbing",
            "hover:bg-mist focus-visible:ring-2 focus-visible:ring-brand/40",
            "data-[disabled]:cursor-not-allowed",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = "Slider";
