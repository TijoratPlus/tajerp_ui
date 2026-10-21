import * as React from "react";

import { cn } from "../lib/cn";

export type KbdProps = React.HTMLAttributes<HTMLElement>;

/**
 * A keyboard key, for shortcut hints in menus, tooltips and the POS help
 * sheet: <Kbd>F2</Kbd>, <Kbd>Enter</Kbd>.
 */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, ...props }, ref) => (
    <kbd
      ref={ref}
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center !rounded-sm border border-b-2 border-hairline bg-ui-surface-2 px-1.5 font-mono text-ui-caption font-medium leading-none text-ink-2 whitespace-nowrap select-none",
        className,
      )}
      {...props}
    />
  ),
);
Kbd.displayName = "Kbd";

export interface KbdGroupProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Text placed between keys, e.g. "+" for chords (Ctrl + K). Omit for
   * sequences shown as separate keys.
   */
  separator?: React.ReactNode;
}

/**
 * A key combination. Renders a `<kbd>` that wraps the inner `<Kbd>` keys, the
 * HTML pattern for "press these together".
 */
export const KbdGroup = React.forwardRef<HTMLElement, KbdGroupProps>(
  ({ className, separator, children, ...props }, ref) => {
    const keys = React.Children.toArray(children);
    return (
      <kbd
        ref={ref}
        data-slot="kbd-group"
        className={cn(
          "inline-flex items-center gap-1 font-sans text-ui-caption text-ink-3",
          className,
        )}
        {...props}
      >
        {separator === undefined
          ? keys
          : keys.map((key, i) => (
              <React.Fragment key={i}>
                {i > 0 ? (
                  <span data-slot="kbd-separator">{separator}</span>
                ) : null}
                {key}
              </React.Fragment>
            ))}
      </kbd>
    );
  },
);
KbdGroup.displayName = "KbdGroup";
