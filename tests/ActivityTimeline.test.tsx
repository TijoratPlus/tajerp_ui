import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ActivityTimeline,
  type ActivityItem,
} from "../src/components/ActivityTimeline";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const now = new Date(2026, 9, 21, 15, 0).getTime();
const items: ActivityItem[] = [
  {
    id: "1",
    actor: { name: "Фарида Рахимова", kind: "user" },
    action: "утвердила заказ поставщику",
    target: "ЗП-00142",
    time: now - 10 * 60_000,
    tone: "success",
  },
  {
    id: "2",
    actor: { name: "TijoratAI", kind: "ai" },
    action: "подготовил черновик заказа",
    target: "ЗП-00142",
    time: now - 2 * 3600_000,
    meta: "12 позиций · 8 450,00 с",
  },
  {
    id: "3",
    actor: { name: "Система", kind: "system" },
    action: "закрыла смену",
    time: new Date(2026, 9, 20, 22, 0),
  },
  {
    id: "4",
    actor: { name: "Алишер Каримов" },
    action: "добавил поставщика",
    time: new Date(2026, 9, 12, 10, 0).toISOString(),
  },
];

describe("ActivityTimeline", () => {
  it("renders actors, AI badge, relative times with full-date titles", async () => {
    const { container } = renderWithUI(
      <ActivityTimeline items={items} now={now} />,
    );
    const list = screen.getByRole("list", { name: "Журнал действий" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText("10 минут назад")).toBeInTheDocument();
    const time = screen.getByText("10 минут назад");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute(
      "dateTime",
      new Date(now - 10 * 60_000).toISOString(),
    );
    expect(time.getAttribute("title")).toMatch(/2026/);
    const badge = container.querySelector(
      '[data-slot="activity-timeline-ai-badge"]',
    )!;
    expect(badge).toHaveTextContent("AI");
    expect(badge.closest("li")).toHaveAttribute("data-actor-kind", "ai");
    expect(screen.getByText("12 позиций · 8 450,00 с")).toBeInTheDocument();
    // One connector fewer than items.
    expect(
      container.querySelectorAll('[data-slot="activity-timeline-line"]'),
    ).toHaveLength(3);
    await expectNoA11yViolations();
  });

  it("groups by day with Сегодня / Вчера / date headings", async () => {
    renderWithUI(<ActivityTimeline items={items} now={now} groupByDay />);
    expect(screen.getByRole("list", { name: "Сегодня" }).children).toHaveLength(
      2,
    );
    expect(screen.getByRole("list", { name: "Вчера" }).children).toHaveLength(
      1,
    );
    expect(
      screen.getByRole("list", { name: /12 октября/ }),
    ).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("is localized in Tajik and shows an empty state", () => {
    const { rerender } = renderWithUI(
      <ActivityTimeline items={items} now={now} groupByDay />,
      {
        provider: { locale: "tg" },
      },
    );
    expect(screen.getByRole("list", { name: "Имрӯз" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Дирӯз" })).toBeInTheDocument();
    rerender(<ActivityTimeline items={[]} />);
    expect(screen.getByText("Ҳоло ягон амал нест")).toBeInTheDocument();
  });
});
