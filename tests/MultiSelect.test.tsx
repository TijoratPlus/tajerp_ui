import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { MultiSelect, type MultiSelectOption } from "../src/components/MultiSelect";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const warehouses: MultiSelectOption[] = [
  { value: "dsh-1", label: "Склад Душанбе №1", group: "Душанбе" },
  { value: "dsh-2", label: "Склад Душанбе №2", group: "Душанбе" },
  { value: "khj", label: "Склад Худжанд", group: "Согд" },
  { value: "isf", label: "Склад Исфара (закрыт)", group: "Согд", disabled: true },
];

const chipNames = () =>
  Array.from(document.querySelectorAll('[data-slot="multi-select-chip"]')).map(
    (c) => c.firstElementChild?.textContent,
  );

describe("MultiSelect", () => {
  it("selects options, shows checked state and is accessible", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <MultiSelect aria-label="Склады" options={warehouses} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole("combobox", { name: "Склады" });
    await userEvent.click(input);
    const listbox = screen.getByRole("listbox", { name: "Склады" });
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    expect(within(listbox).getByRole("group", { name: "Согд" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("option", { name: "Склад Худжанд" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["khj"]);
    expect(screen.getByRole("option", { name: "Склад Худжанд" })).toHaveAttribute("aria-selected", "true");
    // List stays open for further picks.
    await userEvent.click(screen.getByRole("option", { name: "Склад Душанбе №1" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["khj", "dsh-1"]);
    expect(chipNames()).toEqual(["Склад Худжанд", "Склад Душанбе №1"]);
    expect(input).toHaveAccessibleDescription(/Выбрано: 2/);
    await expectNoA11yViolations();
  });

  it("filters by query and navigates with the keyboard, skipping disabled options", async () => {
    const onValueChange = vi.fn();
    renderWithUI(<MultiSelect aria-label="Склады" options={warehouses} onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox");
    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-expanded", "true");

    const active = () => document.getElementById(input.getAttribute("aria-activedescendant") ?? "")?.textContent;
    expect(active()).toBe("Склад Душанбе №1");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("Склад Худжанд");
    await userEvent.keyboard("{ArrowDown}"); // skips disabled Исфара, wraps
    expect(active()).toBe("Склад Душанбе №1");
    await userEvent.keyboard("{ArrowUp}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["khj"]);

    await userEvent.type(input, "душ");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Склад Душанбе №1",
      "Склад Душанбе №2",
    ]);
    await userEvent.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("removes chips with their button and with Backspace on an empty input", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <MultiSelect
        aria-label="Склады"
        options={warehouses}
        defaultValue={["dsh-1", "dsh-2", "khj"]}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Удалить «Склад Душанбе №2»" }));
    expect(chipNames()).toEqual(["Склад Душанбе №1", "Склад Худжанд"]);

    const input = screen.getByRole("combobox");
    input.focus();
    await userEvent.keyboard("{Backspace}");
    expect(chipNames()).toEqual(["Склад Душанбе №1"]);
    expect(onValueChange).toHaveBeenLastCalledWith(["dsh-1"]);

    // Backspace with text only edits the text.
    await userEvent.type(input, "ab{Backspace}");
    expect(chipNames()).toEqual(["Склад Душанбе №1"]);

    await userEvent.click(screen.getByRole("button", { name: "Очистить выбор" }));
    expect(chipNames()).toEqual([]);
  });

  it("is controlled", async () => {
    function Controlled() {
      const [value, setValue] = React.useState<string[]>(["khj"]);
      return (
        <>
          <MultiSelect aria-label="Склады" options={warehouses} value={value} onValueChange={setValue} />
          <output>{value.join(",")}</output>
        </>
      );
    }
    renderWithUI(<Controlled />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: "Склад Душанбе №2" }));
    expect(document.querySelector("output")).toHaveTextContent("khj,dsh-2");
  });

  it("collapses extra chips into +N and supports select all", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <MultiSelect
        aria-label="Склады"
        options={warehouses}
        maxVisibleChips={1}
        selectAll
        defaultValue={["dsh-1", "khj"]}
        onValueChange={onValueChange}
      />,
    );
    expect(chipNames()).toEqual(["Склад Душанбе №1"]);
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByText("ещё 1")).toHaveClass("sr-only");

    await userEvent.click(screen.getByRole("combobox"));
    const all = screen.getByRole("option", { name: "Выбрать все" });
    expect(all).toHaveAttribute("aria-checked", "mixed");
    await userEvent.click(all);
    expect(onValueChange).toHaveBeenLastCalledWith(["dsh-1", "khj", "dsh-2"]); // disabled skipped
    await userEvent.click(all);
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("creates options from unmatched text", async () => {
    const onCreate = vi.fn((text: string) => `new:${text}`);
    const onValueChange = vi.fn();
    renderWithUI(
      <MultiSelect
        aria-label="Категории"
        options={[{ value: "milk", label: "Молочные продукты" }]}
        creatable
        onCreate={onCreate}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "Бытовая химия");
    expect(screen.getByRole("option", { name: "Создать «Бытовая химия»" })).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");
    expect(onCreate).toHaveBeenCalledWith("Бытовая химия");
    expect(onValueChange).toHaveBeenLastCalledWith(["new:Бытовая химия"]);
    expect(input).toHaveValue("");

    // An exact match does not offer creation.
    await userEvent.type(input, "молочные продукты");
    expect(screen.queryByRole("option", { name: /Создать/ })).toBeNull();
  });

  it("shows empty and loading states, passes id/name and respects disabled", async () => {
    const { rerender } = renderWithUI(
      <form aria-label="Фильтр">
        <label htmlFor="wh">Склады</label>
        <MultiSelect id="wh" name="warehouse" options={warehouses} defaultValue={["dsh-1", "khj"]} />
      </form>,
    );
    const input = screen.getByRole("combobox", { name: "Склады" });
    expect(input).toHaveAttribute("id", "wh");
    const form = screen.getByRole("form") as HTMLFormElement;
    expect(new FormData(form).getAll("warehouse")).toEqual(["dsh-1", "khj"]);

    await userEvent.type(input, "Бохтар");
    expect(screen.getByText("Ничего не найдено")).toBeInTheDocument();
    await expectNoA11yViolations();

    rerender(<MultiSelect aria-label="Склады" options={[]} loading defaultOpen />);
    expect(screen.getByText("Загрузка…")).toBeInTheDocument();
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true");

    rerender(<MultiSelect aria-label="Склады" options={warehouses} disabled defaultValue={["khj"]} />);
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Удалить/ })).toBeNull();
  });

  it("accepts a groups prop and Tajik labels", async () => {
    renderWithUI(
      <MultiSelect
        aria-label="Категорияҳо"
        groups={[
          { label: "Хӯрокворӣ", options: [{ value: "bread", label: "Нон" }] },
          { label: "Маишӣ", options: [{ value: "soap", label: "Собун" }] },
        ]}
        defaultValue={["bread"]}
      />,
      { provider: { locale: "tg" } },
    );
    expect(screen.getByRole("button", { name: "«Нон»-ро нест кардан" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("group", { name: "Маишӣ" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });
});
