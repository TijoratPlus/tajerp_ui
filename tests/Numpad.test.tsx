import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { Numpad, applyNumpadKey } from "../src/components/Numpad";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const norm = (s: string | null) => (s ?? "").replace(/\s/g, " ");

describe("applyNumpadKey", () => {
  it("handles leading zeros, decimals and limits", () => {
    expect(applyNumpadKey("0", "5")).toBe("5");
    expect(applyNumpadKey("", "00")).toBe("0");
    expect(applyNumpadKey("", "decimal")).toBe("0.");
    expect(applyNumpadKey("1.5", "decimal")).toBe("1.5");
    expect(applyNumpadKey("1.25", "7")).toBe("1.25");
    expect(applyNumpadKey("1.2", "00")).toBe("1.20");
    expect(applyNumpadKey("123", "4", { maxLength: 3 })).toBe("123");
    expect(applyNumpadKey("12", "decimal", { maxDecimals: 0 })).toBe("12");
    expect(applyNumpadKey("12", "backspace")).toBe("1");
    expect(applyNumpadKey("12", "clear")).toBe("");
  });
});

describe("Numpad", () => {
  it("enters digits by pointer, shows the value and is accessible", async () => {
    const onValueChange = vi.fn();
    renderWithUI(<Numpad onValueChange={onValueChange} displaySuffix="с" />);
    const pad = screen.getByRole("group", { name: "Цифровая клавиатура" });
    await userEvent.click(screen.getByRole("button", { name: "1" }));
    await userEvent.click(screen.getByRole("button", { name: "2" }));
    await userEvent.click(screen.getByRole("button", { name: "Два нуля" }));
    await userEvent.click(screen.getByRole("button", { name: "0" }));
    expect(onValueChange).toHaveBeenLastCalledWith("12000");
    expect(norm(within(pad).getByRole("status").textContent)).toBe("12 000с");
    await userEvent.click(screen.getByRole("button", { name: "Десятичный разделитель" }));
    await userEvent.click(screen.getByRole("button", { name: "5" }));
    expect(onValueChange).toHaveBeenLastCalledWith("12000.5");
    expect(norm(within(pad).getByRole("status").textContent)).toBe("12 000,5с");
    await userEvent.click(screen.getByRole("button", { name: "Удалить последнюю цифру" }));
    expect(onValueChange).toHaveBeenLastCalledWith("12000.");
    await userEvent.click(screen.getByRole("button", { name: "Очистить" }));
    expect(onValueChange).toHaveBeenLastCalledWith("");
    await expectNoA11yViolations();
  });

  it("supports the physical keyboard when focused", async () => {
    const onEnter = vi.fn();
    const onValueChange = vi.fn();
    renderWithUI(<Numpad onEnter={onEnter} onValueChange={onValueChange} />);
    const pad = screen.getByRole("group", { name: "Цифровая клавиатура" });
    await userEvent.tab();
    expect(pad).toHaveFocus();
    await userEvent.keyboard("75,5");
    expect(onValueChange).toHaveBeenLastCalledWith("75.5");
    await userEvent.keyboard("{Backspace}");
    expect(onValueChange).toHaveBeenLastCalledWith("75.");
    await userEvent.keyboard("{Enter}");
    expect(onEnter).toHaveBeenCalledWith("75.");
    await userEvent.keyboard("{Delete}");
    expect(onValueChange).toHaveBeenLastCalledWith("");
    // Keys never steal focus from the keypad.
    await userEvent.click(screen.getByRole("button", { name: "9" }));
    expect(pad).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onEnter).toHaveBeenLastCalledWith("9");
  });

  it("is accessible with quick amounts and the OK key", async () => {
    renderWithUI(<Numpad quickAmounts={[50, 100]} onEnter={() => {}} />, {
      provider: { locale: "tg" },
    });
    expect(screen.getByRole("button", { name: "Нест кардани рақами охирин" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("sets quick amounts and respects maxLength / maxDecimals / optional keys", async () => {
    function Controlled() {
      const [v, setV] = React.useState("");
      return (
        <>
          <Numpad
            value={v}
            onValueChange={setV}
            quickAmounts={[50, 100, 200]}
            maxLength={4}
            maxDecimals={0}
            doubleZeroKey={false}
          />
          <p data-testid="v">{v}</p>
        </>
      );
    }
    renderWithUI(<Controlled />);
    expect(screen.queryByRole("button", { name: "Два нуля" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Десятичный разделитель" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: /Ввести 100/ }));
    expect(screen.getByTestId("v")).toHaveTextContent("100");
    await userEvent.click(screen.getByRole("button", { name: "5" }));
    await userEvent.click(screen.getByRole("button", { name: "5" }));
    expect(screen.getByTestId("v")).toHaveTextContent(/^1005$/);
  });

  it("uses the en decimal separator and disables everything", () => {
    const onValueChange = vi.fn();
    const { rerender } = renderWithUI(<Numpad defaultValue="1.5" />, { provider: { locale: "en" } });
    expect(screen.getByRole("button", { name: "Decimal separator" })).toHaveTextContent(".");
    expect(screen.getByRole("status")).toHaveTextContent("1.5");
    rerender(<Numpad disabled onValueChange={onValueChange} />);
    const pad = screen.getByRole("group", { name: "Numeric keypad" });
    fireEvent.keyDown(pad, { key: "5" });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "5" })).toBeDisabled();
  });
});
