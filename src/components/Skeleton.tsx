import * as React from "react";

import { cn } from "../lib/cn";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-ui-surface-2 rounded-md animate-pulse", className)}
      {...props}
    />
  );
}
