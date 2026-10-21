import * as React from "react";

import { cn } from "../lib/cn";

/**
 * Low-level table primitives styled with Tijorat+ tokens. Compose them directly
 * for bespoke tables, or use <DataTable> for the batteries-included version.
 *
 * Cell padding follows the density tokens (`data-density="compact"` for
 * dense reports, `"touch"` for tablets).
 */

const TableContainer = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="table-container"
      className={cn(
        "overflow-hidden !rounded-lg border border-hairline bg-ui-surface shadow-tj-sm",
        className,
      )}
      {...props}
    />
  ),
);
TableContainer.displayName = "TableContainer";

export type TableProps = React.ComponentPropsWithoutRef<"table"> & {
  /**
   * Height limit of the scroll area. With it, the area scrolls vertically and
   * `<TableHead sticky>` headers stay visible.
   */
  maxHeight?: number | string;
  /** Classes for the scrolling wrapper. */
  containerClassName?: string;
};

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, maxHeight, containerClassName, ...props }, ref) => (
    <div
      data-slot="table-scroll"
      className={cn(
        "relative w-full overflow-x-auto",
        maxHeight != null && "overflow-y-auto overscroll-contain",
        containerClassName,
      )}
      style={maxHeight != null ? { maxHeight } : undefined}
    >
      <table
        ref={ref}
        data-slot="table"
        className={cn("w-full border-separate border-spacing-0 text-left", className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentPropsWithoutRef<"thead">
>(({ className, ...props }, ref) => (
  <thead ref={ref} data-slot="table-header" className={className} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentPropsWithoutRef<"tbody">
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    data-slot="table-body"
    className={cn("[&>tr:last-child>td]:border-b-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentPropsWithoutRef<"tfoot">
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    data-slot="table-footer"
    className={cn(
      "bg-ui-bg font-semibold [&>tr>td]:border-t-[1.5px] [&>tr>td]:border-b-0 [&>tr>td]:border-hairline [&>tr>td]:text-ink-1",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

export type TableRowProps = React.ComponentPropsWithoutRef<"tr"> & {
  selected?: boolean;
};

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, ...props }, ref) => (
    <tr
      ref={ref}
      data-slot="table-row"
      data-selected={selected ? "" : undefined}
      aria-selected={selected || undefined}
      className={cn(
        "transition-colors duration-100",
        selected ? "bg-mist hover:bg-mist" : "hover:bg-ui-bg",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

type Align = "left" | "right" | "center";

export type TableHeadProps = React.ComponentPropsWithoutRef<"th"> & {
  align?: Align;
  /** Stick to the top of a scrolling <Table maxHeight>. */
  sticky?: boolean;
};

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align = "left", scope = "col", sticky, ...props }, ref) => (
    <th
      ref={ref}
      data-slot="table-head"
      scope={scope}
      className={cn(
        "select-none whitespace-nowrap border-b-[1.5px] border-hairline bg-ui-bg px-cell-x py-2.5 text-ui-caption font-bold uppercase tracking-[0.07em] text-ink-3",
        sticky && "sticky top-0 z-(--tj-z-sticky)",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

export type TableCellProps = React.ComponentPropsWithoutRef<"td"> & {
  align?: Align;
};

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = "left", ...props }, ref) => (
    <td
      ref={ref}
      data-slot="table-cell"
      className={cn(
        "border-b border-hairline px-cell-x py-cell-y align-middle text-ui-body font-medium text-ink-2",
        align === "right" && "text-right tabular-nums",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.ComponentPropsWithoutRef<"caption">
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    data-slot="table-caption"
    className={cn("mt-3 text-sm text-ink-3", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};
