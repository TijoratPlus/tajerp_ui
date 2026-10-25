import * as React from "react";

import {
  controlDisabled,
  controlFocus,
  controlFrame,
  controlInvalid,
} from "../lib/control";
import { cn } from "../lib/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex w-full min-h-16 px-3 py-2 font-medium text-ui-control",
        controlFrame,
        "placeholder:text-ink-3 placeholder:font-normal",
        controlFocus,
        controlInvalid,
        controlDisabled,
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
