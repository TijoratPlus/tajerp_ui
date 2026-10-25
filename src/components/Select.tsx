import { ChevronDown } from "lucide-react";
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

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> & {
  /** Convenience: render options from data instead of children. */
  options?: Array<SelectOption | string>;
  /** Shown as a disabled first option when the value is empty. */
  placeholder?: string;
  variant?: "default" | "subtle";
  /** Control height (density-aware). Defaults to "md". */
  size?: ControlSize;
  /** Classes for the wrapper (the `className` goes to the <select>). */
  wrapperClassName?: string;
};

/** Styled native <select>. Pass `options` or <option> children. */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      children,
      options,
      placeholder,
      variant = "default",
      size = "md",
      wrapperClassName,
      ...props
    },
    ref,
  ) => (
    <div
      data-slot="select"
      className={cn("inline-flex relative items-center w-full", wrapperClassName)}
    >
      <select
        ref={ref}
        className={cn(
          "w-full appearance-none pr-9 pl-3 font-medium cursor-pointer",
          controlFrame,
          controlSize[size],
          variant === "subtle" && "border-transparent",
          controlFocus,
          controlInvalid,
          controlDisabled,
          className,
        )}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options
          ? options.map((opt) => {
              const o =
                typeof opt === "string" ? { label: opt, value: opt } : opt;
              return (
                <option key={o.value} value={o.value} disabled={o.disabled}>
                  {o.label}
                </option>
              );
            })
          : children}
      </select>
      <ChevronDown
        aria-hidden
        className="right-3 absolute size-4 text-ink-3 pointer-events-none"
      />
    </div>
  ),
);
Select.displayName = "Select";
