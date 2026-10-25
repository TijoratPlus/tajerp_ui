import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { DatePicker } from "../src/components/DatePicker";
import { Label } from "../src/components/Label";
import { toISODate } from "../src/lib/date";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const TODAY = new Date(2026, 9, 21);

describe("DatePicker", () => {
  it("parses a typed date on blur and on Enter", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <>
        <Label htmlFor="due">Срок оплаты</Label>
        <DatePicker id="due" today={TODAY} onValueChange={onValueChange} />
      </>,
    );
    const input = screen.getByLabelText("Срок оплаты");
    expect(input).toHaveAttribute("placeholder", "дд.мм.гггг");

    await userEvent.type(input, "5/11/2026");
    await userEvent.tab();
    expect(toISODate(onValueChange.mock.lastCall?.[0])).toBe("2026-11-05");
    expect(input).toHaveValue("05.11.2026");

    await userEvent.clear(input);
    await userEvent.type(input, "2026-10-01{Enter}");
    expect(toISODate(onValueChange.mock.lastCall?.[0])).toBe("2026-10-01");
    expect(input).toHaveValue("01.10.2026");
    await expectNoA11yViolations();
  });

  it("marks invalid or out-of-range input with aria-invalid", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <DatePicker
        aria-label="Дата"
        today={TODAY}
        max={TODAY}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Дата" });
    await userEvent.type(input, "31.02.2026{Enter}");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveValue("31.02.2026");

    await userEvent.clear(input);
    expect(input).not.toHaveAttribute("aria-invalid");
    await userEvent.type(input, "01.01.2027{Enter}");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("opens the calendar popover and picks a day", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <DatePicker
        aria-label="Дата накладной"
        today={TODAY}
        defaultValue={new Date(2026, 9, 10)}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Открыть календарь" }));
    const dialog = await screen.findByRole("dialog", { name: "Выбор даты" });
    expect(dialog).toBeInTheDocument();
    // Focus lands on the selected day.
    expect(document.activeElement).toHaveAttribute("data-day", "2026-10-10");
    await expectNoA11yViolations();

    await userEvent.keyboard("{ArrowRight}{Enter}");
    expect(toISODate(onValueChange.mock.lastCall?.[0])).toBe("2026-10-11");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("textbox", { name: "Дата накладной" })).toHaveValue("11.10.2026");
  });

  it("works controlled and clears", async () => {
    function Harness() {
      const [value, setValue] = React.useState<Date | undefined>(new Date(2026, 9, 1));
      return (
        <>
          <DatePicker aria-label="Дата" clearable value={value} onValueChange={setValue} today={TODAY} />
          <output>{value ? toISODate(value) : "—"}</output>
          <button type="button" onClick={() => setValue(new Date(2026, 11, 31))}>
            Конец года
          </button>
        </>
      );
    }
    renderWithUI(<Harness />);
    const input = screen.getByRole("textbox", { name: "Дата" });
    expect(input).toHaveValue("01.10.2026");

    await userEvent.click(screen.getByRole("button", { name: "Конец года" }));
    expect(input).toHaveValue("31.12.2026");

    await userEvent.click(screen.getByRole("button", { name: "Очистить" }));
    expect(input).toHaveValue("");
    expect(screen.getByRole("status")).toHaveTextContent("—");
  });

  it("opens with Alt+ArrowDown and uses the Tajik placeholder", async () => {
    renderWithUI(<DatePicker aria-label="Сана" today={TODAY} />, { provider: { locale: "tg" } });
    const input = screen.getByRole("textbox", { name: "Сана" });
    expect(input).toHaveAttribute("placeholder", "рр.мм.сссс");
    input.focus();
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(await screen.findByRole("dialog", { name: "Интихоби сана" })).toBeInTheDocument();
  });
});
