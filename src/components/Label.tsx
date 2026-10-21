import * as React from "react";

import { cn } from "../lib/cn";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      data-slot="label"
      className={cn(
        "text-ui-label font-semibold text-ink-2 select-none peer-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = "Label";
