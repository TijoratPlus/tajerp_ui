import { screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Money, currencySymbol } from "../src/components/Money";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const norm = (s: string | null | undefined) => (s ?? "").replace(/\s/g, " ");

describe("Money", () => {
  it("prints somoni with grouping and a spoken amount, and is accessible", async () => {
    const ref = createRef<HTMLDataElement>();
    const { container } = renderWithUI(
      <p>
        Итого: <Money ref={ref} value={1234.5} />
      </p>,
    );
    const el = container.querySelector('[data-slot="money"]') as HTMLDataElement;
    expect(ref.current).toBe(el);
    expect(el.tagName).toBe("DATA");
    expect(el).toHaveAttribute("value", "1234.5");
    expect(el).toHaveClass("tabular-nums");
    expect(norm(el.querySelector('[data-slot="money-text"]')?.textContent)).toBe("1 234,50 с");
    expect(el.querySelector('[data-slot="money-text"]')).toHaveAttribute("aria-hidden", "true");
    expect(norm(el.querySelector(".sr-only")?.textContent)).toBe("1 234,50 сомони");
    await expectNoA11yViolations();
  });

  it("colours negatives only with colorNegative", () => {
    const { rerender, container } = renderWithUI(<Money value={-50} />);
    const el = () => container.querySelector('[data-slot="money"]') as HTMLElement;
    expect(el()).not.toHaveClass("text-tj-error-ink");
    expect(el()).toHaveAttribute("data-negative", "true");
    rerender(<Money value={-50} colorNegative />);
    expect(el()).toHaveClass("text-tj-error-ink");
    rerender(<Money value={50} colorNegative />);
    expect(el()).not.toHaveClass("text-tj-error-ink");
    rerender(<Money value={50} tone="success" />);
    expect(el()).toHaveClass("text-tj-success-ink");
  });

  it("supports hideSymbol, fractionDigits, sizes and strikethrough", () => {
    const { container, rerender } = renderWithUI(<Money value={18} hideSymbol fractionDigits={0} />);
    const text = () => norm(container.querySelector('[data-slot="money-text"]')?.textContent);
    const el = () => container.querySelector('[data-slot="money"]') as HTMLElement;
    expect(text()).toBe("18");
    rerender(<Money value={18} size="xl" strikethrough />);
    expect(el()).toHaveClass("line-through", "text-2xl");
    expect(norm(el().querySelector(".sr-only")?.textContent)).toBe("Старая цена: 18,00 сомони");
  });

  it("follows the locale and other currencies", () => {
    const { container } = renderWithUI(<Money value={1234.5} />, { provider: { locale: "en" } });
    expect(norm(container.querySelector('[data-slot="money-text"]')?.textContent)).toBe(
      "1,234.50 TJS",
    );
    expect(screen.getByText("1,234.50 somoni")).toHaveClass("sr-only");
    expect(currencySymbol("TJS", "ru")).toBe("с");
    expect(currencySymbol("USD", "ru")).toBe("$");
  });

  it("speaks Tajik", () => {
    const { container } = renderWithUI(<Money value={5} />, { provider: { locale: "tg" } });
    expect(norm(container.querySelector(".sr-only")?.textContent)).toMatch(/сомонӣ$/);
  });
});
