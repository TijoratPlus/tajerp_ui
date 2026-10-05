import * as React from "react";

import { cn } from "../lib/cn";

export interface TabItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  /** Controlled active index. */
  tabIndex?: number;
  /** Uncontrolled initial index. */
  defaultTabIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
  /** Classes for the tab strip. */
  listClassName?: string;
  /** Accessible name for the tab strip. */
  "aria-label"?: string;
}

/**
 * Pill/underline tab strip with panels. Controlled via `tabIndex`/`onTabChange`
 * or uncontrolled via `defaultTabIndex`.
 *
 * Follows the WAI-ARIA tabs pattern: Tab moves into the strip and on to the
 * panel; Left/Right (and Home/End) switch tabs.
 */
export function Tabs({
  tabs,
  tabIndex,
  defaultTabIndex = 0,
  onTabChange,
  className,
  listClassName,
  "aria-label": ariaLabel,
}: TabsProps) {
  const isControlled = tabIndex !== undefined;
  const [internal, setInternal] = React.useState(defaultTabIndex);
  const active = isControlled ? tabIndex : internal;
  const baseId = React.useId();
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const select = (i: number) => {
    if (!isControlled) setInternal(i);
    onTabChange?.(i);
  };

  const enabled = tabs
    .map((tab, i) => (tab.disabled ? -1 : i))
    .filter((i) => i >= 0);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const pos = enabled.indexOf(index);
    let next: number | undefined;
    switch (e.key) {
      case "ArrowRight":
        next = enabled[(pos + 1) % enabled.length];
        break;
      case "ArrowLeft":
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
    select(next);
  };

  const tabId = (i: number) => `${baseId}-tab-${i}`;
  const panelId = (i: number) => `${baseId}-panel-${i}`;
  const hasPanel = tabs[active]?.content !== undefined;

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          "flex shrink-0 items-center gap-1 border-b border-hairline px-3 sm:px-4",
          listClassName,
        )}
      >
        {tabs.map((tab, i) => {
          const on = i === active;
          return (
            <button
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={tabId(i)}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={on && hasPanel ? panelId(i) : undefined}
              tabIndex={on ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => select(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13.5px] font-semibold transition-colors duration-150 outline-none -mb-px cursor-pointer",
                "focus-visible:!rounded-t-md focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40",
                "disabled:cursor-not-allowed disabled:opacity-50",
                on
                  ? "border-brand text-ink-1"
                  : "border-transparent text-ink-3 hover:text-ink-1",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
      {hasPanel ? (
        <div
          role="tabpanel"
          id={panelId(active)}
          aria-labelledby={tabId(active)}
          tabIndex={0}
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/30"
        >
          {tabs[active]?.content}
        </div>
      ) : null}
    </div>
  );
}
