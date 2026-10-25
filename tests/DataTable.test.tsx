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

describe("DataTable — group-by, column resize, select all matching", () => {
  const groups = [
    { key: "Фаррух", label: "Фаррух", rows: DATA.filter((r) => r.customer === "Фаррух").slice(0, 3) },
    { key: "Зарина", label: "Зарина", rows: DATA.filter((r) => r.customer === "Зарина").slice(0, 2) },
  ];

  it("renders collapsible group sections (uncontrolled) and reports toggles", async () => {
    const onGroupToggle = vi.fn();
    renderWithUI(
      <DataTable
        data={[]}
        columns={COLUMNS}
        rowKey={(r) => r.id}
        groups={groups}
        onGroupToggle={onGroupToggle}
        selectable
      />,
    );
    // 2 headers + 5 rows
    expect(bodyRows()).toHaveLength(7);
    const header = screen.getByRole("button", { name: /Зарина/ });
    expect(header).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(header);
    expect(onGroupToggle).toHaveBeenCalledWith("Зарина");
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(bodyRows()).toHaveLength(5);
    // Totals still cover every group.
    expect(screen.getByText(String([...groups[0]!.rows, ...groups[1]!.rows].reduce((s, r) => s + r.total, 0)))).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("respects controlled `collapsed` groups", () => {
    renderWithUI(
      <DataTable
        data={[]}
        columns={COLUMNS}
        rowKey={(r) => r.id}
        groups={[{ ...groups[0]!, collapsed: true }, groups[1]!]}
      />,
    );
    expect(screen.queryByText("S-1")).not.toBeInTheDocument();
    expect(screen.getByText("S-2")).toBeInTheDocument();
  });

  it("resizes a column with the keyboard and reports the width", async () => {
    const onColumnResize = vi.fn();
    const cols = COLUMNS.map((c) => (c.key === "customer" ? { ...c, width: 200 } : c));
    renderWithUI(
      <DataTable
        data={DATA.slice(0, 3)}
        columns={cols}
        rowKey={(r) => r.id}
        resizableColumns
        onColumnResize={onColumnResize}
      />,
    );
    const handle = screen.getByRole("separator", { name: "Ширина колонки «Клиент»" });
    expect(handle).toHaveAttribute("aria-valuenow", "200");
    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onColumnResize).toHaveBeenLastCalledWith("customer", 216);
    expect(handle).toHaveAttribute("aria-valuenow", "216");
    expect(screen.getByRole("columnheader", { name: /Клиент/ })).toHaveStyle({ width: "216px" });
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    expect(onColumnResize).toHaveBeenLastCalledWith("customer", 152);
    await expectNoA11yViolations();
  });

  it("offers “select all N” after selecting the whole page", async () => {
    const onSelectAll = vi.fn();
    function Harness() {
      const [keys, setKeys] = React.useState<Set<string>>(new Set());
      const [all, setAll] = React.useState(false);
      return (
        <DataTable
          data={DATA.slice(0, 5)}
          columns={COLUMNS}
          rowKey={(r) => r.id}
          selectable
          selectedKeys={keys}
          onSelectionChange={(k) => {
            setKeys(k);
            setAll(false);
          }}
          selectAllMatching={{
            total: 245,
            selectedAll: all,
            onSelectAll: () => {
              onSelectAll();
              setAll(true);
            },
          }}
        />
      );
    }
    renderWithUI(<Harness />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Выбрать все" }));
    expect(screen.getAllByText("5 выбрано").length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("button", { name: "Выбрать все 245" }));
    expect(onSelectAll).toHaveBeenCalled();
    expect(screen.getAllByText("245 выбрано").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Выбрать все 245" })).not.toBeInTheDocument();
    await expectNoA11yViolations();
  });
});
