import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl, Tabs } from "../src";
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
