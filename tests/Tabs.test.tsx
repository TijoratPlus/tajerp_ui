import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SegmentedControl, Tabs, type TabItem } from "../src";
import { fitTabs } from "../src/components/Tabs";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("Tabs", () => {
  it("moves with arrows, skips disabled tabs and keeps panels mounted", async () => {
    renderWithUI(
      <Tabs
        aria-label="Документ"
        keepMounted
        tabs={[
          { id: "main", label: "Основное", content: <input aria-label="Имя" /> },
          { id: "x", label: "Архив", disabled: true, content: <p>Архив</p> },
          { id: "items", label: "Товары", content: <p>Список</p> },
        ]}
      />,
    );
    await userEvent.type(screen.getByLabelText("Имя"), "Чек 1");
    screen.getByRole("tab", { name: "Основное" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Товары" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByLabelText("Имя")).toHaveValue("Чек 1");
    await expectNoA11yViolations();
  });
});

describe("Tabs overflow menu", () => {
  it("fits as many tabs as the width allows, leaving room for More", () => {
    expect(fitTabs([100, 100, 100], 64, 400)).toBe(3);
    // 100 + 4 + 100 + 4 + (60 + 4) = 272 ≤ 300; a third tab would not fit.
    expect(fitTabs([100, 100, 100, 100], 64, 300)).toBe(2);
    expect(fitTabs([500], 64, 300)).toBe(1);
  });

  const TABS: TabItem[] = [
    { id: "conv", label: "Переписка", content: <p>Чат</p> },
    { id: "act", label: "Активность", content: <p>Лента</p> },
    { id: "notes", label: "Заметки", content: <p>Заметки клиента</p> },
    { id: "tasks", label: "Задачи", content: <p>Задачи клиента</p> },
    { id: "files", label: "Файлы", content: <p>Файлы клиента</p> },
  ];

  /** Every measured trigger is 100px, "More" 60px, the strip 330px. */
  function mockLayout() {
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get(this: HTMLElement) {
        if (this.hasAttribute("data-measure-tab")) return 100;
        if (this.hasAttribute("data-measure-more")) return 60;
        return 0;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get(this: HTMLElement) {
        return this.getAttribute("data-slot") === "tabs-strip" ? 330 : 0;
      },
    });
  }
  afterEach(() => {
    delete (HTMLElement.prototype as unknown as Record<string, unknown>).offsetWidth;
    delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientWidth;
  });

  it("moves the tabs that do not fit into More and keeps the active tab visible", async () => {
    mockLayout();
    const onTabChange = vi.fn();
    renderWithUI(<Tabs aria-label="Лид" overflow="menu" tabs={TABS} onTabChange={onTabChange} />);
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["Переписка", "Активность"]);
    const more = screen.getByRole("button", { name: /Ещё/ });
    expect(more).toHaveTextContent("(3)");

    await userEvent.click(more);
    await userEvent.click(await screen.findByRole("menuitem", { name: "Задачи" }));
    expect(onTabChange).toHaveBeenCalledWith(3);
    // The chosen tab takes the last slot in the strip.
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["Переписка", "Задачи"]);
    expect(screen.getByRole("tab", { name: "Задачи" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Задачи клиента");
    await expectNoA11yViolations();
  });

  it("shows every tab and no More button when they fit", () => {
    renderWithUI(<Tabs aria-label="Лид" overflow="menu" tabs={TABS.slice(0, 2)} />);
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: /Ещё/ })).toBeNull();
  });

  it("moves with arrows across the visible tabs only", async () => {
    mockLayout();
    renderWithUI(<Tabs aria-label="Лид" overflow="menu" tabs={TABS} />);
    screen.getByRole("tab", { name: "Переписка" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Активность" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Переписка" })).toHaveFocus();
  });
});

describe("SegmentedControl", () => {
  it("calls onValueChange and the deprecated onChange", async () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    function Harness() {
      const [v, setV] = React.useState("ru");
      return (
        <SegmentedControl
          aria-label="Язык"
          value={v}
          onValueChange={(x) => {
            setV(x);
            onValueChange(x);
          }}
          onChange={onChange}
          options={[
            { value: "ru", label: "RU" },
            { value: "tg", label: "TJ" },
            { value: "en", label: "EN" },
          ]}
        />
      );
    }
    renderWithUI(<Harness />);
    screen.getByRole("radio", { name: "RU" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith("tg");
    expect(onChange).toHaveBeenCalledWith("tg");
    expect(screen.getByRole("radio", { name: "TJ" })).toHaveFocus();
  });
});
