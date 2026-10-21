import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../src";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("Button", () => {
  it("fires onClick and is accessible", async () => {
    const onClick = vi.fn();
    renderWithUI(<Button onClick={onClick}>Оплатить</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Оплатить" }));
    expect(onClick).toHaveBeenCalledOnce();
    await expectNoA11yViolations();
  });

  it("is disabled and busy while loading", () => {
    renderWithUI(<Button loading>Сохранить</Button>);
    const btn = screen.getByRole("button", { name: /Сохранить/ });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("renders the child element with asChild", () => {
    renderWithUI(
      <Button asChild>
        <a href="/pos">Касса</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Касса" })).toHaveAttribute("href", "/pos");
  });
});
