import * as React from "react";

import { cn } from "../lib/cn";
import { AppShellMenuButton } from "./AppShell";

export interface TopbarProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "title"
> {
  /** Leading slot: page title or breadcrumbs. */
  start?: React.ReactNode;
  /** Middle slot: global search. */
  center?: React.ReactNode;
  /** Trailing slot: actions, BranchSwitcher, LanguageSwitcher, user menu. */
  end?: React.ReactNode;
  /**
   * Prepend the AppShell's hamburger button (shown only below the shell's
   * mobile breakpoint). Set to false when you place `<AppShellMenuButton>`
   * yourself. Defaults to true.
   */
  menuButton?: boolean;
  /** Stick to the top of the scroll container. Defaults to true. */
  sticky?: boolean;
}

/**
 * Application header bar with start / center / end slots. Inside an
 * `<AppShell>` it adds the mobile navigation button automatically.
 */
export const Topbar = React.forwardRef<HTMLElement, TopbarProps>(
  (
    {
      start,
      center,
      end,
      menuButton = true,
      sticky = true,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const middle = center ?? children;
    return (
      <header
        ref={ref}
        data-slot="topbar"
        className={cn(
          "box-content flex h-14 shrink-0 items-center gap-3 border-b border-hairline bg-ui-surface px-3 pt-[env(safe-area-inset-top)] sm:px-4 lg:px-6",
          sticky && "sticky top-0 z-(--tj-z-sticky)",
          className,
        )}
        {...props}
      >
        <div
          data-slot="topbar-start"
          className={cn(
            "flex min-w-0 items-center gap-2",
            middle == null && "flex-1",
          )}
        >
          {menuButton ? <AppShellMenuButton /> : null}
          {start}
        </div>
        {middle != null ? (
          <div
            data-slot="topbar-center"
            className="flex min-w-0 flex-1 items-center justify-center"
          >
            {middle}
          </div>
        ) : null}
        {end != null ? (
          <div
            data-slot="topbar-end"
            className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2"
          >
            {end}
          </div>
        ) : null}
      </header>
    );
  },
);
Topbar.displayName = "Topbar";

export type TopbarTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  /** Heading element. Defaults to "h1". */
  as?: "h1" | "h2" | "div";
};

/** Truncating page title for the Topbar's start slot. */
export const TopbarTitle = React.forwardRef<
  HTMLHeadingElement,
  TopbarTitleProps
>(({ as: Tag = "h1", className, ...props }, ref) => (
  <Tag
    ref={ref}
    data-slot="topbar-title"
    className={cn("truncate text-ui-title font-bold text-ink-1", className)}
    {...props}
  />
));
TopbarTitle.displayName = "TopbarTitle";
