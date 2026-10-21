import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Delta, Sparkline, StatCard } from "../src/components/StatCard";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const nb = (s: string) => s.replace(/[\u00a0\u202f]/g, " ");

describe("StatCard", () => {
  it("formats money amounts, renders delta with default label and a decorative sparkline", async () => {
    const { container } = renderWithUI(
      <StatCard
        label="Выручка"
        amount={1234.5}
        delta={12.5}
        sparkline={[3, 5, 4, 8]}
      />,
    );
    expect(nb(screen.getByText(/1\s234,50/).textContent!)).toBe("1 234,50 с");
    expect(screen.getByText("vs прошлый месяц")).toBeInTheDocument();
    const delta = container.querySelector('[data-slot="delta"]')!;
    expect(nb(delta.textContent!)).toBe("Рост +12,5 %");
    expect(container.querySelector('[data-slot="sparkline"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(container.querySelector("polyline")).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("formats number and percent values", () => {
    renderWithUI(
      <>
        <StatCard label="Заказы" amount={1840} format="number" />
        <StatCard label="Маржа" amount={32.4} format="percent" />
      </>,
    );
    expect(nb(screen.getByText(/1\s840/).textContent!)).toBe("1 840");
    expect(nb(screen.getByText(/32,4/).textContent!)).toBe("32,4 %");
  });

  it("becomes a link or button when interactive", async () => {
    const onClick = vi.fn();
    renderWithUI(
      <>
        <StatCard label="Клиенты" value="312" href="/crm/customers" />
        <StatCard label="Заказы" value="48" onClick={onClick} />
      </>,
    );
    expect(screen.getByRole("link", { name: /Клиенты/ })).toHaveAttribute(
      "href",
      "/crm/customers",
    );
    const btn = screen.getByRole("button", { name: /Заказы/ });
    btn.focus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
    await expectNoA11yViolations();
  });

  it("shows a loading skeleton", async () => {
    const { container } = renderWithUI(
      <StatCard label="Выручка" amount={100} loading />,
    );
    expect(container.querySelector('[data-slot="stat-card"]')).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByText("Загрузка…")).toBeInTheDocument();
    expect(screen.queryByText(/100/)).toBeNull();
    await expectNoA11yViolations();
  });
});

describe("Delta", () => {
  it("uses direction, sign and sentiment, inverted for costs", () => {
    const { container } = renderWithUI(
      <>
        <Delta value={-8.25} />
        <Delta value={-8} invert />
        <Delta value={0} />
      </>,
    );
    const [down, good, flat] = Array.from(
      container.querySelectorAll('[data-slot="delta"]'),
    );
    expect(down).toHaveAttribute("data-direction", "down");
    expect(down).toHaveAttribute("data-sentiment", "negative");
    expect(nb(down.textContent!)).toMatch(/^Снижение -8,3 %$/);
    expect(good).toHaveAttribute("data-sentiment", "positive");
    expect(flat).toHaveAttribute("data-direction", "flat");
    expect(nb(flat.textContent!)).toBe("Без изменений 0 %");
  });

  it("is localized in Tajik", () => {
    const { container } = renderWithUI(<Delta value={4} />, {
      provider: { locale: "tg" },
    });
    expect(container.textContent).toMatch(/^Афзоиш/);
  });
});

describe("Sparkline", () => {
  it("summarizes the trend as an image when asked", async () => {
    renderWithUI(<Sparkline data={[1200, 1300, 1540]} summarize />);
    expect(
      screen.getByRole("img", {
        name: (n) => nb(n) === "Динамика: от 1 200 до 1 540, точек: 3",
      }),
    ).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("handles a single point and empty data", () => {
    const { container } = renderWithUI(
      <>
        <Sparkline data={[5]} />
        <Sparkline data={[]} />
      </>,
    );
    expect(container.querySelectorAll("polyline")).toHaveLength(1);
  });
});
