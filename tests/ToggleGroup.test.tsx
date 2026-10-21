import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoldIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { Toggle } from "../src/components/Toggle";
import { ToggleGroup, ToggleGroupItem } from "../src/components/ToggleGroup";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("Toggle", () => {
  it("toggles aria-pressed (uncontrolled) and reports changes", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    renderWithUI(
      <Toggle aria-label="Жирный" onPressedChange={onPressedChange}>
        <BoldIcon aria-hidden />
      </Toggle>,
    );
    const btn = screen.getByRole("button", { name: "Жирный" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(onPressedChange).toHaveBeenCalledWith(true);
    await expectNoA11yViolations();
  });
});

describe("ToggleGroup", () => {
  it("single: one value, arrow-key navigation", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUI(
      <ToggleGroup
        type="single"
        defaultValue="day"
        onValueChange={onValueChange}
        aria-label="Период"
        variant="outline"
      >
        <ToggleGroupItem value="day">День</ToggleGroupItem>
        <ToggleGroupItem value="week">Неделя</ToggleGroupItem>
        <ToggleGroupItem value="month">Месяц</ToggleGroupItem>
      </ToggleGroup>,
    );
    const day = screen.getByRole("radio", { name: "День" });
    expect(day).toHaveAttribute("aria-checked", "true");
    await expectNoA11yViolations();

    await user.tab();
    expect(day).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    const week = screen.getByRole("radio", { name: "Неделя" });
    expect(week).toHaveFocus();
    await user.keyboard(" ");
    expect(onValueChange).toHaveBeenCalledWith("week");
    expect(week).toHaveAttribute("aria-checked", "true");
    expect(day).toHaveAttribute("aria-checked", "false");
  });

  it("multiple: controlled value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUI(
      <ToggleGroup
        type="multiple"
        value={["low"]}
        onValueChange={onValueChange}
        aria-label="Фильтр остатков"
        size="sm"
      >
        <ToggleGroupItem value="low">Мало</ToggleGroupItem>
        <ToggleGroupItem value="out">Нет в наличии</ToggleGroupItem>
      </ToggleGroup>,
    );
    const out = screen.getByRole("button", { name: "Нет в наличии" });
    expect(screen.getByRole("button", { name: "Мало" })).toHaveAttribute("aria-pressed", "true");
    expect(out.className).toContain("h-control-sm");
    await user.click(out);
    expect(onValueChange).toHaveBeenCalledWith(["low", "out"]);
    // Controlled: unchanged until the parent updates.
    expect(out).toHaveAttribute("aria-pressed", "false");
    await expectNoA11yViolations();
  });
});
