import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  FilterBuilder,
  FilterPopover,
  TIMESPAN_OPTIONS,
  countFilterRules,
  defaultOperators,
  type FilterField,
  type FilterGroup,
  type FilterRule,
} from "../src";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const FIELDS: FilterField[] = [
  { name: "lead_name", label: "Имя лида", type: "data" },
  {
    name: "status",
    label: "Статус",
    type: "select",
    options: [
      { value: "New", label: "Новый" },
      { value: "Qualified", label: "Квалифицирован" },
    ],
  },
  { name: "annual_revenue", label: "Годовой оборот", type: "currency" },
  { name: "created", label: "Создан", type: "date" },
  { name: "is_vip", label: "VIP", type: "check" },
];

function Flat({
  initial = [] as FilterRule[],
  onChange,
}: {
  initial?: FilterRule[];
  onChange?: (v: unknown) => void;
}) {
  const [value, setValue] = React.useState<FilterRule[] | FilterGroup>(initial);
  return (
    <FilterBuilder
      fields={FIELDS}
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

describe("defaultOperators / TIMESPAN_OPTIONS", () => {
  it("offers type-appropriate operators", () => {
    expect(defaultOperators("check")).toEqual(["equals"]);
    expect(defaultOperators("date")).toContain("timespan");
    expect(defaultOperators("date")).toContain("between");
    expect(defaultOperators("select")).not.toContain("like");
    expect(defaultOperators("data")).toContain("like");
  });
  it("lists Frappe timespans with Russian labels", () => {
    expect(TIMESPAN_OPTIONS.find((o) => o.value === "last month")?.label).toBe("Прошлый месяц");
    expect(TIMESPAN_OPTIONS.map((o) => o.value)).toEqual(
      expect.arrayContaining(["today", "yesterday", "tomorrow", "this week", "next week", "last 6 months"]),
    );
  });
});

describe("FilterBuilder (flat)", () => {
  it("adds a rule, changes field, operator and value", async () => {
    const onChange = vi.fn();
    renderWithUI(<Flat onChange={onChange} />);
    const user = userEvent.setup();
    expect(screen.getByText("Фильтров нет")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Добавить фильтр" }));
    const rule = screen.getByRole("group", { name: "Условие 1" });
    expect(within(rule).getByRole("combobox", { name: "Поле" })).toHaveValue("lead_name");

    await user.type(within(rule).getByRole("textbox", { name: "Значение" }), "Зарина");
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ field: "lead_name", operator: "equals", value: "Зарина" }),
    ]);

    await user.selectOptions(within(rule).getByRole("combobox", { name: "Поле" }), "status");
    const valueSelect = within(rule).getByRole("combobox", { name: "Значение" });
    await user.selectOptions(valueSelect, "Qualified");
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ field: "status", operator: "equals", value: "Qualified" }),
    ]);

    await user.selectOptions(within(rule).getByRole("combobox", { name: "Условие" }), "is");
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ field: "status", operator: "is", value: "set" }),
    ]);
    await expectNoA11yViolations();
  });

  it("uses Yes/No for check fields and a timespan select for dates", async () => {
    const onChange = vi.fn();
    renderWithUI(
      <Flat
        onChange={onChange}
        initial={[
          { id: "a", field: "is_vip", operator: "equals", value: true },
          { id: "b", field: "created", operator: "timespan", value: "last week" },
        ]}
      />,
    );
    const user = userEvent.setup();
    const vip = screen.getByRole("group", { name: "Условие 1" });
    await user.selectOptions(within(vip).getByRole("combobox", { name: "Значение" }), "0");
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: "a", value: false }),
      expect.objectContaining({ id: "b" }),
    ]);
    const created = screen.getByRole("group", { name: "Условие 2" });
    await user.selectOptions(within(created).getByRole("combobox", { name: "Значение" }), "this month");
    expect(onChange.mock.lastCall![0][1]).toMatchObject({ value: "this month" });
    expect(screen.getByText("и")).toBeInTheDocument();
  });

  it("renders a custom value input via renderValueInput", () => {
    renderWithUI(
      <FilterBuilder
        fields={FIELDS}
        value={[{ id: "a", field: "lead_name", operator: "equals", value: "" }]}
        onValueChange={() => {}}
        renderValueInput={({ field }) =>
          field.name === "lead_name" ? <span data-testid="custom">свой ввод</span> : undefined
        }
      />,
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });

  it("removes a rule", async () => {
    const onChange = vi.fn();
    renderWithUI(
      <Flat onChange={onChange} initial={[{ id: "a", field: "lead_name", operator: "like", value: "x" }]} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Удалить условие" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe("FilterBuilder (nested)", () => {
  it("edits the conjunction and adds nested groups", async () => {
    const onChange = vi.fn();
    function Nested() {
      const [value, setValue] = React.useState<FilterRule[] | FilterGroup>({
        id: "root",
        conjunction: "and",
        rules: [
          { id: "a", field: "status", operator: "equals", value: "New" },
          { id: "b", field: "annual_revenue", operator: ">", value: 1000 },
        ],
      });
      return (
        <FilterBuilder
          nested
          fields={FIELDS}
          value={value}
          onValueChange={(v) => {
            setValue(v);
            onChange(v);
          }}
        />
      );
    }
    renderWithUI(<Nested />);
    const user = userEvent.setup();
    await user.selectOptions(screen.getByRole("combobox", { name: "Связка условий" }), "or");
    expect(onChange.mock.lastCall![0]).toMatchObject({ conjunction: "or" });

    await user.click(screen.getByRole("button", { name: "Добавить группу" }));
    const group = screen.getByRole("group", { name: "Группа 1" });
    expect(within(group).getAllByRole("group")).toHaveLength(1);
    const root = onChange.mock.lastCall![0] as FilterGroup;
    expect(root.rules).toHaveLength(3);
    expect(root.rules[2]).toMatchObject({ conjunction: "and", rules: [expect.objectContaining({ field: "lead_name" })] });
    expect(countFilterRules(root)).toBe(3);

    await user.click(within(group).getByRole("button", { name: "Удалить группу" }));
    expect((onChange.mock.lastCall![0] as FilterGroup).rules).toHaveLength(2);
    await expectNoA11yViolations();
  });
});

describe("FilterPopover", () => {
  it("shows the count, opens the builder and clears everything", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <FilterPopover
        fields={FIELDS}
        value={[
          { id: "a", field: "status", operator: "equals", value: "New" },
          { id: "b", field: "lead_name", operator: "like", value: "Душанбе" },
        ]}
        onValueChange={onValueChange}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Фильтр (2)" }));
    const dialog = await screen.findByRole("dialog", { name: "Фильтры" });
    expect(within(dialog).getAllByRole("group")).toHaveLength(2);
    await user.click(within(dialog).getByRole("button", { name: "Очистить всё" }));
    expect(onValueChange).toHaveBeenCalledWith([]);
    await expectNoA11yViolations();
  });

  it("speaks Tajik", () => {
    renderWithUI(<FilterPopover fields={FIELDS} value={[]} onValueChange={() => {}} />, {
      provider: { locale: "tg" },
    });
    expect(screen.getByRole("button", { name: "Филтр" })).toBeInTheDocument();
  });
});
