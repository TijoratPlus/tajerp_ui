import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export type SpinnerProps = Omit<React.SVGProps<SVGSVGElement>, "ref">;

/**
 * Decorative by default (hidden from assistive tech). Pass `aria-label` when
 * the spinner is the only loading cue, and it is announced as an image.
 */
export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, ...props }, ref) => {
  const labelled = !!props["aria-label"];
  return (
    <Loader2
      ref={ref}
      data-slot="spinner"
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      className={cn("size-8 animate-spin text-brand", className)}
      {...props}
    />
  );
  },
);
Spinner.displayName = "Spinner";
