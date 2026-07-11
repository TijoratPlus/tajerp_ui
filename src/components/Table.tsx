import * as React from "react";

import { cn } from "../lib/cn";

/**
 * Low-level table primitives styled with Tijorat+ tokens. Compose them directly
 * for bespoke tables, or use <DataTable> for the batteries-included version.
 */

function TableContainer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "overflow-hidden !rounded-lg border border-hairline bg-ui-surface shadow-tj-sm",
        className,
      )}
      {...props}
    />
  );
}

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full border-collapse text-left", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={className} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={className} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-ui-bg font-medium", className)}
      {...props}
    />
  );
}

function TableRow({
  className,
  selected,
  ...props
}: React.ComponentProps<"tr"> & { selected?: boolean }) {
  return (
    <tr
      data-slot="table-row"
      data-selected={selected ? "" : undefined}
      className={cn(
        "border-b border-hairline transition-colors duration-100 last:border-b-0",
        selected ? "bg-mist hover:bg-mist" : "hover:bg-ui-bg",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({
  className,
  align = "left",
  ...props
}: React.ComponentProps<"th"> & { align?: "left" | "right" | "center" }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "select-none whitespace-nowrap border-b-[1.5px] border-hairline bg-ui-bg px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.07em] text-ink-3",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({
  className,
  align = "left",
  ...props
}: React.ComponentProps<"td"> & { align?: "left" | "right" | "center" }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-3.5 align-middle text-[13.5px] font-medium text-ink-2",
        align === "right" && "text-right tabular-nums",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-3 text-sm text-ink-3", className)}
      {...props}
    />
  );
}

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
