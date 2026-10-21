import * as React from "react";

import { Spinner } from "./Spinner";
import { StateView } from "./StateView";
import { useCommonMessages } from "./TajUIProvider";

export interface LoadingStateProps {
  title?: React.ReactNode;
  /** Announced to screen readers when no `title` is shown. Defaults to the locale's "Loading…". */
  label?: string;
  description?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ title, label, description, className, compact = false }, ref) => {
    const t = useCommonMessages();
    return (
      <StateView
        ref={ref}
        role="status"
        aria-live="polite"
        data-slot="loading-state"
        media={<Spinner className="size-8" />}
        mediaClassName="bg-transparent"
        title={
          title ?? <span className="sr-only">{label ?? t.loading}</span>
        }
        titleClassName={title ? "font-medium" : undefined}
        description={description}
        compact={compact}
        className={className}
      />
    );
  },
);
LoadingState.displayName = "LoadingState";
