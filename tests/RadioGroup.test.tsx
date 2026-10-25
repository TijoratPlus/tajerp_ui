import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { RadioGroup, RadioGroupItem } from "../src/components/RadioGroup";
import { expectNoA11yViolations, renderWithUI } from "./utils";

function Payment(props: React.ComponentProps<typeof RadioGroup>) {
  return (
    <RadioGroup aria-label="Способ оплаты" {...props}>
      <RadioGroupItem value="cash" label="Наличные" />
      <RadioGroupItem value="card" label="Карта" description="Терминал Эсхата" />
      <RadioGroupItem value="alif" label="Alif Pay" disabled />
      <RadioGroupItem value="split" label="Раздельная оплата" />
    </RadioGroup>
  );
}

describe("RadioGroup", () => {
  it("is labelled and accessible", async () => {
    renderWithUI(<Payment defaultValue="cash" />);
    expect(screen.getByRole("radiogroup", { name: "Способ оплаты" })).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
    expect(screen.getByRole("radio", { name: "Наличные" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Карта" })).toHaveAccessibleDescription(
      "Терминал Эсхата",
    );
    await expectNoA11yViolations();
  });

  it("selects by clicking the label (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUI(<Payment defaultValue="cash" onValueChange={onValueChange} />);
    await user.click(screen.getByText("Карта"));
    expect(screen.getByRole("radio", { name: "Карта" })).toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith("card");
  });

  it("moves with arrow keys, skipping disabled items", async () => {
    const user = userEvent.setup();
    renderWithUI(<Payment defaultValue="card" />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "Карта" })).toHaveFocus();
    // Hold the key: Radix selects on the focus that follows an arrow keydown.
    await user.keyboard("{ArrowDown>}");
    const split = screen.getByRole("radio", { name: "Раздельная оплата" });
    await waitFor(() => expect(split).toHaveFocus());
    expect(split).toBeChecked();
    await user.keyboard("{/ArrowDown}");
  });

  it("respects the controlled value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUI(<Payment value="cash" onValueChange={onValueChange} orientation="horizontal" />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-orientation", "horizontal");
    await user.click(screen.getByRole("radio", { name: "Карта" }));
    expect(onValueChange).toHaveBeenCalledWith("card");
    expect(screen.getByRole("radio", { name: "Наличные" })).toBeChecked();
  });
});
