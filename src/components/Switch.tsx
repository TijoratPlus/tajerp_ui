import * as React from "react";

import { cn } from "../lib/cn";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

/** Accessible toggle switch (uncontrolled or controlled). */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { checked, defaultChecked, onCheckedChange, disabled, className, ...props },
    ref,
  ) => {
    const isControlled = checked !== undefined;
    const [internal, setInternal] = React.useState(defaultChecked ?? false);
    const on = isControlled ? checked : internal;

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={() => {
          if (!isControlled) setInternal((v) => !v);
          onCheckedChange?.(!on);
        }}
        className={cn(
          "inline-flex h-6 w-10 shrink-0 cursor-pointer items-center !rounded-full border border-transparent p-0.5 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60",
          on ? "bg-brand" : "bg-ui-surface-2 border-hairline",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block size-5 !rounded-full bg-white shadow-tj-sm transition-transform duration-150",
            on ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>
    );
  },
);
Switch.displayName = "Switch";
