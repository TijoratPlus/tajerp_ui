import * as React from "react";

import { cn } from "../lib/cn";
import { useRovingFocus } from "../lib/useRovingFocus";

export interface TabItem {
  /** Stable key. Falls back to the tab's index. */
  id?: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
  /** Counter shown after the label (e.g. pending approvals). */
  badge?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  /** Controlled active index. */
  tabIndex?: number;
  /** Uncontrolled initial index. */
  defaultTabIndex?: number;
  onTabChange?: (index: number) => void;
  /**
   * Keep inactive panels mounted (hidden) so their state — scroll position,
   * half-filled forms — survives switching tabs.
   */
  keepMounted?: boolean;
  /** Visual style: underlined strip (default) or pill segments. */
  variant?: "underline" | "pills";
  className?: string;
  /** Classes for the tab strip. */
  listClassName?: string;
  /** Classes for each panel. */
  panelClassName?: string;
  /** Accessible name for the tab strip. */
  "aria-label"?: string;
}

/**
 * Underline/pill tab strip with panels. Controlled via `tabIndex`/`onTabChange`
 * or uncontrolled via `defaultTabIndex`.
 *
 * Follows the WAI-ARIA tabs pattern: Tab moves into the strip and on to the
 * panel; Left/Right (and Home/End) switch tabs.
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      tabs,
      tabIndex,
      defaultTabIndex = 0,
      onTabChange,
      keepMounted = false,
      variant = "underline",
      className,
      listClassName,
      panelClassName,
      "aria-label": ariaLabel,
    },
    ref,
  ) => {
    const isControlled = tabIndex !== undefined;
    const [internal, setInternal] = React.useState(defaultTabIndex);
    const active = isControlled ? tabIndex : internal;
    const baseId = React.useId();

    const select = (i: number) => {
      if (!isControlled) setInternal(i);
      onTabChange?.(i);
    };

    const isDisabled = React.useCallback(
      (i: number) => !!tabs[i]?.disabled,
      [tabs],
    );
    const roving = useRovingFocus({
      count: tabs.length,
      isDisabled,
      orientation: "horizontal",
      onMove: select,
    });

    const tabId = (i: number) => `${baseId}-tab-${i}`;
    const panelId = (i: number) => `${baseId}-panel-${i}`;
    const hasPanels = tabs.some((t) => t.content !== undefined);

    const panel = (i: number) => (
      <div
        key={tabs[i].id ?? i}
        role="tabpanel"
        id={panelId(i)}
        aria-labelledby={tabId(i)}
        hidden={i !== active}
        tabIndex={0}
        data-slot="tabs-panel"
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus",
          panelClassName,
        )}
      >
        {tabs[i].content}
      </div>
    );

    return (
      <div ref={ref} data-slot="tabs" className={cn("flex flex-col", className)}>
        <div
          role="tablist"
          aria-label={ariaLabel}
          data-slot="tabs-list"
          className={cn(
            "flex shrink-0 items-center gap-1",
            variant === "underline"
              ? // Many tabs scroll sideways instead of wrapping; the bar itself stays hidden.
                "overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-hairline px-3 sm:px-4"
              : "w-fit !rounded-lg bg-ui-surface-2 p-1",
            listClassName,
          )}
        >
          {tabs.map((tab, i) => {
            const on = i === active;
            return (
              <button
                key={tab.id ?? i}
                ref={roving.setRef(i)}
                id={tabId(i)}
                role="tab"
                type="button"
                data-slot="tabs-trigger"
                data-state={on ? "active" : "inactive"}
                aria-selected={on}
                aria-controls={hasPanels && tab.content !== undefined ? panelId(i) : undefined}
                tabIndex={on ? 0 : -1}
                disabled={tab.disabled}
                onClick={() => select(i)}
                onKeyDown={(e) => roving.onKeyDown(e, i)}
                className={cn(
                  "inline-flex min-h-control-sm shrink-0 items-center gap-1.5 whitespace-nowrap text-ui-body font-semibold transition-colors duration-150 outline-none cursor-pointer",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  variant === "underline"
                    ? cn(
                        "-mb-px border-b-2 px-3 py-2 focus-visible:!rounded-t-md focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus",
                        on
                          ? "border-brand text-ink-1"
                          : "border-transparent text-ink-3 hover:text-ink-1",
                      )
                    : cn(
                        "!rounded-md px-3 py-1.5 focus-visible:ring-2 focus-visible:ring-focus",
                        on
                          ? "bg-ui-surface text-ink-1 shadow-tj-sm"
                          : "text-ink-3 hover:text-ink-1",
                      ),
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.badge != null ? (
                  <span className="inline-flex min-w-5 items-center justify-center !rounded-pill bg-mist px-1.5 text-ui-caption font-bold text-mist-ink">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {keepMounted
          ? tabs.map((t, i) => (t.content !== undefined ? panel(i) : null))
          : tabs[active]?.content !== undefined
            ? panel(active)
            : null}
      </div>
    );
  },
);
Tabs.displayName = "Tabs";
