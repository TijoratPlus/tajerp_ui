import * as React from "react";
import ReactGridLayout, { useContainerWidth, type LayoutItem } from "react-grid-layout";

import { cn } from "../lib/cn";

export interface GridItem {
  /** Unique id of the item (also its React key). */
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  /** Pin the item: not draggable or resizable. */
  static?: boolean;
}

export interface GridLayoutProps {
  layout: GridItem[];
  /** Fires after a drag or resize with the full new layout. */
  onLayoutChange?: (layout: GridItem[]) => void;
  /** Number of columns. Defaults to 20. */
  cols?: number;
  /** Height of one row in px. Defaults to 30. */
  rowHeight?: number;
  /** [horizontal, vertical] gap between items in px. Defaults to [12, 12]. */
  margin?: [number, number];
  /** Drag and resize items. Defaults to false (read-only dashboard). */
  editable?: boolean;
  /** CSS selector of the drag handle inside items; whole item when omitted. */
  dragHandle?: string;
  renderItem: (item: GridItem) => React.ReactNode;
  className?: string;
  itemClassName?: string;
}

const toGridItem = (l: LayoutItem): GridItem => ({
  i: l.i,
  x: l.x,
  y: l.y,
  w: l.w,
  h: l.h,
  ...(l.minW !== undefined ? { minW: l.minW } : null),
  ...(l.minH !== undefined ? { minH: l.minH } : null),
  ...(l.maxW !== undefined ? { maxW: l.maxW } : null),
  ...(l.maxH !== undefined ? { maxH: l.maxH } : null),
  ...(l.static !== undefined ? { static: l.static } : null),
});

/**
 * Dashboard grid (react-grid-layout): charts and number cards placed on a
 * column grid, draggable and resizable in `editable` mode. Its styles ship
 * in `tajerp_ui/styles/index.css` (styles/grid-layout.css).
 */
export const GridLayout = React.forwardRef<HTMLDivElement, GridLayoutProps>(
  (
    {
      layout,
      onLayoutChange,
      cols = 20,
      rowHeight = 30,
      margin = [12, 12],
      editable = false,
      dragHandle,
      renderItem,
      className,
      itemClassName,
    },
    ref,
  ) => {
    const { width, containerRef, mounted } = useContainerWidth();
    const setRefs = React.useCallback(
      (el: HTMLDivElement | null) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      },
      [containerRef, ref],
    );
    // Report only user edits (drag/resize stop), not the initial compaction.
    const commit = (next: readonly LayoutItem[]) => onLayoutChange?.(next.map(toGridItem));

    return (
      <div
        ref={setRefs}
        data-slot="grid-layout"
        data-editable={editable || undefined}
        className={cn("tj-grid-layout w-full", className)}
      >
        {mounted ? (
          <ReactGridLayout
            width={width}
            layout={layout}
            gridConfig={{ cols, rowHeight, margin }}
            dragConfig={{ enabled: editable, handle: dragHandle }}
            resizeConfig={{ enabled: editable }}
            onDragStop={(l) => commit(l)}
            onResizeStop={(l) => commit(l)}
          >
            {layout.map((item) => (
              <div
                key={item.i}
                data-slot="grid-layout-item"
                className={cn("min-h-0 min-w-0", itemClassName)}
              >
                {renderItem(item)}
              </div>
            ))}
          </ReactGridLayout>
        ) : null}
      </div>
    );
  },
);
GridLayout.displayName = "GridLayout";
