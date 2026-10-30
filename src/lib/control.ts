/**
 * Shared class recipes for form controls and focusable elements, so every
 * input, select, button and composite widget sizes and focuses the same way.
 * Heights follow the density tokens (--tj-control-*), so a
 * `data-density="touch"` ancestor enlarges every control at once.
 */

export type ControlSize = "sm" | "md" | "lg";

/** Text size that pairs with each control size. */
export const controlText: Record<ControlSize, string> = {
  sm: "text-ui-label",
  md: "text-ui-control",
  lg: "text-ui-title",
};

/** Height + text size per control size. */
export const controlSize: Record<ControlSize, string> = {
  sm: "h-control-sm text-ui-label",
  md: "h-control-md text-ui-control",
  lg: "h-control-lg text-ui-title",
};

/** Visible focus ring for buttons, tabs, menu items, … (WCAG 2.4.7). */
export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus";

/** Field chrome: surface, strong hairline border (stays visible on the wash background), radius. */
export const controlFrame =
  "bg-ui-surface-2 border border-hairline-strong !rounded-lg text-ink-1 transition-colors duration-150";

/** Focus treatment for a field that is itself focusable (input, select). */
export const controlFocus =
  "outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-focus";

/** Focus treatment for a wrapper around a focusable field. */
export const controlFocusWithin =
  "focus-within:border-brand focus-within:ring-2 focus-within:ring-focus";

export const controlInvalid =
  "aria-[invalid=true]:border-tj-error aria-[invalid=true]:focus-visible:ring-tj-error/25";

export const controlInvalidWithin =
  "has-[[aria-invalid=true]]:border-tj-error has-[[aria-invalid=true]]:focus-within:ring-tj-error/25";

export const controlDisabled = "disabled:cursor-not-allowed disabled:opacity-60";
