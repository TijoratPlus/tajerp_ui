import { ChevronDown } from "lucide-react";
import * as React from "react";

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
      ...props
    },
    ref,
  ) => (
    <div className="inline-flex relative items-center w-full">
      <select
        ref={ref}
        className={cn(
          "pr-9 pl-3.5 border rounded-lg outline-none w-full h-10 font-medium text-[14px] text-ink-1 transition-colors duration-150 appearance-none cursor-pointer",
          variant === "subtle"
            ? "border-transparent bg-ui-surface-2"
            : "border-hairline bg-ui-surface-2",
          "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30",
          "disabled:cursor-not-allowed disabled:opacity-60",
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
      <ChevronDown className="right-3 absolute size-4 text-ink-3 pointer-events-none" />
    </div>
  ),
);
Select.displayName = "Select";
