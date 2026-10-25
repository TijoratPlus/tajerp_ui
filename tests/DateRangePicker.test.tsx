import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DateRangePicker } from "../src/components/DateRangePicker";
import { toISODate, type DateRange } from "../src/lib/date";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const TODAY = new Date(2026, 9, 21);

const iso = (r: DateRange) => [toISODate(r.from as Date), toISODate(r.to as Date)];

describe("DateRangePicker", () => {
  it("shows the placeholder and the formatted range", () => {
    const { rerender } = renderWithUI(<DateRangePicker today={TODAY} />);
    expect(screen.getByRole("button", { name: "Выберите период" })).toBeInTheDocument();
    rerender(
      <DateRangePicker
        today={TODAY}
        value={{ from: new Date(2026, 9, 1), to: new Date(2026, 9, 21) }}
      />,
    );
    expect(screen.getByRole("button", { name: "01.10.2026 – 21.10.2026" })).toBeInTheDocument();
  });

  it("applies a preset range", async () => {
    const onValueChange = vi.fn();
    renderWithUI(<DateRangePicker today={TODAY} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Выберите период" }));
    expect(await screen.findByRole("dialog", { name: "Выбор периода" })).toBeInTheDocument();
    await expectNoA11yViolations();

    const preset = screen.getByRole("button", { name: "Последние 7 дней" });
    await userEvent.click(preset);
    expect(preset).toHaveAttribute("aria-pressed", "true");
    expect(onValueChange).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Применить" }));
    expect(iso(onValueChange.mock.lastCall?.[0])).toEqual(["2026-10-15", "2026-10-21"]);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "15.10.2026 – 21.10.2026" })).toBeInTheDocument();
  });

  it.each([
    ["Сегодня", "2026-10-21", "2026-10-21"],
    ["Вчера", "2026-10-20", "2026-10-20"],
    ["Последние 30 дней", "2026-09-22", "2026-10-21"],
    ["Этот месяц", "2026-10-01", "2026-10-21"],
    ["Прошлый месяц", "2026-09-01", "2026-09-30"],
    ["Этот квартал", "2026-10-01", "2026-10-21"],
    ["Этот год", "2026-01-01", "2026-10-21"],
  ])("preset %s → %s … %s", async (label, from, to) => {
    const onValueChange = vi.fn();
    renderWithUI(<DateRangePicker today={TODAY} onValueChange={onValueChange} defaultOpen />);
    await userEvent.click(screen.getByRole("button", { name: label }));
    await userEvent.click(screen.getByRole("button", { name: "Применить" }));
    expect(iso(onValueChange.mock.lastCall?.[0])).toEqual([from, to]);
  });

  it("picks a range on the calendar; Cancel discards it", async () => {
    const onValueChange = vi.fn();
    renderWithUI(<DateRangePicker today={TODAY} onValueChange={onValueChange} />);
    const trigger = screen.getByRole("button", { name: "Выберите период" });

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "суббота, 3 октября 2026 г." }));
    await userEvent.click(screen.getByRole("button", { name: "понедельник, 12 октября 2026 г." }));
    await userEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveTextContent("Выберите период");

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "суббота, 3 октября 2026 г." }));
    await userEvent.click(screen.getByRole("button", { name: "понедельник, 12 октября 2026 г." }));
    await userEvent.click(screen.getByRole("button", { name: "Применить" }));
    expect(iso(onValueChange.mock.lastCall?.[0])).toEqual(["2026-10-03", "2026-10-12"]);
  });

  it("accepts custom presets and Tajik labels", async () => {
    renderWithUI(
      <DateRangePicker
        today={TODAY}
        defaultOpen
        presets={[
          { id: "shift", label: "Басти ҷорӣ", range: (t) => ({ from: t, to: t }) },
        ]}
      />,
      { provider: { locale: "tg" } },
    );
    expect(await screen.findByRole("dialog", { name: "Интихоби давра" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Басти ҷорӣ" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Имрӯз" })).toBeNull();
    expect(screen.getByRole("button", { name: "Татбиқ кардан" })).toBeDisabled();
  });
});
