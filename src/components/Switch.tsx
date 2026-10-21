import * as React from "react";

import { cn } from "../lib/cn";

export type SwitchProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "onChange" | "defaultChecked" | "checked" | "type"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Submit with native forms: renders a hidden checkbox input with this name. */
  name?: string;
  /** Value submitted when on (default "on"). */
  value?: string;
};

/** Accessible toggle switch (uncontrolled or controlled). */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      defaultChecked,
      onCheckedChange,
      disabled,
      className,
      name,
      value = "on",
      onClick,
      ...props
    },
    ref,
  ) => {
    const isControlled = checked !== undefined;
    const [internal, setInternal] = React.useState(defaultChecked ?? false);
    const on = isControlled ? checked : internal;

    return (
      <>
        <button
          ref={ref}
          type="button"
          role="switch"
          data-slot="switch"
          data-state={on ? "checked" : "unchecked"}
          aria-checked={on}
          disabled={disabled}
          onClick={(e) => {
            onClick?.(e);
            if (e.defaultPrevented) return;
            if (!isControlled) setInternal((v) => !v);
            onCheckedChange?.(!on);
          }}
          className={cn(
            "inline-flex h-6 w-10 shrink-0 cursor-pointer items-center !rounded-full border border-transparent p-0.5 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-ui-surface disabled:cursor-not-allowed disabled:opacity-60",
            // Off: outlined track + dark thumb, so both keep 3:1 against the
            // surface (WCAG 1.4.11 non-text contrast).
            on ? "bg-brand-solid" : "bg-ui-surface-2 border-ink-3",
            className,
          )}
          {...props}
        >
          <span
            aria-hidden
            className={cn(
              "pointer-events-none block size-5 !rounded-full shadow-tj-sm transition-transform duration-150 ease-tj-out",
              on ? "translate-x-4 bg-on-brand" : "translate-x-0 bg-ink-3",
            )}
          />
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
            disabled={disabled}
            readOnly
          />
        ) : null}
      </>
    );
  },
);
Switch.displayName = "Switch";
