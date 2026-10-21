import { ChevronDown, PanelLeft, PanelLeftClose } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { defineMessages } from "../i18n/messages";
import { useMessages } from "./TajUIProvider";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

const sidebarMessages = defineMessages("sidebar", {
  ru: {
    navigation: "Основная навигация",
    expand: "Развернуть меню",
    collapse: "Свернуть меню",
    collapseShort: "Свернуть",
  },
  tg: {
    navigation: "Навигатсияи асосӣ",
    expand: "Кушодани меню",
    collapse: "Печондани меню",
    collapseShort: "Печондан",
  },
  en: {
    navigation: "Main navigation",
    expand: "Expand sidebar",
    collapse: "Collapse sidebar",
    collapseShort: "Collapse",
  },
});

export type SidebarLabels = Partial<(typeof sidebarMessages.locales)["ru"]>;

/** Props handed to `renderLink` — spread them onto your router's link. */
export interface SidebarLinkProps {
  href: string;
  className: string;
  style?: React.CSSProperties;
  "aria-current"?: "page";
  "aria-disabled"?: true;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  children: React.ReactNode;
}

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
  /**
   * Render leaf links with your router (React Router, TanStack, Next) instead
   * of a plain `<a>`, so navigation does not reload the page:
   *
   *   renderLink={({ href, ...p }) => <NavLink to={href} {...p} />}
   */
  renderLink?: (props: SidebarLinkProps) => React.ReactNode;
  /** Override UI strings (defaults follow the TajUIProvider locale). */
  labels?: SidebarLabels;
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
      renderLink,
      labels,
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(sidebarMessages, labels);
    const baseId = React.useId();
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

    const activeAncestors = React.useMemo(
      () => new Set(ancestorsOf(items, currentActive)),
      [items, currentActive],
    );

    const [expanded, setExpanded] = React.useState<Set<string>>(
      () => new Set(ancestorsOf(items, currentActive ?? defaultActiveId)),
    );

    // When the active page changes (e.g. router navigation), open its groups.
    React.useEffect(() => {
      if (activeAncestors.size === 0) return;
      setExpanded((prev) => {
        let changed = false;
        const next = new Set(prev);
        activeAncestors.forEach((id) => {
          if (!next.has(id)) {
            next.add(id);
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, [activeAncestors]);

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
      const containsActive = hasChildren && activeAncestors.has(id);
      const groupId = `${baseId}-g-${id}`;

      const rowBase =
        "group flex w-full min-h-control-sm items-center gap-2.5 !rounded-lg px-2.5 py-1.5 text-ui-body font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-rail-ink/40 cursor-pointer disabled:pointer-events-none disabled:opacity-40";
      const rowState = isActive
        ? "bg-brand-solid text-on-brand shadow-tj-sm"
        : containsActive
          ? "text-rail-ink hover:bg-rail-hover"
          : "text-rail-ink-muted hover:bg-rail-hover hover:text-rail-ink";

      // Collapsed rows are icon-only: show the label in a tooltip.
      const withTooltip = (node: React.ReactElement) =>
        isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{node}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ) : (
          node
        );

      const indent =
        !isCollapsed && depth > 0 ? { paddingLeft: 12 + depth * 16 } : undefined;

      const iconNode = item.icon ? (
        <span
          aria-hidden
          className="grid size-5 shrink-0 place-items-center [&>svg]:size-[18px]"
        >
          {item.icon}
        </span>
      ) : null;

      // Collapsed rows keep the label for assistive tech (icon-only visually).
      const labelNode = isCollapsed ? (
        <span className="sr-only">{item.label}</span>
      ) : (
        <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
      );

      const badgeNode =
        item.badge != null && !isCollapsed ? (
          <span className="ml-auto inline-flex shrink-0 items-center !rounded-full bg-rail-hover px-1.5 py-0.5 text-ui-caption font-semibold text-rail-ink">
            {item.badge}
          </span>
        ) : null;

      // Group with children
      if (hasChildren) {
        return (
          <li key={id}>
            {withTooltip(
            <button
              type="button"
              disabled={item.disabled}
              aria-expanded={isCollapsed ? false : isOpen}
              aria-controls={isOpen && !isCollapsed ? groupId : undefined}
              onClick={() => {
                // From the icon rail, expand the rail and open the group.
                if (isCollapsed) {
                  setCollapsed(false);
                  if (!isOpen) toggle(id);
                } else toggle(id);
              }}
              className={cn(rowBase, rowState)}
              style={indent}
            >
              {iconNode}
              {labelNode}
              {badgeNode}
              {!isCollapsed ? (
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "size-4 shrink-0 text-rail-ink-muted transition-transform duration-200 ease-tj-out",
                    isOpen && "rotate-180",
                  )}
                />
              ) : null}
            </button>,
            )}
            {isOpen && !isCollapsed ? (
              <ul id={groupId} className="mt-0.5 flex flex-col gap-0.5">
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

      const linkClass = cn(
        rowBase,
        rowState,
        item.disabled && "pointer-events-none opacity-40",
      );
      const onLinkClick = (e: React.MouseEvent<HTMLElement>) => {
        if (item.disabled) e.preventDefault();
        else select(id, item);
      };

      let row: React.ReactElement;
      if (item.href && renderLink && !item.disabled) {
        // Wrap so the tooltip trigger gets a DOM element with a ref.
        row = (
          <span className="block">
            {renderLink({
              href: item.href,
              className: linkClass,
              style: indent,
              "aria-current": isActive ? "page" : undefined,
              onClick: onLinkClick,
              children: content,
            })}
          </span>
        );
      } else if (item.href) {
        row = (
          <a
            href={item.disabled ? undefined : item.href}
            aria-current={isActive ? "page" : undefined}
            aria-disabled={item.disabled || undefined}
            onClick={onLinkClick}
            className={linkClass}
            style={indent}
          >
            {content}
          </a>
        );
      } else {
        row = (
          <button
            type="button"
            disabled={item.disabled}
            aria-current={isActive ? "page" : undefined}
            onClick={() => select(id, item)}
            className={cn(rowBase, rowState)}
            style={indent}
          >
            {content}
          </button>
        );
      }

      return <li key={id}>{withTooltip(row)}</li>;
    };

    return (
      <nav
        ref={ref}
        data-slot="sidebar"
        data-collapsed={isCollapsed || undefined}
        aria-label={ariaLabel ?? t.navigation}
        className={cn(
          "flex h-full flex-col bg-ui-rail text-rail-ink transition-[width] duration-200 ease-tj-out motion-reduce:transition-none",
          isCollapsed ? "w-[4.5rem]" : "w-64",
          className,
        )}
        {...props}
      >
        {header ? (
          <div
            data-slot="sidebar-header"
            className="flex shrink-0 items-center gap-2 border-b border-rail-border px-2.5 py-3"
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
            aria-label={isCollapsed ? t.expand : t.collapse}
            aria-expanded={!isCollapsed}
            onClick={() => setCollapsed(!isCollapsed)}
            className="flex min-h-control-sm shrink-0 items-center gap-2.5 border-t border-rail-border px-2.5 py-2.5 text-ui-label font-medium text-rail-ink-muted outline-none transition-colors hover:text-rail-ink focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rail-ink/40 cursor-pointer"
          >
            <span className="grid size-5 shrink-0 place-items-center">
              {isCollapsed ? (
                <PanelLeft className="size-[18px]" aria-hidden />
              ) : (
                <PanelLeftClose className="size-[18px]" aria-hidden />
              )}
            </span>
            {!isCollapsed ? <span aria-hidden>{t.collapseShort}</span> : null}
          </button>
        ) : null}

        {footer ? (
          <div
            data-slot="sidebar-footer"
            className="flex shrink-0 items-center gap-2 border-t border-rail-border px-2.5 py-3"
          >
            {footer}
          </div>
        ) : null}
      </nav>
    );
  },
);
Sidebar.displayName = "Sidebar";
