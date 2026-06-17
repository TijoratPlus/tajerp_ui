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
  ({ className, children, options, placeholder, variant = "default", ...props }, ref) => (
    <div className="relative inline-flex w-full items-center">
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded-md border pl-3.5 pr-9 text-[14px] font-medium text-ink-1 outline-none transition-colors duration-150",
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
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-ink-3" />
    </div>
  ),
);
Select.displayName = "Select";
