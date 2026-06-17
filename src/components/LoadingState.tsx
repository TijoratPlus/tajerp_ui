import * as React from "react";

import { cn } from "../lib/cn";
import { Spinner } from "./Spinner";

export interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title,
  description,
  className,
  compact = false,
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center text-center",
      compact ? "py-8" : "py-14",
      className,
    )}
  >
    <Spinner />
    {title ? <p className="mt-3 text-base font-medium text-ink-1">{title}</p> : null}
    {description ? (
      <p className="mt-1 max-w-md text-sm text-ink-3">{description}</p>
    ) : null}
  </div>
);
