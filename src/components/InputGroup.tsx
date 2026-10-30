import * as React from "react";

import {
  controlFocusWithin,
  controlFrame,
  controlInvalidWithin,
  controlSize,
  type ControlSize,
} from "../lib/control";
import { cn } from "../lib/cn";

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ControlSize;
  disabled?: boolean;
}

/**
 * Field frame that hosts a bare input plus leading/trailing adornments
 * (icons, currency sign, unit, buttons). Focus and invalid styling follow the
 * inner input, so the whole group reads as one control.
 *
 *   <InputGroup>
 *     <InputGroupAddon><Search /></InputGroupAddon>
 *     <InputGroupInput placeholder="Поиск…" />
 *   </InputGroup>
 */
export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, size = "md", disabled, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="input-group"
      data-disabled={disabled || undefined}
      className={cn(
        "relative flex w-full items-center overflow-hidden",
        controlFrame,
        controlSize[size],
        controlFocusWithin,
        controlInvalidWithin,
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
InputGroup.displayName = "InputGroup";

export type InputGroupAddonProps = React.HTMLAttributes<HTMLSpanElement>;

/** Static adornment (icon, symbol, unit) inside an InputGroup. */
export const InputGroupAddon = React.forwardRef<
  HTMLSpanElement,
  InputGroupAddonProps
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="input-group-addon"
    className={cn(
      "inline-flex shrink-0 items-center px-3 text-ink-3 [&>svg]:size-4 first:pr-0 last:pl-0",
      className,
    )}
    {...props}
  />
));
InputGroupAddon.displayName = "InputGroupAddon";

export type InputGroupInputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** Borderless input that fills the InputGroup. */
export const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  InputGroupInputProps
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    data-slot="input-group-input"
    className={cn(
      "h-full w-full min-w-0 flex-1 bg-transparent px-3 font-medium text-ink-1 outline-none",
      "placeholder:font-normal placeholder:text-ink-4 disabled:cursor-not-allowed",
      "[&::-webkit-search-cancel-button]:appearance-none",
      className,
    )}
    {...props}
  />
));
InputGroupInput.displayName = "InputGroupInput";
