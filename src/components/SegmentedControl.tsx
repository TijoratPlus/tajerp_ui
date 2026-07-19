import * as React from "react";

import { cn } from "../lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Pill segmented control — the RU/TJ/EN + light/dark toggle pattern from the
 * design system's tweaks panel.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-0.5 !rounded-pill border border-hairline bg-ui-surface-2 p-0.5",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "!rounded-pill font-bold transition-colors duration-150 outline-none cursor-pointer",
              size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-[13px]",
              active
                ? "bg-brand text-on-brand shadow-tj-sm"
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
