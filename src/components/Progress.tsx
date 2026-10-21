import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

import { cn } from "../lib/cn";
import { useCommonMessages, useFormat } from "./TajUIProvider";

export type ProgressTone = "brand" | "success" | "warning" | "danger" | "info";

const toneClass: Record<ProgressTone, string> = {
  brand: "bg-brand",
  success: "bg-tj-success",
  warning: "bg-tj-warning",
  danger: "bg-tj-error",
  info: "bg-tj-info",
};

export type ProgressProps = Omit<
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
  "value" | "max"
> & {
  /** Current value, 0…max. Ignored when `indeterminate`. */
  value?: number | null;
  /** Defaults to 100. */
  max?: number;
  tone?: ProgressTone;
  /** Track thickness. Defaults to "md". */
  size?: "sm" | "md";
  /** Visible label above the bar; also its accessible name. */
  label?: React.ReactNode;
  /** Show the percentage next to the label. */
  showValue?: boolean;
  /** Unknown duration (syncing offline sales, importing a price list). */
  indeterminate?: boolean;
  /** Class for the track element (the root wraps label + track). */
  trackClassName?: string;
};

/**
 * Linear progress for a known share of work (stock count, plan completion,
 * sync of offline receipts). Use `indeterminate` when the total is unknown.
 * Tone is not the only cue: pair a warning/danger tone with a label.
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      trackClassName,
      value,
      max = 100,
      tone = "brand",
      size = "md",
      label,
      showValue = false,
      indeterminate = false,
      getValueLabel,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      ...props
    },
    ref,
  ) => {
    const fmt = useFormat();
    const t = useCommonMessages();
    const labelId = React.useId();
    const indicatorRef = React.useRef<HTMLDivElement>(null);

    const safeMax = max > 0 ? max : 100;
    const current = indeterminate || value == null ? null : Math.min(Math.max(value, 0), safeMax);
    const percent = current == null ? null : (current / safeMax) * 100;
    const percentText =
      percent == null
        ? null
        : `${fmt.number(Math.round(percent))}${fmt.locale === "en" ? "%" : " %"}`;

    // Sliding bar for the indeterminate state. Web Animations keep the
    // stylesheet free of an extra keyframe; skipped under reduced motion,
    // where the bar is shown full-width and dimmed instead.
    React.useEffect(() => {
      const el = indicatorRef.current;
      if (current != null || !el || typeof el.animate !== "function") return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      const anim = el.animate(
        [{ transform: "translateX(-100%)" }, { transform: "translateX(300%)" }],
        { duration: 1400, iterations: Infinity, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
      );
      return () => anim.cancel();
    }, [current]);

    const hasHeader = label != null || (showValue && percentText != null);
    const nameProps = ariaLabelledBy
      ? { "aria-labelledby": ariaLabelledBy }
      : label != null
        ? { "aria-labelledby": labelId }
        : { "aria-label": ariaLabel ?? (current == null ? t.loading : undefined) };

    const track = (
      <ProgressPrimitive.Root
        ref={ref}
        data-slot="progress"
        data-tone={tone}
        value={current}
        max={safeMax}
        getValueLabel={
          getValueLabel ?? (percentText != null ? () => percentText : undefined)
        }
        {...nameProps}
        className={cn(
          "relative w-full overflow-hidden !rounded-pill bg-ink-4/25",
          size === "sm" ? "h-1.5" : "h-2.5",
          hasHeader ? trackClassName : cn(className, trackClassName),
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          ref={indicatorRef}
          data-slot="progress-indicator"
          className={cn(
            "h-full !rounded-pill",
            toneClass[tone],
            current == null
              ? "w-1/3 motion-reduce:w-full motion-reduce:opacity-50"
              : "w-full transition-transform duration-300 ease-tj-out",
          )}
          style={
            current == null
              ? undefined
              : { transform: `translateX(-${100 - (percent ?? 0)}%)` }
          }
        />
      </ProgressPrimitive.Root>
    );

    if (!hasHeader) return track;

    return (
      <div data-slot="progress-field" className={cn("flex w-full flex-col gap-1.5", className)}>
        <div className="flex items-baseline justify-between gap-3 text-ui-label">
          {label != null ? (
            <span id={labelId} data-slot="progress-label" className="font-medium text-ink-2">
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue && percentText != null ? (
            <span
              data-slot="progress-value"
              aria-hidden
              className="tabular-nums font-semibold text-ink-1"
            >
              {percentText}
            </span>
          ) : null}
        </div>
        {track}
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
