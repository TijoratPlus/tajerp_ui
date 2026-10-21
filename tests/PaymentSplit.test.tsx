import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  PaymentSplit,
  computePaymentTotals,
  type PaymentEntry,
} from "../src/components/PaymentSplit";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const summary = (container: HTMLElement) =>
  container.querySelector('[data-slot="payment-split-summary"]') as HTMLElement;

describe("computePaymentTotals", () => {
  it("computes remaining and change", () => {
    expect(computePaymentTotals(100, [{ method: "card", amount: 40 }])).toMatchObject({
      paid: 40,
      remaining: 60,
      change: 0,
      complete: false,
    });
    expect(
      computePaymentTotals(100, [
        { method: "card", amount: 40 },
        { method: "cash", amount: 70 },
      ]),
    ).toMatchObject({ paid: 110, remaining: 0, change: 10, complete: true });
  });

  it("does not let non-cash methods exceed the total", () => {
    const r = computePaymentTotals(100, [{ method: "card", amount: 120 }]);
    expect(r.nonCashOverpaid).toBe(true);
    expect(r.change).toBe(0);
    expect(r.complete).toBe(false);
  });

  it("avoids floating-point noise", () => {
    const r = computePaymentTotals(0.3, [
      { method: "cash", amount: 0.1 },
      { method: "card", amount: 0.2 },
    ]);
    expect(r.remaining).toBe(0);
    expect(r.complete).toBe(true);
  });
});

describe("PaymentSplit", () => {
  it("adds a method pre-filled with the remaining amount and calculates change", async () => {
    const onComplete = vi.fn();
    const { container } = renderWithUI(
      <PaymentSplit total={95.5} onComplete={onComplete} />,
    );
    const complete = screen.getByRole("button", { name: "Завершить оплату" });
    expect(complete).toBeDisabled();

    const add = screen.getByRole("group", { name: "Добавить способ оплаты" });
    await userEvent.click(within(add).getByRole("button", { name: "Наличные" }));

    const cash = screen.getByLabelText("Наличные");
    expect(cash).toHaveValue("95,5");
    expect(complete).toBeEnabled();

    // The customer hands over 100 с → 4,50 с change.
    await userEvent.clear(cash);
    await userEvent.type(cash, "100");
    const change = container.querySelector('[data-slot="payment-split-change"]');
    expect(change).toHaveTextContent(/Сдача\s*4,50/);
    expect(screen.getByRole("status")).toHaveTextContent(/Сдача 4,50/);

    await userEvent.click(complete);
    expect(onComplete).toHaveBeenCalledWith({
      payments: [{ method: "cash", amount: 100 }],
      paid: 100,
      change: 4.5,
    });
    await expectNoA11yViolations();
  });

  it("quick-fills a method with the remaining amount", async () => {
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = React.useState<PaymentEntry[]>([
        { method: "card", amount: 50 },
        { method: "cash", amount: 0 },
      ]);
      return (
        <PaymentSplit
          total={120}
          value={value}
          onValueChange={(v) => {
            onValueChange(v);
            setValue(v);
          }}
          onComplete={() => {}}
        />
      );
    }
    const { container } = renderWithUI(<Controlled />);
    expect(summary(container)).toHaveTextContent(/Осталось\s*70,00/);
    expect(screen.getByRole("button", { name: "Завершить оплату" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Остаток — Наличные" }));
    expect(onValueChange).toHaveBeenLastCalledWith([
      { method: "card", amount: 50 },
      { method: "cash", amount: 70 },
    ]);
    expect(screen.getByLabelText("Наличные")).toHaveValue("70");
    expect(summary(container)).toHaveTextContent(/Осталось\s*0,00/);
    expect(screen.getByRole("button", { name: "Завершить оплату" })).toBeEnabled();
    // Nothing left to fill → quick-fill buttons are gone.
    expect(screen.queryByRole("button", { name: /^Остаток/ })).toBeNull();
  });

  it("accepts a dot or comma decimal and blocks non-cash overpayment", async () => {
    renderWithUI(
      <PaymentSplit
        total={10}
        defaultValue={[{ method: "alif", amount: 0 }]}
        onComplete={() => {}}
      />,
    );
    const alif = screen.getByLabelText("Alif Pay");
    await userEvent.type(alif, "12.5");
    expect(alif).toHaveAttribute("aria-invalid", "true");
    expect(alif).toHaveAccessibleDescription("Безналичная оплата не может превышать сумму чека");
    expect(screen.getByRole("button", { name: "Завершить оплату" })).toBeDisabled();

    await userEvent.clear(alif);
    await userEvent.type(alif, "10,0");
    expect(alif).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("button", { name: "Завершить оплату" })).toBeEnabled();
  });

  it("removes a payment and supports custom methods", async () => {
    renderWithUI(
      <PaymentSplit
        total={50}
        methods={[
          { id: "cash", label: "Наличные" },
          { id: "credit", label: "В долг" },
        ]}
        defaultValue={[{ method: "credit", amount: 50 }]}
      />,
    );
    expect(screen.getByLabelText("В долг")).toHaveValue("50");
    await userEvent.click(screen.getByRole("button", { name: "Удалить В долг" }));
    expect(screen.queryByLabelText("В долг")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Выберите способ оплаты");
    expect(screen.getByRole("button", { name: "В долг" })).toBeInTheDocument();
  });
});
