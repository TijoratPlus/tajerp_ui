import { Check, Minus } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

/** Square checkbox matching the Tijorat+ data-table style (check / indeterminate). */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked,
      indeterminate = false,
      onCheckedChange,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const isControlled = checked !== undefined;
    const [internal, setInternal] = React.useState(defaultChecked ?? false);
    const on = isControlled ? checked : internal;
    const active = on || indeterminate;

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : !!on}
        disabled={disabled}
        onClick={() => {
          if (!isControlled) setInternal((v) => !v);
          onCheckedChange?.(!on);
        }}
        className={cn(
          "relative inline-flex size-[18px] shrink-0 items-center justify-center after:absolute after:-inset-[3px] !rounded-sm border-[1.5px] align-middle transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-brand/40 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          active
            ? "border-brand bg-brand text-white"
            : "border-hairline bg-ui-surface hover:border-brand",
          className,
        )}
        {...props}
      >
        {indeterminate ? (
          <Minus className="size-3" strokeWidth={3} aria-hidden />
        ) : on ? (
          <Check className="size-3" strokeWidth={3} aria-hidden />
        ) : null}
      </button>
    );
  },
);
Checkbox.displayName = "Checkbox";
