import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NumberField } from "../src";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("NumberField", () => {
  it("accepts a comma decimal and shows the locale separator", async () => {
    const onValueChange = vi.fn();
    renderWithUI(<NumberField aria-label="Вес" step={0.1} onValueChange={onValueChange} />);
    const input = screen.getByRole("spinbutton");
    await userEvent.type(input, "1,5");
    expect(onValueChange).toHaveBeenLastCalledWith(1.5);
    fireEvent.blur(input);
    expect(input).toHaveValue("1,5");
    await expectNoA11yViolations();
  });

  it("steps without floating point noise and clamps", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <NumberField aria-label="Вес" defaultValue={0.2} step={0.1} max={0.4} onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Увеличить" }));
    expect(onValueChange).toHaveBeenLastCalledWith(0.3);
    const input = screen.getByRole("spinbutton");
    input.focus();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(onValueChange).toHaveBeenLastCalledWith(0.4);
    expect(screen.getByRole("button", { name: "Увеличить" })).toBeDisabled();
  });

  it("reports clearing and ignores non-numeric keys", async () => {
    const onClear = vi.fn();
    renderWithUI(<NumberField aria-label="Кол-во" defaultValue={3} onClear={onClear} />);
    const input = screen.getByRole("spinbutton");
    await userEvent.type(input, "x");
    expect(input).toHaveValue("3");
    await userEvent.clear(input);
    expect(onClear).toHaveBeenCalled();
  });

  it("accepts a ReactNode prefix", () => {
    renderWithUI(<NumberField aria-label="Сумма" prefix={<b>с</b>} defaultValue={5} />);
    expect(screen.getByText("с").tagName).toBe("B");
  });
});
