/** Class recipes shared by modal overlays (Dialog, Sheet, AlertDialog). */

/** Full-screen scrim behind modal content. */
export const overlayClass =
  "fixed inset-0 z-(--tj-z-overlay) bg-ui-overlay data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

/** Icon-only close button in a modal corner (24px+ target, WCAG 2.5.8). */
export const closeButtonClass =
  "absolute inline-flex size-8 items-center justify-center !rounded-md text-ink-3 transition-colors outline-none hover:bg-ui-surface-2 hover:text-ink-1 focus-visible:ring-2 focus-visible:ring-focus cursor-pointer disabled:pointer-events-none";

/** Floating panel chrome for popovers, menus and hover cards. */
export const floatingPanelClass =
  "z-(--tj-z-popover) !rounded-lg border border-hairline bg-ui-surface text-ui-body text-ink-1 shadow-tj-lg outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";
