import * as React from "react";

import { cn } from "../lib/cn";
import { Spinner } from "./Spinner";

export interface LoadingStateProps {
  title?: string;
  /** Announced to screen readers when no `title` is shown. Defaults to "Loading…". */
  label?: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title,
  label = "Loading…",
  description,
  className,
  compact = false,
}) => (
  <div
    role="status"
    aria-live="polite"
    className={cn(
      "flex flex-col items-center justify-center text-center",
      compact ? "py-6" : "py-10",
      className,
    )}
  >
    <Spinner />
    {title ? (
      <p className="mt-2 text-[15px] font-medium text-ink-1">{title}</p>
    ) : (
      <span className="sr-only">{label}</span>
    )}
    {description ? (
      <p className="mt-1 max-w-md text-sm text-ink-3">{description}</p>
    ) : null}
  </div>
);
