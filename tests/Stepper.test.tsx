import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Stepper, type StepperStep } from "../src/components/Stepper";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const steps: StepperStep[] = [
  { id: "cart", label: "Корзина" },
  { id: "pay", label: "Оплата" },
  { id: "receipt", label: "Чек" },
];

describe("Stepper", () => {
  it("derives statuses, marks the current step and announces progress", async () => {
    renderWithUI(<Stepper steps={steps} activeStep={1} />);
    const nav = screen.getByRole("navigation", { name: "Этапы" });
    expect(within(nav).getByText("Шаг 2 из 3: Оплата")).toBeInTheDocument();
    const items = within(nav).getAllByRole("listitem");
    expect(items.map((li) => li.getAttribute("data-status"))).toEqual([
      "complete",
      "current",
      "upcoming",
    ]);
    expect(nav.querySelector('[aria-current="step"]')).toHaveTextContent(
      "Оплата",
    );
    // Not clickable without onStepClick.
    expect(within(nav).queryByRole("button")).toBeNull();
    await expectNoA11yViolations();
  });

  it("renders completed steps as buttons when onStepClick is set", async () => {
    const onStepClick = vi.fn();
    renderWithUI(
      <Stepper steps={steps} activeStep={2} onStepClick={onStepClick} />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    await userEvent.tab();
    expect(buttons[0]).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onStepClick).toHaveBeenCalledWith(0, steps[0]);
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(onStepClick).toHaveBeenLastCalledWith(1, steps[1]);
    await expectNoA11yViolations();
  });

  it("supports an explicit error status, vertical orientation and Tajik", async () => {
    renderWithUI(
      <Stepper
        orientation="vertical"
        activeStep={1}
        steps={[
          { id: "a", label: "Сабад" },
          {
            id: "b",
            label: "Пардохт",
            status: "error",
            description: "Корт рад шуд",
          },
          { id: "c", label: "Чек", optional: true },
        ]}
      />,
      { provider: { locale: "tg" } },
    );
    const nav = screen.getByRole("navigation", { name: "Марҳилаҳо" });
    expect(nav).toHaveAttribute("data-orientation", "vertical");
    expect(within(nav).getByText("Қадами 2 аз 3: Пардохт")).toBeInTheDocument();
    expect(within(nav).getAllByRole("listitem")[1]).toHaveAttribute(
      "data-status",
      "error",
    );
    expect(nav.querySelector('[aria-current="step"]')).toHaveTextContent(
      /Пардохт.*хато/,
    );
    expect(within(nav).getByText("Ихтиёрӣ")).toBeInTheDocument();
    await expectNoA11yViolations();
  });
});
