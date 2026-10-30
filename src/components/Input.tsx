import * as React from "react";

import {
  controlDisabled,
  controlFocus,
  controlFrame,
  controlInvalid,
  controlSize,
  type ControlSize,
} from "../lib/control";
import { cn } from "../lib/cn";

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  /** Control height (density-aware). Defaults to "md". */
  size?: ControlSize;
  /** The native `size` attribute (visible character width). */
  htmlSize?: number;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", size = "md", htmlSize, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      size={htmlSize}
      data-slot="input"
      className={cn(
        "flex w-full px-3 font-medium",
        controlFrame,
        controlSize[size],
        "placeholder:text-ink-4 placeholder:font-normal",
        controlFocus,
        controlInvalid,
        controlDisabled,
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
