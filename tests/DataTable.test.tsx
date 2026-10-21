import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { DataTable, dataTableToCSV, type DataTableColumn } from "../src";
import { expectNoA11yViolations, renderWithUI } from "./utils";

interface Sale {
  id: string;
  customer: string;
  total: number;
}

const DATA: Sale[] = Array.from({ length: 25 }, (_, i) => ({
  id: `S-${i + 1}`,
  customer: i % 2 ? "Зарина" : "Фаррух",
  total: (i + 1) * 10,
}));

const COLUMNS: DataTableColumn<Sale>[] = [
  { key: "id", header: "Чек", cell: (r) => r.id, sortable: true, sortAccessor: (r) => r.id },
  { key: "customer", header: "Клиент", cell: (r) => r.customer },
  {
    key: "total",
    header: "Сумма",
    align: "right",
    cell: (r) => r.total,
    sortable: true,
    sortAccessor: (r) => r.total,
    footer: (rows) => rows.reduce((s, r) => s + r.total, 0),
  },
];

const bodyRows = () => screen.getAllByRole("row").filter((r) => r.closest("tbody"));

describe("DataTable", () => {
  it("paginates, sorts and totals all filtered rows", async () => {
    renderWithUI(
      <DataTable data={DATA} columns={COLUMNS} rowKey={(r) => r.id} autoPagination={{ pageSize: 10 }} />,
    );
    expect(bodyRows()).toHaveLength(10);
    // Totals cover all 25 rows, not just the page.
    expect(screen.getByText(String(DATA.reduce((s, r) => s + r.total, 0)))).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Сумма/ }));
    await userEvent.click(screen.getByRole("button", { name: /Сумма/ }));
    expect(within(bodyRows()[0]).getByText("250")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Сумма/ })).toHaveAttribute("aria-sort", "descending");
    await expectNoA11yViolations();
  });

  it("keeps the page when the parent re-renders with a new array", async () => {
    function Harness() {
      const [, force] = React.useState(0);
      return (
        <>
          <button type="button" onClick={() => force((n) => n + 1)}>
            rerender
          </button>
          <DataTable data={[...DATA]} columns={COLUMNS} rowKey={(r) => r.id} autoPagination={{ pageSize: 10 }} />
        </>
      );
    }
    renderWithUI(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Страница 2" }));
    await userEvent.click(screen.getByText("rerender"));
    expect(screen.getByRole("button", { name: "Страница 2" })).toHaveAttribute("aria-current", "page");
  });

  it("keeps the header when empty and loading", () => {
    const { rerender } = renderWithUI(
      <DataTable data={[]} columns={COLUMNS} rowKey={(r) => r.id} />,
    );
    expect(screen.getByRole("columnheader", { name: /Клиент/ })).toBeInTheDocument();
    expect(screen.getByText("Нет данных")).toBeInTheDocument();
    rerender(<DataTable data={[]} columns={COLUMNS} rowKey={(r) => r.id} loading />);
    expect(screen.getByRole("columnheader", { name: /Клиент/ })).toBeInTheDocument();
  });

  it("supports controlled server-side sorting", async () => {
    const onSortChange = vi.fn();
    renderWithUI(
      <DataTable
        data={DATA.slice(0, 3)}
        columns={COLUMNS}
        rowKey={(r) => r.id}
        sort={{ key: "total", dir: "asc" }}
        onSortChange={onSortChange}
        manualSorting
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Сумма/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: "total", dir: "desc" });
  });

  it("selects a range with shift+click and expands rows", async () => {
    const onSelectionChange = vi.fn();
    renderWithUI(
      <DataTable
        data={DATA.slice(0, 5)}
        columns={COLUMNS}
        rowKey={(r) => r.id}
        selectable
        onSelectionChange={onSelectionChange}
        renderExpanded={(r) => <p>Детали {r.id}</p>}
      />,
    );
    const boxes = screen.getAllByRole("checkbox", { name: "Выбрать строку" });
    await userEvent.click(boxes[0]);
    const user = userEvent.setup();
    await user.keyboard("{Shift>}");
    await user.click(boxes[3]);
    await user.keyboard("{/Shift}");
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["S-1", "S-2", "S-3", "S-4"]));

    await userEvent.click(screen.getAllByRole("button", { name: "Показать подробности" })[1]);
    expect(screen.getByText("Детали S-2")).toBeInTheDocument();
  });

  it("exports CSV from column accessors", () => {
    const csv = dataTableToCSV(DATA.slice(0, 2), COLUMNS, { bom: false });
    expect(csv.split("\r\n")[0]).toBe("Чек;Сумма");
    expect(csv).toContain("S-1;10");
  });
});
