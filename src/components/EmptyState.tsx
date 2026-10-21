import * as React from "react";

import { Button } from "./Button";
import { StateView } from "./StateView";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  /** Custom actions (replaces actionLabel/onAction). */
  actions?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

/** Friendly empty/zero-data placeholder. */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, actionLabel, onAction, actions, compact, className }, ref) => (
    <StateView
      ref={ref}
      data-slot="empty-state"
      media={icon}
      title={title}
      description={description}
      compact={compact}
      className={className}
      actions={
        actions ??
        (actionLabel && onAction ? (
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : undefined)
      }
    />
  ),
);
EmptyState.displayName = "EmptyState";
