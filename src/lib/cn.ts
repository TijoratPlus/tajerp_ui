import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge taught about the design-system's own theme keys, so
 * `cn("text-ui-body", "text-ink-1")` keeps both (size + colour) and
 * `cn("shadow-tj-sm", "shadow-tj-md")` keeps only the last shadow.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "ui-micro",
        "ui-caption",
        "ui-helper",
        "ui-label",
        "ui-body",
        "ui-control",
        "ui-title",
        "ui-heading",
        "ui-display",
      ],
      shadow: ["tj-sm", "tj-md", "tj-lg", "tj-brand", "tj-card"],
      spacing: ["control-sm", "control-md", "control-lg", "cell-x", "cell-y"],
    },
  },
});

/** Merge class names, de-duplicating conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
