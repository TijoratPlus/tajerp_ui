import { AlertCircle } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { Button } from "./Button";

export interface ErrorStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => (
  <div
    className={cn(
      "flex flex-col justify-center items-center bg-tj-error/5 py-12 border border-tj-error/30 !rounded-lg text-center",
      className,
    )}
  >
    <div className="bg-tj-error/10 mb-4 p-3 !rounded-full">
      <AlertCircle className="w-6 h-6 text-tj-error" />
    </div>
    <p className="font-medium text-tj-error text-base">{title}</p>
    {description ? (
      <p className="mt-1 max-w-lg text-ink-3 text-sm">{description}</p>
    ) : null}
    {actionLabel && onAction ? (
      <Button className="mt-5" onClick={onAction} variant="outline" size="sm">
        {actionLabel}
      </Button>
    ) : null}
  </div>
);
