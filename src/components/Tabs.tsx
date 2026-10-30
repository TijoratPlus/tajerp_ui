import { ChevronDown } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { useRovingFocus } from "../lib/useRovingFocus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { useMessages } from "./TajUIProvider";

export const tabsMessages = defineMessages("tabs", {
  ru: { more: "Ещё" },
  tg: { more: "Боз" },
  en: { more: "More" },
});

export type TabsLabels = Partial<(typeof tabsMessages.locales)["ru"]>;

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
  /**
   * What happens when the tabs do not fit: `"scroll"` (default) scrolls the
   * strip sideways; `"menu"` moves the tabs that do not fit into a trailing
   * "More" menu. The active tab always stays in the strip.
   */
  overflow?: "scroll" | "menu";
  className?: string;
  /** Classes for the tab strip. */
  listClassName?: string;
  /** Classes for each panel. */
  panelClassName?: string;
  /** Accessible name for the tab strip. */
  "aria-label"?: string;
  /** Override UI strings ("More"). */
  labels?: TabsLabels;
}

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/** Gap between triggers (`gap-1`). */
const GAP = 4;

/**
 * How many tabs fit into `available` px, given each trigger's width and the
 * "More" button's width. Pure, so it is unit-tested without layout.
 */
export function fitTabs(widths: number[], moreWidth: number, available: number): number {
  const n = widths.length;
  const total = widths.reduce((a, w) => a + w, 0) + GAP * Math.max(0, n - 1);
  if (total <= available) return n;
  let used = moreWidth;
  let count = 0;
  for (const w of widths) {
    const next = used + w + GAP;
    if (next > available) break;
    used = next;
    count++;
  }
  return Math.max(1, count);
}

