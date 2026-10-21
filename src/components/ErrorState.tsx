import { AlertCircle } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { Button } from "./Button";
import { StateView } from "./StateView";

export interface ErrorStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  /** Custom actions (replaces actionLabel/onAction). */
  actions?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ title, description, actionLabel, onAction, actions, compact, className }, ref) => (
    <StateView
      ref={ref}
      role="alert"
      data-slot="error-state"
      media={<AlertCircle />}
      mediaClassName="bg-tj-error/10 text-tj-error-ink"
      title={title}
      titleClassName="font-semibold text-tj-error-ink"
      description={description}
      compact={compact ?? true}
      className={cn("!rounded-lg border border-tj-error/30 bg-tj-error/5", className)}
      actions={
        actions ??
        (actionLabel && onAction ? (
          <Button onClick={onAction} variant="outline" size="sm">
            {actionLabel}
          </Button>
        ) : undefined)
      }
    />
  ),
);
ErrorState.displayName = "ErrorState";
