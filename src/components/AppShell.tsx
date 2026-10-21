import { Menu, XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { defineMessages } from "../i18n/messages";
import { Sheet, SheetContent, SheetTitle } from "./Sheet";
import { useMessages } from "./TajUIProvider";

export const appShellMessages = defineMessages("appShell", {
  ru: {
    skipToContent: "Перейти к содержимому",
    openNav: "Открыть меню",
    closeNav: "Закрыть меню",
    navTitle: "Главное меню",
  },
  tg: {
    skipToContent: "Гузаштан ба мундариҷа",
    openNav: "Кушодани меню",
    closeNav: "Пӯшидани меню",
    navTitle: "Менюи асосӣ",
  },
  en: {
    skipToContent: "Skip to content",
    openNav: "Open menu",
    closeNav: "Close menu",
    navTitle: "Main menu",
  },
});

export type AppShellLabels = (typeof appShellMessages.locales)["ru"];

export type AppShellBreakpoint = "sm" | "md" | "lg" | "xl";

/** Tailwind v4 default breakpoints, for the matchMedia listener. */
const BREAKPOINT_MIN: Record<AppShellBreakpoint, string> = {
  sm: "40rem",
  md: "48rem",
  lg: "64rem",
  xl: "80rem",
};

// Static class names so Tailwind can see them.
const desktopColumn: Record<AppShellBreakpoint, string> = {
  sm: "hidden sm:flex",
  md: "hidden md:flex",
  lg: "hidden lg:flex",
  xl: "hidden xl:flex",
};
const mobileOnly: Record<AppShellBreakpoint, string> = {
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
};

export interface AppShellContextValue {
  /** True inside an `<AppShell>`. */
  inShell: boolean;
  /** True when the shell has a sidebar (so the menu button has a target). */
  hasSidebar: boolean;
  isMobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
  mobileBreakpoint: AppShellBreakpoint;
  /** Id of the mobile navigation sheet, for `aria-controls`. */
  mobileNavId: string;
  labels: AppShellLabels;
}

const noop = () => {};

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

/**
 * Mobile-navigation controls of the surrounding `<AppShell>`. Outside a shell
 * it returns inert no-op controls (`inShell: false`).
 */
export function useAppShell(): AppShellContextValue {
  const ctx = React.useContext(AppShellContext);
  const labels = useMessages(appShellMessages);
  return (
    ctx ?? {
      inShell: false,
      hasSidebar: false,
      isMobileNavOpen: false,
      openMobileNav: noop,
      closeMobileNav: noop,
      toggleMobileNav: noop,
      mobileBreakpoint: "lg",
      mobileNavId: "",
      labels,
    }
  );
}

export interface AppShellProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Navigation rail, typically `<Sidebar />`. */
  sidebar?: React.ReactNode;
  /** Header bar, typically `<Topbar />`. */
  topbar?: React.ReactNode;
  /** Page content, rendered inside `<main id="main-content">`. */
  children?: React.ReactNode;
  /**
   * Below this breakpoint the sidebar moves into a slide-in sheet opened by
   * the topbar's menu button. Defaults to "lg" (1024px).
   */
  mobileBreakpoint?: AppShellBreakpoint;
  /** Controlled open state of the mobile navigation sheet. */
  mobileNavOpen?: boolean;
  defaultMobileNavOpen?: boolean;
  onMobileNavOpenChange?: (open: boolean) => void;
  /**
   * Close the mobile sheet when a link or leaf button inside the sidebar is
   * activated. Defaults to true.
   */
  closeMobileNavOnNavigate?: boolean;
  /** Id of the main region (skip-link target). Defaults to "main-content". */
  mainId?: string;
  mainClassName?: string;
  labels?: Partial<AppShellLabels>;
}

/**
 * Page frame for every TajERP app: a fixed sidebar column on large screens,
 * a slide-in navigation sheet on tablets and phones, a sticky topbar and a
 * scrollable `<main>` with a skip link. Full height (100dvh) with safe-area
 * insets for notched phones.
 */