/**
 * Underline/pill tab strip with panels. Controlled via `tabIndex`/`onTabChange`
 * or uncontrolled via `defaultTabIndex`.
 *
 * Follows the WAI-ARIA tabs pattern: Tab moves into the strip and on to the
 * panel; Left/Right (and Home/End) switch tabs. With `overflow="menu"` the
 * tabs that do not fit are listed in a "More" menu after the strip.
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
      overflow = "scroll",
      className,
      listClassName,
      panelClassName,
      "aria-label": ariaLabel,
      labels,
    },
    ref,
  ) => {
    const t = useMessages(tabsMessages, labels);
    const isControlled = tabIndex !== undefined;
    const [internal, setInternal] = React.useState(defaultTabIndex);
    const active = isControlled ? tabIndex : internal;
    const baseId = React.useId();
    const menuMode = overflow === "menu";

    const select = (i: number) => {
      if (!isControlled) setInternal(i);
      onTabChange?.(i);
    };

    // ── Overflow: measure every trigger once in a hidden row ──────────────
    const stripRef = React.useRef<HTMLDivElement>(null);
    const measureRef = React.useRef<HTMLDivElement>(null);
    /** Tab chosen from the "More" menu; focused once the menu closes. */
    const pendingFocus = React.useRef<number | null>(null);
    const [fitCount, setFitCount] = React.useState(tabs.length);

    const measure = React.useCallback(() => {
      const strip = stripRef.current;
      const row = measureRef.current;
      if (!strip || !row) return;
      const items = Array.from(row.querySelectorAll<HTMLElement>("[data-measure-tab]"));
      const more = row.querySelector<HTMLElement>("[data-measure-more]");
      const style = window.getComputedStyle(strip);
      const pad = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      // Pills sit in a padded track (p-1) inside the strip.
      const chrome = variant === "pills" ? 8 : 0;
      const available = strip.clientWidth - pad - chrome;
      const next = fitTabs(
        items.map((el) => el.offsetWidth),
        (more?.offsetWidth ?? 0) + GAP,
        available,
      );
      setFitCount((prev) => (prev === next ? prev : next));
    }, [variant]);

    useIsoLayoutEffect(() => {
      if (!menuMode) return;
      measure();
    }, [menuMode, measure, tabs]);

    React.useEffect(() => {
      if (!menuMode || typeof ResizeObserver === "undefined") return;
      const strip = stripRef.current;
      if (!strip) return;
      const ro = new ResizeObserver(() => measure());
      ro.observe(strip);
      return () => ro.disconnect();
    }, [menuMode, measure]);

    /** Tab indices shown in the strip, in order; the active one is always included. */
    const visible = React.useMemo(() => {
      const all = tabs.map((_, i) => i);
      if (!menuMode || fitCount >= tabs.length) return all;
      const head = all.slice(0, fitCount);
      if (active < fitCount || active >= tabs.length) return head;
      return [...all.slice(0, fitCount - 1), active];
    }, [tabs, menuMode, fitCount, active]);
    const hidden = React.useMemo(
      () => (menuMode ? tabs.map((_, i) => i).filter((i) => !visible.includes(i)) : []),
      [tabs, menuMode, visible],
    );

    const isDisabled = React.useCallback(
      (pos: number) => !!tabs[visible[pos]]?.disabled,
      [tabs, visible],
    );
    const roving = useRovingFocus({
      count: visible.length,
      isDisabled,
      orientation: "horizontal",
      onMove: (pos) => select(visible[pos]),
    });

    const tabId = (i: number) => `${baseId}-tab-${i}`;
    const panelId = (i: number) => `${baseId}-panel-${i}`;
    const hasPanels = tabs.some((tab) => tab.content !== undefined);

    const triggerBase =
      "inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-ui-body font-semibold transition-colors duration-150 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";
    const triggerVariant = (on: boolean) =>
      variant === "underline"
        ? cn(
            "-mb-px min-h-control-md border-b-2 px-3 py-2 focus-visible:!rounded-t-md focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus",
            on ? "border-brand text-ink-1" : "border-transparent text-ink-3 hover:text-ink-1",
          )
        : cn(
            "min-h-control-sm !rounded-md px-3 py-1.5 focus-visible:ring-2 focus-visible:ring-focus",
            on ? "bg-ui-surface text-ink-1 shadow-tj-sm" : "text-ink-3 hover:text-ink-1",
          );

    const badgeNode = (tab: TabItem) =>
      tab.badge != null ? (
        <span className="inline-flex min-w-5 items-center justify-center !rounded-pill bg-mist px-1.5 text-ui-caption font-bold text-mist-ink">
          {tab.badge}
        </span>
      ) : null;

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

    const triggers = visible.map((i, pos) => {
      const tab = tabs[i];
      const on = i === active;
      return (
        <button
          key={tab.id ?? i}
          ref={roving.setRef(pos)}
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
          onKeyDown={(e) => roving.onKeyDown(e, pos)}
          className={cn(triggerBase, triggerVariant(on))}
        >
          {tab.icon}
          {tab.label}
          {badgeNode(tab)}
        </button>
      );
    });

    const panels = keepMounted
      ? tabs.map((tab, i) => (tab.content !== undefined ? panel(i) : null))
      : tabs[active]?.content !== undefined
        ? panel(active)
        : null;

    if (!menuMode) {
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
            {triggers}
          </div>
          {panels}
        </div>
      );
    }

    const moreButton = hidden.length ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-slot="tabs-more"
            // The active tab is always in the strip, so "More" is never the active trigger.
            className={cn(triggerBase, triggerVariant(false))}
          >
            {t.more}
            <span className="sr-only"> ({hidden.length})</span>
            <ChevronDown aria-hidden className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onCloseAutoFocus={(e) => {
            const i = pendingFocus.current;
            pendingFocus.current = null;
            if (i === null) return;
            // Land on the tab that was just chosen, not on "More".
            e.preventDefault();
            requestAnimationFrame(() => document.getElementById(tabId(i))?.focus());
          }}
        >
          {hidden.map((i) => {
            const tab = tabs[i];
            return (
              <DropdownMenuItem
                key={tab.id ?? i}
                disabled={tab.disabled}
                data-slot="tabs-menu-item"
                onSelect={() => {
                  pendingFocus.current = i;
                  select(i);
                }}
              >
                {tab.icon}
                <span className="min-w-0 flex-1 truncate">{tab.label}</span>
                {badgeNode(tab)}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null;

    // Hidden row with every trigger, used only to measure widths.
    const measurer = (
      <div
        ref={measureRef}
        aria-hidden
        data-slot="tabs-measure"
        className="pointer-events-none invisible absolute top-0 left-0 flex h-0 w-max gap-1 overflow-hidden"
      >
        {tabs.map((tab, i) => (
          <span key={tab.id ?? i} data-measure-tab="" className={cn(triggerBase, triggerVariant(false))}>
            {tab.icon}
            {tab.label}
            {badgeNode(tab)}
          </span>
        ))}
        <span data-measure-more="" className={cn(triggerBase, triggerVariant(false))}>
          {t.more}
          <ChevronDown aria-hidden className="size-4" />
        </span>
      </div>
    );

    const list = (
      <div
        role="tablist"
        aria-label={ariaLabel}
        data-slot="tabs-list"
        className="flex min-w-0 items-center gap-1 overflow-hidden"
      >
        {triggers}
      </div>
    );

    return (
      <div ref={ref} data-slot="tabs" data-overflow="menu" className={cn("flex flex-col", className)}>
        <div
          ref={stripRef}
          data-slot="tabs-strip"
          className={cn(
            "relative flex min-w-0 shrink-0 items-center",
            variant === "underline" && "gap-1 border-b border-hairline px-3 sm:px-4",
            listClassName,
          )}
        >
          {variant === "pills" ? (
            <div className="flex max-w-full min-w-0 items-center gap-1 !rounded-lg bg-ui-surface-2 p-1">
              {list}
              {moreButton}
            </div>
          ) : (
            <>
              {list}
              {moreButton}
            </>
          )}
          {measurer}
        </div>
        {panels}
      </div>
    );
  },
);
Tabs.displayName = "Tabs";
