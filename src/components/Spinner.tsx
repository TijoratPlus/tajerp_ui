import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export type SpinnerProps = React.SVGProps<SVGSVGElement>;

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Loader2
      className={cn("h-8 w-8 animate-spin text-brand", className)}
      {...props}
    />
  );
}
