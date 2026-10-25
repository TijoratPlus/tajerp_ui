import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AxisChart, type AxisChartConfig } from "../src/components/AxisChart";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const config: AxisChartConfig = {
  title: "Оплаты по способам",
  data: [
    { day: "Пн", cash: 18400, card: 9200.5 },
    { day: "Вт", cash: 16900, card: 11800 },
  ],
  xAxis: { key: "day", title: "День" },
  valueFormat: "money",
  series: [
    { name: "cash", label: "Наличные", stack: "p" },
    { name: "card", label: "Карта", type: "area" },
  ],
};

describe("AxisChart", () => {
  it("renders a figure with caption and an sr-only data table", async () => {
    const { container } = renderWithUI(<AxisChart config={config} />);
    const figure = screen.getByRole("figure", { name: "Оплаты по способам" });
    expect(figure).toHaveAttribute("data-slot", "axis-chart");
    expect(
      within(figure).getByText("Оплаты по способам", {
        selector: "figcaption",
      }),
    ).toBeInTheDocument();

    const table = screen.getByRole("table", { name: "Оплаты по способам" });
    expect(table).toHaveClass("sr-only");
    const headers = within(table)
      .getAllByRole("columnheader")
      .map((h) => h.textContent);
    expect(headers).toEqual(["День", "Наличные", "Карта"]);
    const row = within(table).getByRole("row", { name: /Пн/ });
    expect(row).toHaveTextContent("18 400,00 с");
    expect(row).toHaveTextContent("9 200,50 с");

    expect(
      container.querySelector('[data-slot="axis-chart-plot"]'),
    ).toHaveAttribute("aria-hidden", "true");
    await expectNoA11yViolations();
  });

  it("formats x values as dates and supports custom formatters", () => {
    renderWithUI(
      <AxisChart
        ariaLabel="Маржа"
        config={{
          data: [{ d: "2026-10-21", m: 12.5 }],
          xAxis: { key: "d", format: "date" },
          valueFormat: (v) => `${v} pp`,
          series: [{ name: "m", type: "line" }],
        }}
      />,
    );
    expect(screen.getByRole("figure", { name: "Маржа" })).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Маржа" });
    expect(within(table).getByRole("rowheader")).toHaveTextContent(
      "21.10.2026",
    );
    expect(within(table).getByRole("cell")).toHaveTextContent("12.5 pp");
    // Default category header comes from the messages.
    expect(within(table).getAllByRole("columnheader")[0]).toHaveTextContent(
      "Категория",
    );
  });

  it("prints percent values", () => {
    renderWithUI(
      <AxisChart
        config={{
          data: [{ p: "Окт", m: 26.25 }],
          xAxis: { key: "p" },
          valueFormat: "percent",
          series: [{ name: "m" }],
        }}
      />,
    );
    expect(screen.getByRole("cell")).toHaveTextContent(/26,3\s%/);
  });

  it("shows a localized empty state when there is no data", async () => {
    renderWithUI(<AxisChart config={{ ...config, data: [] }} />);
    expect(screen.getByText("Нет данных за период")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("shows a loading status", async () => {
    renderWithUI(<AxisChart loading config={config} />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Загрузка…");
    expect(screen.getByRole("figure")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("localizes strings and accepts label overrides", () => {
    const { unmount } = renderWithUI(
      <AxisChart config={{ ...config, data: [] }} />,
      {
        provider: { locale: "tg" },
      },
    );
    expect(
      screen.getByText("Барои ин давра маълумот нест"),
    ).toBeInTheDocument();
    unmount();
    renderWithUI(
      <AxisChart loading labels={{ loading: "Считаем…" }} config={config} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Считаем…");
  });
});
