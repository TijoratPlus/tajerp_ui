import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DonutChart, type DonutDatum } from "../src/components/DonutChart";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const data: DonutDatum[] = [
  { name: "Наличные", value: 600 },
  { name: "Карта", value: 300 },
  { name: "Alif Pay", value: 100 },
];

describe("DonutChart", () => {
  it("renders caption, legend with values and shares, centre and sr-only table", async () => {
    const { container } = renderWithUI(
      <DonutChart
        title="Продажи по способам оплаты"
        centerLabel="Выручка"
        centerValue="total"
        valueFormat="money"
        data={data}
      />,
    );
    expect(
      screen.getByRole("figure", { name: "Продажи по способам оплаты" }),
    ).toBeInTheDocument();

    const legend = screen.getByRole("list");
    const items = within(legend).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Наличные");
    expect(items[0]).toHaveTextContent("600,00 с");
    expect(items[0]).toHaveTextContent(/60\s%/);

    const center = container.querySelector('[data-slot="donut-chart-center"]');
    expect(center).toHaveTextContent("1 000,00 с");
    expect(center).toHaveTextContent("Выручка");

    const table = screen.getByRole("table", {
      name: "Продажи по способам оплаты",
    });
    expect(table).toHaveClass("sr-only");
    expect(within(table).getByRole("row", { name: /Карта/ })).toHaveTextContent(
      /300,00\sс.*30\s%/,
    );
    expect(within(table).getByRole("row", { name: /Итого/ })).toHaveTextContent(
      "1 000,00 с",
    );

    const plot = container.querySelector('[data-slot="donut-chart-plot"]');
    expect(plot).toHaveAttribute("aria-hidden", "true");
    // The fixed-size ring renders its SVG even in jsdom, hidden from AT.
    expect(plot?.querySelector("svg")).not.toBeNull();
    await expectNoA11yViolations();
  });

  it("uses ariaLabel when there is no title", () => {
    renderWithUI(
      <DonutChart
        ariaLabel="Выручка по категориям"
        data={data}
        centerValue={42}
      />,
    );
    expect(
      screen.getByRole("figure", { name: "Выручка по категориям" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "Выручка по категориям" }),
    ).toBeInTheDocument();
  });

  it("shows an empty state for no data or a zero total", async () => {
    const { unmount } = renderWithUI(<DonutChart title="Оплаты" data={[]} />);
    expect(screen.getByText("Нет данных за период")).toBeInTheDocument();
    unmount();
    renderWithUI(
      <DonutChart title="Оплаты" data={[{ name: "Карта", value: 0 }]} />,
    );
    expect(screen.getByText("Нет данных за период")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("shows a loading status", async () => {
    renderWithUI(<DonutChart title="Оплаты" loading data={data} />);
    expect(screen.getByRole("status")).toHaveTextContent("Загрузка…");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("is localized in Tajik", () => {
    renderWithUI(<DonutChart title="Пардохтҳо" data={data} />, {
      provider: { locale: "tg" },
    });
    expect(
      within(screen.getByRole("table")).getByRole("row", { name: /Ҳамагӣ/ }),
    ).toBeInTheDocument();
  });
});
