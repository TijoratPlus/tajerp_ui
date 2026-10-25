import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { useMessages } from "./TajUIProvider";

export const resizablePanelMessages = defineMessages("resizablePanel", {
  ru: { handle: "Изменить ширину панели" },
  tg: { handle: "Тағйир додани паҳнои панел" },
  en: { handle: "Resize panel" },
});

export type ResizablePanelLabels = (typeof resizablePanelMessages.locales)["ru"];

export interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Edge that carries the drag handle. Defaults to "right" (a left sidebar). */
  side?: "left" | "right";
  defaultWidth: number;
  /** Controlled width in px. */
  width?: number;
  onWidthChange?: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  /** Persist the width in localStorage under this key. */
  storageKey?: string;
  /** Arrow-key step in px (Shift × 5). Defaults to 16. */
  step?: number;
  labels?: Partial<ResizablePanelLabels>;
}

function readStored(key: string | undefined): number | undefined {
  if (!key) return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    const n = raw == null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : undefined;
  } catch {
    return undefined;
  }
}

function writeStored(key: string | undefined, width: number) {
  if (!key) return;
  try {
    window.localStorage.setItem(key, String(Math.round(width)));
  } catch {
    // Private mode / blocked storage: the width just is not remembered.
  }
}

/**
 * Panel with a draggable edge (sidebars, detail panes). The handle is a
 * focusable separator: arrows resize, Home/End jump to min/max, double-click
 * resets. The width can persist in localStorage (`storageKey`).
 */
export const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
  (
    {
      side = "right",
      defaultWidth,
      width: widthProp,
      onWidthChange,
      minWidth = 160,
      maxWidth = 800,
      storageKey,
      step = 16,
      labels,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(resizablePanelMessages, labels);
    const clamp = React.useCallback(
      (n: number) => Math.min(maxWidth, Math.max(minWidth, n)),
      [minWidth, maxWidth],
    );
    const [inner, setInner] = React.useState(() => clamp(readStored(storageKey) ?? defaultWidth));
    const width = widthProp !== undefined ? clamp(widthProp) : inner;
    const [dragging, setDragging] = React.useState(false);
    const start = React.useRef<{ x: number; width: number } | null>(null);

    const set = (n: number, persist = true) => {
      const next = clamp(n);
      if (widthProp === undefined) setInner(next);
      onWidthChange?.(next);
      if (persist) writeStored(storageKey, next);
    };

    const sign = side === "right" ? 1 : -1;

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      start.current = { x: e.clientX, width };
      setDragging(true);
    };
    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!start.current) return;
      set(start.current.width + sign * (e.clientX - start.current.x), false);
    };
    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!start.current) return;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      start.current = null;
      setDragging(false);
      writeStored(storageKey, width);
    };
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const s = e.shiftKey ? step * 5 : step;
      const grow = side === "right" ? "ArrowRight" : "ArrowLeft";
      const shrink = side === "right" ? "ArrowLeft" : "ArrowRight";
      if (e.key === grow) set(width + s);
      else if (e.key === shrink) set(width - s);
      else if (e.key === "Home") set(minWidth);
      else if (e.key === "End") set(maxWidth);
      else return;
      e.preventDefault();
    };

    return (
      <div
        ref={ref}
        data-slot="resizable-panel"
        data-resizing={dragging || undefined}
        className={cn("relative shrink-0", className)}
        style={{ ...style, width }}
        {...props}
      >
        {children}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t.handle}
          aria-valuenow={Math.round(width)}
          aria-valuemin={minWidth}
          aria-valuemax={maxWidth}
          tabIndex={0}
          data-slot="resizable-panel-handle"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          onDoubleClick={() => set(defaultWidth)}
          className={cn(
            "group absolute inset-y-0 z-(--tj-z-sticky) flex w-3 cursor-col-resize touch-none justify-center outline-none",
            side === "right" ? "-right-1.5" : "-left-1.5",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "h-full w-0.5 bg-transparent transition-colors group-hover:bg-brand/40 group-focus-visible:bg-brand",
              dragging && "bg-brand",
            )}
          />
        </div>
      </div>
    );
  },
);
ResizablePanel.displayName = "ResizablePanel";
