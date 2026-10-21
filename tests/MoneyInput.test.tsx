import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { MoneyInput } from "../src/components/MoneyInput";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const norm = (s: string) => s.replace(/\s/g, " ");

describe("MoneyInput", () => {
  it("shows raw while focused and grouped on blur; is accessible", async () => {
    const onValueChange = vi.fn();
    const ref = React.createRef<HTMLInputElement>();
    renderWithUI(
      <>
        <label htmlFor="sum">Сумма</label>
        <MoneyInput id="sum" name="sum" ref={ref} onValueChange={onValueChange} />
      </>,
    );
    const input = screen.getByLabelText("Сумма") as HTMLInputElement;
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(input).toHaveAttribute("name", "sum");
    expect(input).toHaveClass("text-right", "tabular-nums");
    expect(screen.getByText("с")).toBeInTheDocument();

    await userEvent.type(input, "1234.5");
    expect(input.value).toBe("1234.5");
    expect(onValueChange).toHaveBeenLastCalledWith(1234.5);
    await userEvent.tab();
    expect(norm(input.value)).toBe("1 234,50");
    await userEvent.click(input);
    expect(input.value).toBe("1234,5");
    await expectNoA11yViolations();
  });

  it("accepts comma decimals and limits fraction digits", async () => {
    const onValueChange = vi.fn();
    renderWithUI(<MoneyInput aria-label="Сумма" onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Сумма") as HTMLInputElement;
    await userEvent.type(input, "12,345abc");
    expect(input.value).toBe("12,34");
    expect(onValueChange).toHaveBeenLastCalledWith(12.34);
  });

  it("clamps to min/max on blur and rejects negatives by default", async () => {
    const onValueChange = vi.fn();
    renderWithUI(<MoneyInput aria-label="Сумма" min={10} max={500} onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Сумма") as HTMLInputElement;
    await userEvent.type(input, "-900");
    expect(input.value).toBe("900");
    await userEvent.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(500);
    expect(norm(input.value)).toBe("500,00");
  });

  it("allows negatives with allowNegative", async () => {
    const onValueChange = vi.fn();
    renderWithUI(<MoneyInput aria-label="Возврат" allowNegative onValueChange={onValueChange} />);
    await userEvent.type(screen.getByLabelText("Возврат"), "-25");
    expect(onValueChange).toHaveBeenLastCalledWith(-25);
  });

  it("is controlled and reports undefined when emptied", async () => {
    function Controlled() {
      const [v, setV] = React.useState<number | undefined>(100);
      return (
        <>
          <MoneyInput aria-label="Сумма" value={v ?? null} onValueChange={setV} fractionDigits={0} />
          <output>{v === undefined ? "empty" : v}</output>
          <button type="button" onClick={() => setV(250)}>
            set
          </button>
        </>
      );
    }
    renderWithUI(<Controlled />);
    const input = screen.getByLabelText("Сумма") as HTMLInputElement;
    expect(input.value).toBe("100");
    await userEvent.clear(input);
    expect(screen.getByRole("status")).toHaveTextContent("empty");
    fireEvent.blur(input);
    expect(input.value).toBe("");
    await userEvent.click(screen.getByRole("button", { name: "set" }));
    expect(input.value).toBe("250");
  });

  it("uses defaultValue uncontrolled and the currency suffix", () => {
    renderWithUI(<MoneyInput aria-label="Сумма" defaultValue={18} currency="USD" disabled />);
    const input = screen.getByLabelText("Сумма") as HTMLInputElement;
    expect(norm(input.value)).toBe("18,00");
    expect(input).toBeDisabled();
    expect(screen.getByText("$")).toBeInTheDocument();
  });
});
