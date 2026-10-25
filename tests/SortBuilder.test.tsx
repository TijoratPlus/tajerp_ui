import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SortBuilder, SortPopover, type SortRule } from "../src";
import { mockDndLayout } from "./dnd";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const FIELDS = [
  { name: "modified", label: "Изменено" },
  { name: "annual_revenue", label: "Годовой оборот" },
  { name: "lead_name", label: "Имя лида" },
];

function Harness({ initial, onChange }: { initial: SortRule[]; onChange: (v: SortRule[]) => void }) {
  const [value, setValue] = React.useState(initial);
  return (
    <SortBuilder
      fields={FIELDS}
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}

describe("SortBuilder", () => {
  let restore: { mockRestore: () => void } | undefined;
  afterEach(() => restore?.mockRestore());

  it("adds rules with unused fields, toggles direction and removes", async () => {
    const onChange = vi.fn();
    renderWithUI(<Harness initial={[{ field: "modified", direction: "desc" }]} onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Добавить сортировку" }));
    expect(onChange).toHaveBeenLastCalledWith([
      { field: "modified", direction: "desc" },
      { field: "annual_revenue", direction: "asc" },
    ]);
    // The first rule cannot pick a field used by the second.
    const [first] = screen.getAllByRole("combobox", { name: "Поле сортировки" });
    expect(within(first!).queryByRole("option", { name: "Годовой оборот" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Направление: По убыванию" }));
    expect(onChange.mock.lastCall![0][0]).toEqual({ field: "modified", direction: "asc" });

    await user.click(screen.getAllByRole("button", { name: "Удалить сортировку" })[1]!);
    expect(onChange).toHaveBeenLastCalledWith([{ field: "modified", direction: "asc" }]);
    await expectNoA11yViolations();
  });

  it("reorders rules with the keyboard", async () => {
    restore = mockDndLayout();
    const onChange = vi.fn();
    renderWithUI(
      <Harness
        initial={[
          { field: "modified", direction: "desc" },
          { field: "lead_name", direction: "asc" },
        ]}
        onChange={onChange}
      />,
    );
    const [handle] = screen.getAllByRole("button", { name: "Перетащить" });
    act(() => handle!.focus());
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenLastCalledWith([
      { field: "lead_name", direction: "asc" },
      { field: "modified", direction: "desc" },
    ]);
  });
});

describe("SortPopover", () => {
  it("shows the count and clears", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <SortPopover
        fields={FIELDS}
        value={[{ field: "modified", direction: "desc" }]}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Сортировка (1)" }));
    const dialog = await screen.findByRole("dialog", { name: "Сортировка списка" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Очистить всё" }));
    expect(onValueChange).toHaveBeenCalledWith([]);
    await expectNoA11yViolations();
  });

  it("speaks Tajik", () => {
    renderWithUI(<SortPopover fields={FIELDS} value={[]} onValueChange={() => {}} />, {
      provider: { locale: "tg" },
    });
    expect(screen.getByRole("button", { name: "Мураттабсозӣ" })).toBeInTheDocument();
  });
});
