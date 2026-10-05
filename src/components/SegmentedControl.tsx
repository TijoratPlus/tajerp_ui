import * as React from "react";

import { cn } from "../lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
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
  onChange,
  className,
  size = "md",
  ...aria
}: SegmentedControlProps<T>) {
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const enabled = options
    .map((opt, i) => (opt.disabled ? -1 : i))
    .filter((i) => i >= 0);
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const tabStop = selectedIndex >= 0 ? selectedIndex : (enabled[0] ?? -1);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const pos = enabled.indexOf(index);
    let next: number | undefined;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = enabled[(pos + 1) % enabled.length];
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = enabled[(pos - 1 + enabled.length) % enabled.length];
        break;
      case "Home":
        next = enabled[0];
        break;
      case "End":
        next = enabled[enabled.length - 1];
        break;
      default:
        return;
    }
    e.preventDefault();
    if (next === undefined) return;
    refs.current[next]?.focus();
    onChange(options[next].value);
  };

  return (
    <div
      role="radiogroup"
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
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={opt.disabled}
            tabIndex={i === tabStop ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "!rounded-pill font-bold transition-colors duration-150 outline-none cursor-pointer",
              "focus-visible:ring-2 focus-visible:ring-brand/50 disabled:cursor-not-allowed disabled:opacity-50",
              size === "sm"
                ? "min-h-6 px-2.5 py-0.5 text-[11px]"
                : "px-3 py-1 text-[13px]",
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
