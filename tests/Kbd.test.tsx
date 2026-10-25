import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Kbd, KbdGroup } from "../src/components/Kbd";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("Kbd", () => {
  it("renders keys and a combination with separators", async () => {
    renderWithUI(
      <p>
        Оплата: <Kbd>F2</Kbd>, поиск:{" "}
        <KbdGroup separator="+">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </p>,
    );
    expect(screen.getByText("F2").tagName).toBe("KBD");
    const group = screen.getByText("Ctrl").parentElement!;
    expect(group).toHaveAttribute("data-slot", "kbd-group");
    expect(group).toHaveTextContent("Ctrl+K");
    await expectNoA11yViolations();
  });
});
