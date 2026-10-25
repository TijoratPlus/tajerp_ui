import { Check, Minus } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export type CheckboxProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "onChange" | "defaultChecked" | "checked" | "type"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Submit with native forms: renders a hidden checkbox input with this name. */
  name?: string;
  /** Value submitted when checked (default "on"). */
  value?: string;
  required?: boolean;
};

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
      name,
      value = "on",
      required,
      onClick,
      ...props
    },
    ref,
  ) => {
    const isControlled = checked !== undefined;
    const [internal, setInternal] = React.useState(defaultChecked ?? false);
    const on = isControlled ? checked : internal;
    const active = on || indeterminate;

    return (
      <>
        <button
          ref={ref}
          type="button"
          role="checkbox"
          data-slot="checkbox"
          data-state={indeterminate ? "indeterminate" : on ? "checked" : "unchecked"}
          aria-checked={indeterminate ? "mixed" : !!on}
          aria-required={required || undefined}
          disabled={disabled}
          onClick={(e) => {
            onClick?.(e);
            if (e.defaultPrevented) return;
            if (!isControlled) setInternal((v) => !v);
            onCheckedChange?.(!on);
          }}
          className={cn(
            "relative inline-flex size-[18px] shrink-0 items-center justify-center after:absolute after:-inset-[3px] !rounded-sm border-[1.5px] align-middle transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-focus cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            "aria-[invalid=true]:border-tj-error",
            active
              ? "border-brand-solid bg-brand-solid text-on-brand"
              : "border-ink-3 bg-ui-surface hover:border-brand",
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
        {name ? (
          <input
            type="checkbox"
            aria-hidden
            tabIndex={-1}
            hidden
            name={name}
            value={value}
            checked={!!on}
            required={required}
            disabled={disabled}
            readOnly
          />
        ) : null}
      </>
    );
  },
);
Checkbox.displayName = "Checkbox";
