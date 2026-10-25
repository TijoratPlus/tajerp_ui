import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { Label } from "../src/components/Label";
import { TimePicker } from "../src/components/TimePicker";
import { parseTimeInput } from "../src/lib/time";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("parseTimeInput", () => {
  it("accepts the ways people type a time", () => {
    expect(parseTimeInput("9")).toBe(9 * 3600);
    expect(parseTimeInput("930")).toBe(9 * 3600 + 30 * 60);
    expect(parseTimeInput("09.30")).toBe(9 * 3600 + 30 * 60);
    expect(parseTimeInput("9:3")).toBe(9 * 3600 + 30 * 60);
    expect(parseTimeInput("23:59:15")).toBe(23 * 3600 + 59 * 60 + 15);
    expect(parseTimeInput("24:00")).toBeNull();
    expect(parseTimeInput("9:75")).toBeNull();
    expect(parseTimeInput("abc")).toBeNull();
  });
});

describe("TimePicker", () => {
  it("parses typed input on blur and marks invalid input", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <>
        <Label htmlFor="call">Время звонка</Label>
        <TimePicker id="call" onValueChange={onValueChange} />
      </>,
    );
    const input = screen.getByRole("combobox", { name: "Время звонка" });
    expect(input).toHaveAttribute("placeholder", "чч:мм");
    await userEvent.type(input, "1430");
    await userEvent.tab();
    expect(onValueChange).toHaveBeenLastCalledWith("14:30");
    expect(input).toHaveValue("14:30");

    await userEvent.clear(input);
    await userEvent.type(input, "25:00{Enter}");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("picks a slot from the list with the keyboard", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <TimePicker aria-label="Начало" defaultValue="09:00" step={30} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole("combobox", { name: "Начало" });
    input.focus();
    const list = await screen.findByRole("listbox", { name: "Время" });
    expect(list).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "09:00" })).toHaveAttribute("aria-selected", "true");
    await expectNoA11yViolations();

    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("09:30");
    expect(input).toHaveValue("09:30");
  });

  it("works controlled, with seconds and min/max", async () => {
    function Harness() {
      const [value, setValue] = React.useState("10:00:00");
      return (
        <>
          <TimePicker
            aria-label="Время"
            withSeconds
            clearable
            min="08:00"
            max="18:00"
            value={value}
            onValueChange={setValue}
          />
          <output>{value || "—"}</output>
        </>
      );
    }
    renderWithUI(<Harness />);
    const input = screen.getByRole("combobox", { name: "Время" });
    expect(input).toHaveValue("10:00:00");
    await userEvent.clear(input);
    await userEvent.type(input, "7:00{Enter}");
    expect(input).toHaveAttribute("aria-invalid", "true");
    await userEvent.clear(input);
    await userEvent.type(input, "12:15{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent("12:15:00");
    await userEvent.click(screen.getByRole("button", { name: "Очистить" }));
    expect(screen.getByRole("status")).toHaveTextContent("—");
  });

  it("uses Tajik strings", () => {
    renderWithUI(<TimePicker aria-label="Вақт" />, { provider: { locale: "tg" } });
    expect(screen.getByRole("combobox", { name: "Вақт" })).toHaveAttribute("placeholder", "сс:дд");
  });
});
