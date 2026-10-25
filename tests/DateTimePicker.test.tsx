import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  DateTimePicker,
  formatDateTimeInput,
  parseDateTimeInput,
} from "../src/components/DateTimePicker";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const TODAY = new Date(2026, 9, 21);

describe("parseDateTimeInput", () => {
  it("parses date and time", () => {
    expect(parseDateTimeInput("21.10.2026 14:30")).toEqual(new Date(2026, 9, 21, 14, 30));
    expect(parseDateTimeInput("21.10.2026, 930")).toEqual(new Date(2026, 9, 21, 9, 30));
    expect(parseDateTimeInput("2026-10-21T08:05")).toEqual(new Date(2026, 9, 21, 8, 5));
    expect(parseDateTimeInput("21.10.2026")).toEqual(new Date(2026, 9, 21));
    expect(parseDateTimeInput("31.02.2026 10:00")).toBeNull();
    expect(parseDateTimeInput("21.10.2026 25:00")).toBeNull();
    expect(formatDateTimeInput(new Date(2026, 0, 5, 7, 3))).toBe("05.01.2026 07:03");
  });
});

describe("DateTimePicker", () => {
  it("parses typed text on Enter and rejects out-of-range", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <DateTimePicker
        aria-label="Встреча"
        today={TODAY}
        min={new Date(2026, 9, 21, 9, 0)}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Встреча" });
    await userEvent.type(input, "22.10.2026 1015{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 22, 10, 15));
    expect(input).toHaveValue("22.10.2026 10:15");

    await userEvent.clear(input);
    await userEvent.type(input, "21.10.2026 08:00{Enter}");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("picks a day and a time in the popover", async () => {
    function Harness() {
      const [value, setValue] = React.useState<Date | null>(new Date(2026, 9, 10, 11, 0));
      return (
        <>
          <DateTimePicker aria-label="Срок" today={TODAY} value={value} onValueChange={setValue} clearable />
          <output>{value ? formatDateTimeInput(value) : "—"}</output>
        </>
      );
    }
    renderWithUI(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Выбрать дату и время" }));
    const dialog = await screen.findByRole("dialog", { name: "Выбор даты и времени" });
    expect(dialog).toBeInTheDocument();
    await expectNoA11yViolations();

    // Arrow to the next day keeps the time.
    await userEvent.keyboard("{ArrowRight}{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent("11.10.2026 11:00");

    await userEvent.click(screen.getByRole("button", { name: "14:45" }));
    expect(screen.getByRole("status")).toHaveTextContent("11.10.2026 14:45");
    expect(screen.queryByRole("dialog")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Очистить" }));
    expect(screen.getByRole("status")).toHaveTextContent("—");
  });

  it("uses Tajik strings", () => {
    renderWithUI(<DateTimePicker aria-label="Мулоқот" />, { provider: { locale: "tg" } });
    expect(screen.getByRole("textbox", { name: "Мулоқот" })).toHaveAttribute(
      "placeholder",
      "рр.мм.сссс сс:дд",
    );
    expect(screen.getByRole("button", { name: "Интихоби сана ва вақт" })).toBeInTheDocument();
  });
});
