import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as React from "react";

import { cn } from "../lib/cn";

export type RadioGroupProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> & {
  /** Layout and arrow-key axis. Defaults to "vertical". */
  orientation?: "horizontal" | "vertical";
};

/**
 * Single choice from a short, visible list (payment method, receipt width,
 * price list). Tab focuses the selected option; arrow keys move and select.
 * For 2–3 compact options in a toolbar, use SegmentedControl.
 */
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, orientation = "vertical", ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    data-slot="radio-group"
    orientation={orientation}
    className={cn(
      "flex",
      orientation === "vertical" ? "flex-col gap-2.5" : "flex-row flex-wrap gap-x-5 gap-y-2",
      className,
    )}
    {...props}
  />
));
RadioGroup.displayName = "RadioGroup";

export type RadioGroupItemProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> & {
  /** Visible label; renders a labelled row whose text is also clickable. */
  label?: React.ReactNode;
  /** Secondary line under the label, linked via aria-describedby. */
  description?: React.ReactNode;
};

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, label, description, id, disabled, ...props }, ref) => {
  const autoId = React.useId();
  const itemId = id ?? `radio-${autoId}`;
  const descId = description ? `${itemId}-desc` : undefined;

  const radio = (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={itemId}
      data-slot="radio-group-item"
      disabled={disabled}
      aria-describedby={descId}
      className={cn(
        // 18px dot with a 3px hit-slop → 24px target (WCAG 2.5.8).
        "relative inline-flex size-[18px] shrink-0 cursor-pointer items-center justify-center !rounded-full border-[1.5px] border-ink-3 bg-ui-surface transition-colors duration-100 after:absolute after:-inset-[3px] after:!rounded-full",
        "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-ui-surface",
        "hover:border-brand data-[state=checked]:border-brand",
        "disabled:cursor-not-allowed disabled:opacity-50",
        !label && !description && className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="size-2 !rounded-full bg-brand-solid"
      />
    </RadioGroupPrimitive.Item>
  );

  if (!label && !description) return radio;

  return (
    <div
      data-slot="radio-group-row"
      data-disabled={disabled || undefined}
      className={cn("flex items-start gap-2.5", className)}
    >
      <span className="flex min-h-6 items-center">{radio}</span>
      <span className="flex min-w-0 flex-col gap-0.5 pt-0.5">
        {label ? (
          <label
            htmlFor={itemId}
            data-slot="radio-group-label"
            className={cn(
              "cursor-pointer text-ui-body font-medium leading-5 text-ink-1",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            {label}
          </label>
        ) : null}
        {description ? (
          <span
            id={descId}
            data-slot="radio-group-description"
            className={cn("text-ui-helper text-ink-3", disabled && "opacity-60")}
          >
            {description}
          </span>
        ) : null}
      </span>
    </div>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