export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  (
    {
      sidebar,
      topbar,
      children,
      mobileBreakpoint = "lg",
      mobileNavOpen,
      defaultMobileNavOpen = false,
      onMobileNavOpenChange,
      closeMobileNavOnNavigate = true,
      mainId = "main-content",
      mainClassName,
      labels: labelsProp,
      className,
      ...props
    },
    ref,
  ) => {
    const labels = useMessages(appShellMessages, labelsProp);
    const mobileNavId = React.useId();
    const mainRef = React.useRef<HTMLElement>(null);

    const isControlled = mobileNavOpen !== undefined;
    const [internalOpen, setInternalOpen] =
      React.useState(defaultMobileNavOpen);
    const isOpen = isControlled ? mobileNavOpen : internalOpen;

    const onChangeRef = React.useRef(onMobileNavOpenChange);
    onChangeRef.current = onMobileNavOpenChange;

    const setOpen = React.useCallback(
      (next: boolean) => {
        if (!isControlled) setInternalOpen(next);
        onChangeRef.current?.(next);
      },
      [isControlled],
    );

    // Close the sheet when the viewport grows past the breakpoint.
    React.useEffect(() => {
      if (!isOpen || typeof window === "undefined" || !window.matchMedia)
        return;
      const mql = window.matchMedia(
        `(min-width: ${BREAKPOINT_MIN[mobileBreakpoint]})`,
      );
      if (mql.matches) {
        setOpen(false);
        return;
      }
      const onChange = (e: MediaQueryListEvent) => {
        if (e.matches) setOpen(false);
      };
      mql.addEventListener?.("change", onChange);
      return () => mql.removeEventListener?.("change", onChange);
    }, [isOpen, mobileBreakpoint, setOpen]);

    const hasSidebar = sidebar != null && sidebar !== false;

    const ctx = React.useMemo<AppShellContextValue>(
      () => ({
        inShell: true,
        hasSidebar,
        isMobileNavOpen: isOpen,
        openMobileNav: () => setOpen(true),
        closeMobileNav: () => setOpen(false),
        toggleMobileNav: () => setOpen(!isOpen),
        mobileBreakpoint,
        mobileNavId,
        labels,
      }),
      [hasSidebar, isOpen, setOpen, mobileBreakpoint, mobileNavId, labels],
    );

    const onSheetClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!closeMobileNavOnNavigate) return;
      const target = e.target as HTMLElement;
      const hit = target.closest("a[href], button");
      if (!hit || !e.currentTarget.contains(hit)) return;
      // Group toggles (aria-expanded) open sub-menus; leaves navigate.
      if (
        hit.hasAttribute("aria-expanded") ||
        hit.hasAttribute("data-shell-keep-open")
      ) {
        return;
      }
      if (hit.matches("[disabled], [aria-disabled=true]")) return;
      setOpen(false);
    };

    const onSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
      const main = mainRef.current;
      if (!main) return;
      e.preventDefault();
      main.focus();
      main.scrollIntoView?.({ block: "start" });
    };

    return (
      <AppShellContext.Provider value={ctx}>
        <div
          ref={ref}
          data-slot="app-shell"
          data-mobile-nav-open={isOpen || undefined}
          className={cn(
            "flex h-dvh w-full overflow-hidden bg-ui-bg text-ink-1",
            "pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]",
            className,
          )}
          {...props}
        >
          <a
            href={`#${mainId}`}
            onClick={onSkip}
            data-slot="app-shell-skip-link"
            className={cn(
              "sr-only focus:not-sr-only focus:fixed focus:top-[max(0.5rem,env(safe-area-inset-top))] focus:left-2 focus:z-(--tj-z-toast)",
              "focus:inline-flex focus:h-control-md focus:items-center focus:!rounded-lg focus:bg-brand-solid focus:px-4 focus:text-ui-control focus:font-bold focus:text-on-brand focus:shadow-tj-lg",
              focusRing,
            )}
          >
            {labels.skipToContent}
          </a>

          {hasSidebar ? (
            <div
              data-slot="app-shell-sidebar"
              className={cn(
                desktopColumn[mobileBreakpoint],
                "h-full shrink-0 flex-col bg-ui-rail pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] [&>*]:min-h-0 [&>*]:flex-1",
              )}
            >
              {sidebar}
            </div>
          ) : null}

          {hasSidebar ? (
            <Sheet open={isOpen} onOpenChange={setOpen}>
              <SheetContent
                id={mobileNavId}
                side="left"
                showCloseButton={false}
                aria-describedby={undefined}
                data-slot="app-shell-mobile-nav"
                className="w-auto max-w-[85vw] gap-0 overflow-hidden border-r-0 bg-ui-rail p-0 sm:max-w-[85vw]"
              >
                <SheetTitle className="sr-only">{labels.navTitle}</SheetTitle>
                <div
                  className="flex h-full min-h-0 flex-col [&>*]:min-h-0 [&>*]:flex-1"
                  onClick={onSheetClick}
                >
                  {sidebar}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={labels.closeNav}
                  data-slot="app-shell-close-nav"
                  className={cn(
                    "absolute top-[max(0.5rem,env(safe-area-inset-top))] right-2 inline-flex size-8 cursor-pointer items-center justify-center !rounded-md text-rail-ink-muted transition-colors hover:bg-rail-hover hover:text-rail-ink [[data-density=touch]_&]:size-11",
                    focusRing,
                  )}
                >
                  <XIcon className="size-4" aria-hidden />
                </button>
              </SheetContent>
            </Sheet>
          ) : null}

          <div
            data-slot="app-shell-body"
            className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain"
          >
            {topbar}
            <main
              ref={mainRef}
              id={mainId}
              tabIndex={-1}
              data-slot="app-shell-main"
              className={cn(
                "min-w-0 flex-1 pb-[env(safe-area-inset-bottom)] outline-none",
                mainClassName,
              )}
            >
              {children}
            </main>
          </div>
        </div>
      </AppShellContext.Provider>
    );
  },
);
AppShell.displayName = "AppShell";

export type AppShellMenuButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Hamburger button that opens the shell's navigation sheet. Visible only
 * below the shell's `mobileBreakpoint`, and renders nothing outside an
 * `<AppShell>` with a sidebar. `<Topbar>` places one automatically.
 */
export const AppShellMenuButton = React.forwardRef<
  HTMLButtonElement,
  AppShellMenuButtonProps
>(({ className, onClick, children, ...props }, ref) => {
  const shell = useAppShell();
  if (!shell.inShell || !shell.hasSidebar) return null;
  return (
    <button
      ref={ref}
      type="button"
      data-slot="app-shell-menu-button"
      aria-label={shell.labels.openNav}
      aria-expanded={shell.isMobileNavOpen}
      aria-controls={shell.isMobileNavOpen ? shell.mobileNavId : undefined}
      aria-haspopup="dialog"
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) shell.openMobileNav();
      }}
      className={cn(
        mobileOnly[shell.mobileBreakpoint],
        "-ml-1 inline-flex size-control-md shrink-0 cursor-pointer items-center justify-center !rounded-lg text-ink-2 transition-colors hover:bg-mist hover:text-brand-ink",
        focusRing,
        className,
      )}
      {...props}
    >
      {children ?? <Menu className="size-5" aria-hidden />}
    </button>
  );
});
AppShellMenuButton.displayName = "AppShellMenuButton";
