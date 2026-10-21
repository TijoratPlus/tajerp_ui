import * as React from "react";

import { cn } from "../lib/cn";
import { useRovingFocus } from "../lib/useRovingFocus";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
  /** Accessible name when `label` is an icon. */
  "aria-label"?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onValueChange?: (value: T) => void;
  /** @deprecated Use `onValueChange`. */
  onChange?: (value: T) => void;
  className?: string;
  /** `lg` follows the density tokens (44px+ in touch density, for POS). */
  size?: "sm" | "md" | "lg";
  /** Accessible name for the group, e.g. "Language" or "Theme". */
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * Pill segmented control — the RU/TJ/EN + light/dark toggle pattern from the
 * design system's tweaks panel.
 *
 * Exposed as a radio group: Tab focuses the selected segment, arrow keys
 * (and Home/End) move and select, matching native radio buttons.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  onChange,
  className,
  size = "md",
  ...aria
}: SegmentedControlProps<T>) {
  const emit = (next: T) => {
    onValueChange?.(next);
    onChange?.(next);
  };
  const isDisabled = React.useCallback(
    (i: number) => !!options[i]?.disabled,
    [options],
  );
  const roving = useRovingFocus({
    count: options.length,
    isDisabled,
    orientation: "both",
    onMove: (i) => emit(options[i].value),
  });
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const tabStop = selectedIndex >= 0 ? selectedIndex : (roving.enabled[0] ?? -1);

  return (
    <div
      role="radiogroup"
      data-slot="segmented-control"
      {...aria}
      className={cn(
        "inline-flex items-center gap-0.5 !rounded-pill border border-hairline bg-ui-surface-2 p-0.5",
        className,
      )}
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={roving.setRef(i)}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt["aria-label"]}
            data-state={active ? "on" : "off"}
            disabled={opt.disabled}
            tabIndex={i === tabStop ? 0 : -1}
            onClick={() => emit(opt.value)}
            onKeyDown={(e) => roving.onKeyDown(e, i)}
            className={cn(
              "!rounded-pill font-bold transition-colors duration-150 outline-none cursor-pointer",
              "focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50",
              size === "sm"
                ? "min-h-6 px-2.5 py-0.5 text-ui-caption"
                : size === "lg"
                  ? "min-h-control-md px-4 text-ui-control"
                  : "min-h-7 px-3 py-1 text-ui-label",
              active
                ? "bg-brand-solid text-on-brand shadow-tj-sm"
                : "text-ink-3 hover:text-ink-1",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
