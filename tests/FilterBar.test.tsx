import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FilterBar } from "../src/components/FilterBar";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("FilterBar", () => {
  it("renders controls, chips, clear-all and a formatted count", async () => {
    const removeStore = vi.fn();
    const clearAll = vi.fn();
    renderWithUI(
      <FilterBar
        chips={[
          {
            id: "store",
            label: "Филиал",
            value: "Худжанд",
            onRemove: removeStore,
          },
          { id: "status", label: "Статус", value: "Оплачено" },
        ]}
        onClearAll={clearAll}
        resultCount={1280}
        actions={<button type="button">Экспорт</button>}
      >
        <label>
          Поиск
          <input />
        </label>
      </FilterBar>,
    );
    expect(screen.getByRole("group", { name: "Фильтры" })).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Активные фильтры" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/Найдено: 1\s280/);
    await expectNoA11yViolations();

    await userEvent.click(
      screen.getByRole("button", { name: "Убрать фильтр: Филиал" }),
    );
    expect(removeStore).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole("button", { name: "Убрать фильтр: Статус" }),
    ).toBeNull();

    await userEvent.tab();
    await userEvent.click(screen.getByRole("button", { name: "Сбросить все" }));
    expect(clearAll).toHaveBeenCalledOnce();
  });

  it("hides the chips row without chips and count", () => {
    renderWithUI(<FilterBar onClearAll={() => {}} />);
    expect(screen.queryByRole("button", { name: "Сбросить все" })).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("renders a custom count node and localizes", () => {
    renderWithUI(
      <FilterBar
        resultCount={12}
        chips={[{ id: "a", label: "Анбор", value: "1", onRemove: () => {} }]}
        onClearAll={() => {}}
      />,
      {
        provider: { locale: "tg" },
      },
    );
    expect(screen.getByRole("status")).toHaveTextContent("Ёфт шуд: 12");
    expect(
      screen.getByRole("button", { name: "Ҳамаро бекор кардан" }),
    ).toBeInTheDocument();
  });
});
