import { ChevronDown, PanelLeft, PanelLeftClose } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export interface SidebarItem {
  /** Stable id. Falls back to the item's position in the tree. */
  id?: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Renders the row as a link. Leaf items without `href` render as buttons. */
  href?: string;
  onClick?: () => void;
  badge?: React.ReactNode;
  disabled?: boolean;
  children?: SidebarItem[];
}

export interface SidebarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> {
  items: SidebarItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /** Controlled collapsed (icon-only) state. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Show the built-in collapse toggle. Defaults to true. */
  collapsible?: boolean;
  /** Controlled active leaf id. */
  activeId?: string;
  defaultActiveId?: string;
  onSelect?: (id: string, item: SidebarItem) => void;
}

/** Collect the ids of every ancestor group that contains `activeId`. */
function ancestorsOf(
  items: SidebarItem[],
  activeId: string | undefined,
  path = "",
): string[] {
  if (!activeId) return [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const id = item.id ?? `${path}${i}`;
    if (id === activeId) return [];
    if (item.children?.length) {
      const sub = ancestorsOf(item.children, activeId, `${id}.`);
      if (
        sub.length ||
        item.children.some(
          (c, j) => (c.id ?? `${id}.${j}`) === activeId,
        )
      ) {
        return [id, ...sub];
      }
    }
  }
  return [];
}

/**
 * Data-driven navigation rail with pinned header/footer, multilevel groups and
 * an optional collapsed (icon-only) mode.
 */
export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      items,
      header,
      footer,
      collapsed,
      defaultCollapsed = false,
      onCollapsedChange,
      collapsible = true,
      activeId,
      defaultActiveId,
      onSelect,
      className,
      ...props
    },
    ref,
  ) => {
    const isCollapsedControlled = collapsed !== undefined;
    const [internalCollapsed, setInternalCollapsed] =
      React.useState(defaultCollapsed);
    const isCollapsed = isCollapsedControlled ? collapsed : internalCollapsed;

    const setCollapsed = (next: boolean) => {
      if (!isCollapsedControlled) setInternalCollapsed(next);
      onCollapsedChange?.(next);
    };

    const isActiveControlled = activeId !== undefined;
    const [internalActive, setInternalActive] = React.useState(defaultActiveId);
    const currentActive = isActiveControlled ? activeId : internalActive;

    const [expanded, setExpanded] = React.useState<Set<string>>(
      () => new Set(ancestorsOf(items, currentActive ?? defaultActiveId)),
    );

    const toggle = (id: string) =>
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });

    const select = (id: string, item: SidebarItem) => {
      if (!isActiveControlled) setInternalActive(id);
      onSelect?.(id, item);
      item.onClick?.();
    };

    const renderItem = (item: SidebarItem, idx: number, path: string, depth: number) => {
      const id = item.id ?? `${path}${idx}`;
      const hasChildren = !!item.children?.length;
      const isOpen = expanded.has(id);
      const isActive = id === currentActive;
      const title =
        isCollapsed && typeof item.label === "string" ? item.label : undefined;

      const rowBase =
        "group flex w-full items-center gap-2.5 !rounded-lg px-2.5 py-1.5 text-[13.5px] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer disabled:pointer-events-none disabled:opacity-40";
      const rowState = isActive
        ? "bg-brand text-on-brand shadow-tj-sm"
        : "text-white/65 hover:bg-white/10 hover:text-white";

      const indent =
        !isCollapsed && depth > 0 ? { paddingLeft: 12 + depth * 16 } : undefined;

      const iconNode = item.icon ? (
        <span className="grid size-5 shrink-0 place-items-center [&>svg]:size-[18px]">
          {item.icon}
        </span>
      ) : null;

      const labelNode = isCollapsed ? null : (
        <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
      );

      const badgeNode =
        item.badge != null && !isCollapsed ? (
          <span className="ml-auto inline-flex shrink-0 items-center !rounded-full bg-white/15 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {item.badge}
          </span>
        ) : null;

      // Group with children
      if (hasChildren) {
        return (
          <li key={id}>
            <button
              type="button"
              title={title}
              disabled={item.disabled}
              aria-expanded={isOpen}
              onClick={() => (isCollapsed ? setCollapsed(false) : toggle(id))}
              className={cn(rowBase, rowState)}
              style={indent}
            >
              {iconNode}
              {labelNode}
              {badgeNode}
              {!isCollapsed ? (
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-white/50 transition-transform duration-200 ease-tj-out",
                    isOpen && "rotate-180",
                  )}
                />
              ) : null}
            </button>
            {isOpen && !isCollapsed ? (
              <ul className="mt-0.5 flex flex-col gap-0.5">
                {item.children!.map((child, j) =>
                  renderItem(child, j, `${id}.`, depth + 1),
                )}
              </ul>
            ) : null}
          </li>
        );
      }

      // Leaf
      const content = (
        <>
          {iconNode}
          {labelNode}
          {badgeNode}
        </>
      );

      return (
        <li key={id}>
          {item.href ? (
            <a
              href={item.href}
              title={title}
              aria-current={isActive ? "page" : undefined}
              onClick={() => !item.disabled && select(id, item)}
              className={cn(rowBase, rowState, item.disabled && "pointer-events-none opacity-40")}
              style={indent}
            >
              {content}
            </a>
          ) : (
            <button
              type="button"
              title={title}
              disabled={item.disabled}
              aria-current={isActive ? "page" : undefined}
              onClick={() => select(id, item)}
              className={cn(rowBase, rowState)}
              style={indent}
            >
              {content}
            </button>
          )}
        </li>
      );
    };

    return (
      <nav
        ref={ref}
        data-slot="sidebar"
        data-collapsed={isCollapsed || undefined}
        className={cn(
          "flex h-full flex-col bg-ui-rail text-white transition-[width] duration-200 ease-tj-out",
          isCollapsed ? "w-[4.5rem]" : "w-64",
          className,
        )}
        {...props}
      >
        {header ? (
          <div
            data-slot="sidebar-header"
            className="flex shrink-0 items-center gap-2 border-b border-white/10 px-2.5 py-3"
          >
            {header}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-2.5">
          <ul className="flex flex-col gap-0.5">
            {items.map((item, i) => renderItem(item, i, "", 0))}
          </ul>
        </div>

        {collapsible ? (
          <button
            type="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed(!isCollapsed)}
            className="flex shrink-0 items-center gap-2.5 border-t border-white/10 px-2.5 py-2.5 text-[13px] font-medium text-white/55 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
          >
            <span className="grid size-5 shrink-0 place-items-center">
              {isCollapsed ? (
                <PanelLeft className="size-[18px]" />
              ) : (
                <PanelLeftClose className="size-[18px]" />
              )}
            </span>
            {!isCollapsed ? <span>Collapse</span> : null}
          </button>
        ) : null}

        {footer ? (
          <div
            data-slot="sidebar-footer"
            className="flex shrink-0 items-center gap-2 border-t border-white/10 px-2.5 py-3"
          >
            {footer}
          </div>
        ) : null}
      </nav>
    );
  },
);
Sidebar.displayName = "Sidebar";
