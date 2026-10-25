import { vi } from "vitest";

/**
 * jsdom has no layout, so @dnd-kit sees every node at 0×0 and keyboard moves
 * find no target. Give `[data-dnd-x]/[data-dnd-y]`-less nodes a position from
 * the closest `[data-index]` item (stacked 40px apart) and its column
 * (`[data-column-index]`, 300px apart).
 */
export function mockDndLayout() {
  return vi
    .spyOn(Element.prototype, "getBoundingClientRect")
    .mockImplementation(function (this: Element) {
      const el = this as HTMLElement;
      const item = el.closest?.("[data-index]");
      const column = el.closest?.("[data-column-index]");
      const i = item ? Number(item.getAttribute("data-index")) : 0;
      const c = column ? Number(column.getAttribute("data-column-index")) : 0;
      const isColumn = !item && !!column;
      const top = isColumn ? 0 : 40 + i * 40;
      const left = c * 300;
      const height = isColumn ? 600 : 36;
      const width = 280;
      return {
        x: left,
        y: top,
        top,
        left,
        width,
        height,
        bottom: top + height,
        right: left + width,
        toJSON() {},
      } as DOMRect;
    });
}
