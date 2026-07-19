import * as React from "react";

import { cn } from "../lib/cn";

export interface TabItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  content?: React.ReactNode;
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
}

/**
 * Pill/underline tab strip with panels. Controlled via `tabIndex`/`onTabChange`
 * or uncontrolled via `defaultTabIndex`.
 */
export function Tabs({
  tabs,
  tabIndex,
  defaultTabIndex = 0,
  onTabChange,
  className,
  listClassName,
}: TabsProps) {
  const isControlled = tabIndex !== undefined;
  const [internal, setInternal] = React.useState(defaultTabIndex);
  const active = isControlled ? tabIndex : internal;

  const select = (i: number) => {
    if (!isControlled) setInternal(i);
    onTabChange?.(i);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        role="tablist"
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
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => select(i)}
              className={cn(
                "inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13.5px] font-semibold transition-colors duration-150 outline-none -mb-px cursor-pointer",
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
      {tabs[active]?.content !== undefined ? (
        <div
          role="tabpanel"
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        >
          {tabs[active]?.content}
        </div>
      ) : null}
    </div>
  );
}
