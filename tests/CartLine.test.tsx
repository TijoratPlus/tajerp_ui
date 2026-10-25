import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CartLine, CartSummary, cartLineTotal } from "../src/components/CartLine";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("CartLine", () => {
  it("renders price, quantity and total, and changes quantity", async () => {
    const onQuantityChange = vi.fn();
    const onRemove = vi.fn();
    renderWithUI(
      <ul>
        <li>
          <CartLine
            name="Кофе латте"
            price={18}
            quantity={2}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        </li>
      </ul>,
    );
    const qty = screen.getByRole("spinbutton", { name: "Количество: Кофе латте" });
    expect(qty).toHaveDisplayValue("2");
    expect(screen.getByText(/36,00/)).toBeInTheDocument();

    fireEvent.change(qty, { target: { value: "3" } });
    expect(onQuantityChange).toHaveBeenLastCalledWith(3);

    await userEvent.click(screen.getByRole("button", { name: "Удалить Кофе латте" }));
    expect(onRemove).toHaveBeenCalledOnce();
    await expectNoA11yViolations();
  });

  it("does not go below 1 by default", () => {
    const onQuantityChange = vi.fn();
    const onRemove = vi.fn();
    renderWithUI(
      <CartLine name="Вода" price={5} quantity={1} onQuantityChange={onQuantityChange} onRemove={onRemove} />,
    );
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "0" } });
    expect(onQuantityChange).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("removes at 0 when removeAtZero is set (after typing, on blur)", () => {
    const onRemove = vi.fn();
    renderWithUI(<CartLine name="Вода" price={5} quantity={1} removeAtZero onRemove={onRemove} />);
    const input = screen.getByRole("spinbutton");
    input.focus();
    fireEvent.change(input, { target: { value: "0" } });
    expect(onRemove).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("shows a percent discount with the old price struck through", () => {
    const { container } = renderWithUI(
      <CartLine name="Сыр" price={50} quantity={2} discount={{ type: "percent", value: 10 }} />,
    );
    expect(screen.getByText("−10%")).toBeInTheDocument();
    expect(container.querySelector("s")).toHaveTextContent("100,00");
    expect(container.querySelector('[data-slot="cart-line-total"]')).toHaveTextContent("90,00");
  });

  it("readOnly hides the stepper and remove button", () => {
    renderWithUI(<CartLine name="Чай" price={9} quantity={3} readOnly onRemove={() => {}} />);
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText(/3 ×/)).toBeInTheDocument();
  });

  it("computes line totals", () => {
    expect(cartLineTotal(18, 2)).toBe(36);
    expect(cartLineTotal(18, 2, { type: "amount", value: 6 })).toBe(30);
    expect(cartLineTotal(0.1, 3, { type: "percent", value: 0 })).toBe(0.3);
  });
});

describe("CartSummary", () => {
  it("lists subtotal, discount, VAT and total", async () => {
    renderWithUI(
      <CartSummary subtotal={100} discount={10} tax={13.5} taxRate={15} total={103.5} />,
    );
    expect(screen.getByText("Подытог")).toBeInTheDocument();
    expect(screen.getByText("Скидка")).toBeInTheDocument();
    expect(screen.getByText("НДС 15%")).toBeInTheDocument();
    expect(screen.getByText("Итого").nextElementSibling).toHaveTextContent("103,50");
    await expectNoA11yViolations();
  });

  it("localizes to English", () => {
    renderWithUI(<CartSummary subtotal={10} tax={1} taxRate={15} taxIncluded total={10} />, {
      provider: { locale: "en" },
    });
    expect(screen.getByText("incl. VAT 15%")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });
});
