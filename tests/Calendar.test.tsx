import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { Calendar } from "../src/components/Calendar";
import { toISODate, type DateRange } from "../src/lib/date";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const TODAY = new Date(2026, 9, 21); // Wednesday, 21 October 2026

const day = (label: string) => screen.getByRole("button", { name: label });
const focusedDay = () => (document.activeElement as HTMLElement).getAttribute("data-day");

describe("Calendar", () => {
  it("renders a localized Monday-first grid with today marked", async () => {
    renderWithUI(<Calendar today={TODAY} />);
    expect(screen.getByRole("grid", { name: "Октябрь 2026" })).toBeInTheDocument();
    const headers = screen.getAllByRole("columnheader").map((h) => h.textContent);
    expect(headers).toEqual(["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]);
    const today = day("среда, 21 октября 2026 г.");
    expect(today).toHaveAttribute("aria-current", "date");
    expect(today).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("button", { name: "Предыдущий месяц" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("uses Tajik month and weekday names", () => {
    renderWithUI(<Calendar today={TODAY} />, { provider: { locale: "tg" } });
    expect(screen.getByRole("grid", { name: "Октябр 2026" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual([
      "Дш", "Сш", "Чш", "Пш", "Ҷм", "Шб", "Яш",
    ]);
    expect(day("чоршанбе, 21 октябри 2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Моҳи оянда" })).toBeInTheDocument();
  });

  it("selects a single day (uncontrolled) and reports it", async () => {
    const onSelect = vi.fn();
    renderWithUI(<Calendar today={TODAY} onSelect={onSelect} />);
    await userEvent.click(day("пятница, 9 октября 2026 г."));
    expect(toISODate(onSelect.mock.calls[0][0])).toBe("2026-10-09");
    expect(day("пятница, 9 октября 2026 г.").closest("td")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("moves focus with the keyboard and follows into other months", async () => {
    const onMonthChange = vi.fn();
    renderWithUI(<Calendar today={TODAY} onMonthChange={onMonthChange} />);
    await userEvent.tab(); // previous-month button
    await userEvent.tab(); // next-month button
    await userEvent.tab(); // the roving day
    expect(focusedDay()).toBe("2026-10-21");

    await userEvent.keyboard("{ArrowRight}");
    expect(focusedDay()).toBe("2026-10-22");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(focusedDay()).toBe("2026-10-20");
    await userEvent.keyboard("{ArrowDown}");
    expect(focusedDay()).toBe("2026-10-27");
    await userEvent.keyboard("{ArrowUp}");
    expect(focusedDay()).toBe("2026-10-20");
    await userEvent.keyboard("{Home}");
    expect(focusedDay()).toBe("2026-10-19");
    await userEvent.keyboard("{End}");
    expect(focusedDay()).toBe("2026-10-25");

    await userEvent.keyboard("{PageDown}");
    expect(focusedDay()).toBe("2026-11-25");
    expect(screen.getByRole("grid", { name: "Ноябрь 2026" })).toBeInTheDocument();
    expect(toISODate(onMonthChange.mock.lastCall?.[0])).toBe("2026-11-01");

    await userEvent.keyboard("{Shift>}{PageUp}{/Shift}");
    expect(focusedDay()).toBe("2025-11-25");
    expect(screen.getByRole("grid", { name: "Ноябрь 2025" })).toBeInTheDocument();

    await userEvent.keyboard("{PageUp}");
    expect(focusedDay()).toBe("2025-10-25");

    // Only one day is in the tab order.
    const tabbable = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("data-day") && b.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
  });

  it("selects with Enter and Space", async () => {
    const onSelect = vi.fn();
    renderWithUI(<Calendar today={TODAY} onSelect={onSelect} autoFocus />);
    expect(focusedDay()).toBe("2026-10-21");
    await userEvent.keyboard("{ArrowRight}{Enter}");
    expect(toISODate(onSelect.mock.lastCall?.[0])).toBe("2026-10-22");
    await userEvent.keyboard("{ArrowRight}[Space]");
    expect(toISODate(onSelect.mock.lastCall?.[0])).toBe("2026-10-23");
  });

  it("respects min, max and disabled days", async () => {
    const onSelect = vi.fn();
    renderWithUI(
      <Calendar
        today={TODAY}
        min={new Date(2026, 9, 5)}
        max={new Date(2026, 9, 25)}
        disabled={(d) => d.getDay() === 0}
        onSelect={onSelect}
        autoFocus
      />,
    );
    const early = day("воскресенье, 4 октября 2026 г.");
    expect(early).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(early);
    await userEvent.click(day("воскресенье, 18 октября 2026 г."));
    await userEvent.click(day("понедельник, 26 октября 2026 г."));
    expect(onSelect).not.toHaveBeenCalled();

    expect(screen.getByRole("button", { name: "Предыдущий месяц" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Следующий месяц" })).toBeDisabled();

    // Keyboard focus is clamped to the bounds.
    day("среда, 21 октября 2026 г.").focus();
    await userEvent.keyboard("{PageDown}");
    expect(focusedDay()).toBe("2026-10-25");
    await userEvent.keyboard("{Shift>}{PageUp}{/Shift}");
    expect(focusedDay()).toBe("2026-10-05");
  });

  it("navigates months with the prev/next buttons", async () => {
    renderWithUI(<Calendar today={TODAY} />);
    await userEvent.click(screen.getByRole("button", { name: "Следующий месяц" }));
    expect(screen.getByRole("grid", { name: "Ноябрь 2026" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Предыдущий месяц" }));
    await userEvent.click(screen.getByRole("button", { name: "Предыдущий месяц" }));
    expect(screen.getByRole("grid", { name: "Сентябрь 2026" })).toBeInTheDocument();
  });

  it("selects a range in two clicks, swapping a reversed pick", async () => {
    const onSelect = vi.fn();
    function Harness() {
      const [range, setRange] = React.useState<DateRange>({});
      return (
        <Calendar
          mode="range"
          today={TODAY}
          selected={range}
          onSelect={(r) => {
            setRange(r);
            onSelect(r);
          }}
        />
      );
    }
    renderWithUI(<Harness />);
    await userEvent.click(day("среда, 14 октября 2026 г."));
    expect(onSelect.mock.lastCall?.[0].to).toBeUndefined();

    // Hover previews the range.
    await userEvent.hover(day("пятница, 9 октября 2026 г."));
    expect(day("понедельник, 12 октября 2026 г.")).toHaveAttribute("data-range-middle");

    await userEvent.click(day("пятница, 9 октября 2026 г."));
    const r = onSelect.mock.lastCall?.[0] as DateRange;
    expect(toISODate(r.from as Date)).toBe("2026-10-09");
    expect(toISODate(r.to as Date)).toBe("2026-10-14");

    expect(day("пятница, 9 октября 2026 г.")).toHaveAttribute("data-range-start");
    expect(day("среда, 14 октября 2026 г.")).toHaveAttribute("data-range-end");
    expect(day("понедельник, 12 октября 2026 г.").closest("td")).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // A third click starts a new range.
    await userEvent.click(day("вторник, 20 октября 2026 г."));
    expect(onSelect.mock.lastCall?.[0].to).toBeUndefined();
    await expectNoA11yViolations();
  });

  it("shows two months side by side", () => {
    renderWithUI(
      <Calendar mode="range" today={TODAY} numberOfMonths={2} defaultMonth={new Date(2026, 8, 1)} />,
    );
    expect(screen.getByRole("grid", { name: "Сентябрь 2026" })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: "Октябрь 2026" })).toBeInTheDocument();
  });

  it("hides outside days when showOutsideDays is false", () => {
    renderWithUI(<Calendar today={TODAY} showOutsideDays={false} />);
    expect(screen.queryByRole("button", { name: "понедельник, 28 сентября 2026 г." })).toBeNull();
  });
});
