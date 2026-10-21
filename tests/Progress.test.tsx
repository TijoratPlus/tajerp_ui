import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Progress } from "../src/components/Progress";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("Progress", () => {
  it("exposes value, label and formatted percentage", async () => {
    renderWithUI(<Progress value={45} label="Инвентаризация склада" showValue />);
    const bar = screen.getByRole("progressbar", { name: "Инвентаризация склада" });
    expect(bar).toHaveAttribute("aria-valuenow", "45");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuetext", "45 %");
    expect(screen.getByText("45 %")).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("supports a custom max and clamps the value", () => {
    renderWithUI(<Progress value={300} max={240} aria-label="Чеки" tone="success" size="sm" />);
    const bar = screen.getByRole("progressbar", { name: "Чеки" });
    expect(bar).toHaveAttribute("aria-valuenow", "240");
    expect(bar).toHaveAttribute("data-tone", "success");
    expect(bar.className).toContain("h-1.5");
  });

  it("formats the percentage per locale", () => {
    renderWithUI(<Progress value={2} max={3} label="Plan" showValue />, {
      provider: { locale: "en" },
    });
    expect(screen.getByText("67%")).toBeInTheDocument();
  });

  it("indeterminate: no value, falls back to a loading name", async () => {
    renderWithUI(<Progress indeterminate value={10} />);
    const bar = screen.getByRole("progressbar", { name: "Загрузка…" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("data-state", "indeterminate");
    await expectNoA11yViolations();
  });
});
