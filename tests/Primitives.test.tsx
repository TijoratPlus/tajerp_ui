import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it } from "vitest";

import { Card, Checkbox, Switch, Tooltip, TooltipContent, TooltipTrigger, cn } from "../src";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("Card", () => {
  it("keeps the preset's shadow (no default elevation override)", () => {
    renderWithUI(<Card variant="strong" data-testid="c" />);
    expect(screen.getByTestId("c").className).toContain("shadow-tj-md");
    expect(screen.getByTestId("c").className).not.toContain("shadow-tj-sm");
  });
  it("supports the warm surface and the deprecated tone alias", () => {
    renderWithUI(
      <>
        <Card surface="warm" data-testid="a" />
        <Card tone="mist" data-testid="b" />
      </>,
    );
    expect(screen.getByTestId("a").className).toContain("bg-ui-surface-warm");
    expect(screen.getByTestId("b").className).toContain("bg-mist");
  });
});

describe("Checkbox / Switch", () => {
  it("submit with native forms", async () => {
    let data: FormData | undefined;
    renderWithUI(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          data = new FormData(e.currentTarget);
        }}
      >
        <Checkbox name="vat" aria-label="НДС" />
        <Switch name="sms" aria-label="SMS" defaultChecked />
        <button type="submit">ok</button>
      </form>,
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "НДС" }));
    await userEvent.click(screen.getByText("ok"));
    expect(data?.get("vat")).toBe("on");
    expect(data?.get("sms")).toBe("on");
    await expectNoA11yViolations();
  });
});

describe("Tooltip", () => {
  it("forwards the trigger ref (React 18 compatible)", () => {
    const ref = React.createRef<HTMLButtonElement>();
    renderWithUI(
      <Tooltip>
        <TooltipTrigger ref={ref}>?</TooltipTrigger>
        <TooltipContent>Подсказка</TooltipContent>
      </Tooltip>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

describe("cn", () => {
  it("knows design-system utilities", () => {
    expect(cn("text-ui-body", "text-ink-1")).toBe("text-ui-body text-ink-1");
    expect(cn("shadow-tj-sm", "shadow-tj-md")).toBe("shadow-tj-md");
    expect(cn("h-control-md", "h-8")).toBe("h-8");
  });
});
