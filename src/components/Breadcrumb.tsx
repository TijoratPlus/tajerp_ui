import { ChevronRight, MoreHorizontal } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { defineMessages } from "../i18n/messages";
import { useMessages } from "./TajUIProvider";

const breadcrumbMessages = defineMessages("breadcrumb", {
  ru: { label: "Навигационная цепочка", more: "Скрытые разделы" },
  tg: { label: "Пайроҳа", more: "Бахшҳои пинҳон" },
  en: { label: "Breadcrumb", more: "Hidden sections" },
});

/** Props handed to `renderLink` — spread them onto your router's link. */
export interface BreadcrumbLinkProps {
  href: string;
  className: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  children: React.ReactNode;
}

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export interface BreadcrumbProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  items: BreadcrumbItem[];
  /** Separator between crumbs. Defaults to a chevron. */
  separator?: React.ReactNode;
  /**
   * Collapse the middle of long trails into an ellipsis, always keeping the
   * first crumb and the last `maxItems - 1` crumbs visible.
   */
  maxItems?: number;
  /** Render crumbs with your router's link component (no page reload). */
  renderLink?: (props: BreadcrumbLinkProps) => React.ReactNode;
  labels?: Partial<(typeof breadcrumbMessages.locales)["ru"]>;
}

const sep = (separator: React.ReactNode) => (
  <li
    aria-hidden
    className="flex items-center text-ink-4"
    data-slot="breadcrumb-separator"
  >
    {separator ?? <ChevronRight className="size-3.5" />}
  </li>
);

const crumbLinkClass =
  "!rounded-sm text-ink-3 outline-none transition-colors duration-150 hover:text-brand-ink focus-visible:ring-2 focus-visible:ring-focus";

/** Data-driven breadcrumb trail. The last item is rendered as the current page. */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator, maxItems, renderLink, labels, className, ...props }, ref) => {
    const t = useMessages(breadcrumbMessages, labels);
    const collapsed =
      maxItems !== undefined && maxItems > 1 && items.length > maxItems;

    const visible: Array<BreadcrumbItem | "ellipsis"> = collapsed
      ? [items[0], "ellipsis", ...items.slice(items.length - (maxItems - 1))]
      : items;

    return (
      <nav
        ref={ref}
        aria-label={t.label}
        data-slot="breadcrumb"
        className={cn("flex", className)}
        {...props}
      >
        <ol className="flex min-w-0 flex-nowrap items-center gap-1.5 text-ui-label font-medium">
          {visible.map((item, i) => {
            const isLast = i === visible.length - 1;

            if (item === "ellipsis") {
              return (
                <React.Fragment key="ellipsis">
                  <li className="flex items-center text-ink-3">
                    <MoreHorizontal className="size-4" aria-hidden />
                    <span className="sr-only">{t.more}</span>
                  </li>
                  {sep(separator)}
                </React.Fragment>
              );
            }

            // The current page truncates with an ellipsis; earlier crumbs keep their width.
            const content = (
              <span className={cn("inline-flex items-center gap-1.5", isLast && "min-w-0 max-w-full")}>
                {item.icon}
                {isLast ? <span className="truncate">{item.label}</span> : item.label}
              </span>
            );

            return (
              <React.Fragment key={i}>
                <li className={cn("flex items-center", isLast ? "min-w-0" : "shrink-0")}>
                  {isLast || !item.href ? (
                    <span
                      aria-current={isLast ? "page" : undefined}
                      className={isLast ? "flex min-w-0 text-ink-1" : "text-ink-3"}
                    >
                      {content}
                    </span>
                  ) : renderLink ? (
                    renderLink({
                      href: item.href,
                      onClick: item.onClick,
                      className: crumbLinkClass,
                      children: content,
                    })
                  ) : (
                    <a href={item.href} onClick={item.onClick} className={crumbLinkClass}>
                      {content}
                    </a>
                  )}
                </li>
                {isLast ? null : sep(separator)}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    );
  },
);
Breadcrumb.displayName = "Breadcrumb";
