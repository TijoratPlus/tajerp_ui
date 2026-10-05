import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export type SpinnerProps = React.SVGProps<SVGSVGElement>;

/**
 * Decorative by default (hidden from assistive tech). Pass `aria-label` when
 * the spinner is the only loading cue, and it is announced as an image.
 */
export function Spinner({ className, ...props }: SpinnerProps) {
  const labelled = !!props["aria-label"];
  return (
    <Loader2
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      className={cn("h-8 w-8 animate-spin text-brand", className)}
      {...props}
    />
  );
}
