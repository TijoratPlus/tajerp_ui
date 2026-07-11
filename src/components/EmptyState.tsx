import * as React from "react";

import { cn } from "../lib/cn";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/** Friendly empty/zero-data placeholder. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center py-14 text-center",
      className,
    )}
  >
    {icon ? (
      <div className="mb-4 flex size-14 items-center justify-center !rounded-full bg-mist text-mist-ink">
        {icon}
      </div>
    ) : null}
    <p className="text-base font-bold text-ink-1">{title}</p>
    {description ? (
      <p className="mt-1 max-w-md text-sm text-ink-3">{description}</p>
    ) : null}
    {actionLabel && onAction ? (
      <Button className="mt-5" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </div>
);
