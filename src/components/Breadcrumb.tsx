import { ChevronRight, MoreHorizontal } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

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

/** Data-driven breadcrumb trail. The last item is rendered as the current page. */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator, maxItems, className, ...props }, ref) => {
    const collapsed =
      maxItems !== undefined && maxItems > 1 && items.length > maxItems;

    const visible: Array<BreadcrumbItem | "ellipsis"> = collapsed
      ? [items[0], "ellipsis", ...items.slice(items.length - (maxItems - 1))]
      : items;

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        data-slot="breadcrumb"
        className={cn("flex", className)}
        {...props}
      >
        <ol className="flex flex-wrap items-center gap-1.5 text-[13px] font-medium">
          {visible.map((item, i) => {
            const isLast = i === visible.length - 1;

            if (item === "ellipsis") {
              return (
                <React.Fragment key="ellipsis">
                  <li className="flex items-center text-ink-3">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">More</span>
                  </li>
                  {sep(separator)}
                </React.Fragment>
              );
            }

            const content = (
              <span className="inline-flex items-center gap-1.5">
                {item.icon}
                {item.label}
              </span>
            );

            return (
              <React.Fragment key={i}>
                <li className="flex items-center">
                  {isLast || !item.href ? (
                    <span
                      aria-current={isLast ? "page" : undefined}
                      className={isLast ? "text-ink-1" : "text-ink-3"}
                    >
                      {content}
                    </span>
                  ) : (
                    <a
                      href={item.href}
                      onClick={item.onClick}
                      className="!rounded-sm text-ink-3 outline-none transition-colors duration-150 hover:text-brand-ink focus-visible:ring-2 focus-visible:ring-brand/30"
                    >
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
