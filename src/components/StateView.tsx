import * as React from "react";

import { cn } from "../lib/cn";

export interface StateViewProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Visual inside the round badge (icon or Spinner). */
  media?: React.ReactNode;
  mediaClassName?: string;
  title?: React.ReactNode;
  titleClassName?: string;
  description?: React.ReactNode;
  /** Buttons / links under the text. */
  actions?: React.ReactNode;
  compact?: boolean;
}

/**
 * Shared layout of the empty / error / loading placeholders: centred media,
 * title, description and actions. Use it directly for custom states
 * ("Касса закрыта", "Нет доступа").
 */
export const StateView = React.forwardRef<HTMLDivElement, StateViewProps>(
  (
    {
      media,
      mediaClassName,
      title,
      titleClassName,
      description,
      actions,
      compact = false,
      className,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      data-slot="state-view"
      className={cn(
        "flex flex-col items-center justify-center px-4 text-center",
        compact ? "py-6" : "py-10",
        className,
      )}
      {...props}
    >
      {media ? (
        <div
          aria-hidden
          className={cn(
            "mb-3 flex items-center justify-center !rounded-full bg-mist text-mist-ink",
            compact ? "size-10 [&>svg]:size-5" : "size-12 [&>svg]:size-6",
            mediaClassName,
          )}
        >
          {media}
        </div>
      ) : null}
      {title ? (
        <p className={cn("text-ui-title font-semibold text-ink-1", titleClassName)}>{title}</p>
      ) : null}
      {description ? (
        <p className="mt-1 max-w-md text-ui-label text-ink-3">{description}</p>
      ) : null}
      {actions ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{actions}</div>
      ) : null}
    </div>
  ),
);
StateView.displayName = "StateView";
