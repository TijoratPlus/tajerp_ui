import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProductTile } from "../src/components/ProductTile";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("ProductTile", () => {
  it("is one button named with name, price and stock, and calls onAdd", async () => {
    const onAdd = vi.fn();
    renderWithUI(
      <ProductTile name="Кофе латте" price={18} stock={24} inCart={2} onAdd={onAdd} />,
    );
    const btn = screen.getByRole("button", {
      name: /Кофе латте.*18,00\s?с.*В наличии: 24 шт.*В корзине: 2/,
    });
    await userEvent.click(btn);
    expect(onAdd).toHaveBeenCalledOnce();
    // Keyboard path
    btn.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onAdd).toHaveBeenCalledTimes(3);
    await expectNoA11yViolations();
  });

  it("shows a lettered placeholder without an image", () => {
    const { container } = renderWithUI(<ProductTile name="сыр сулугуни" price={42} />);
    expect(
      container.querySelector('[data-slot="product-tile-placeholder"]'),
    ).toHaveTextContent("СС");
    expect(container.querySelector("img")).toBeNull();
  });

  it("flags low stock with a badge", () => {
    renderWithUI(<ProductTile name="Самбуса" price={7} stock={3} lowStockThreshold={5} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAccessibleName(/Мало.*3 шт/);
    expect(btn).toBeEnabled();
    expect(btn).toHaveAttribute("data-stock", "low");
  });

  it("disables out-of-stock products", async () => {
    const onAdd = vi.fn();
    renderWithUI(<ProductTile name="Багет" price={11} stock={0} onAdd={onAdd} unit="шт" />);
    const btn = screen.getByRole("button", { name: /Нет в наличии/ });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onAdd).not.toHaveBeenCalled();
    await expectNoA11yViolations();
  });

  it("localizes labels to Tajik", () => {
    renderWithUI(<ProductTile name="Нон" price={3} stock={0} />, {
      provider: { locale: "tg" },
    });
    expect(screen.getByRole("button")).toHaveAccessibleName(/Дар анбор нест/);
  });
});
