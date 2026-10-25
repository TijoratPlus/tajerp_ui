import { screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";

import { GridLayout, type GridItem } from "../src/charts";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const LAYOUT: GridItem[] = [
  { i: "revenue", x: 0, y: 0, w: 10, h: 6 },
  { i: "deals", x: 10, y: 0, w: 10, h: 6, minW: 4 },
];

describe("GridLayout", () => {
  it("renders every item through renderItem", async () => {
    renderWithUI(
      <GridLayout
        layout={LAYOUT}
        renderItem={(item) => (
          <section aria-label={item.i === "revenue" ? "Выручка" : "Сделки"}>{item.i}</section>
        )}
      />,
    );
    expect(await screen.findByRole("region", { name: "Выручка" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Сделки" })).toBeInTheDocument();
    const items = document.querySelectorAll("[data-slot=grid-layout-item]");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveClass("react-grid-item");
    await expectNoA11yViolations();
  });

  it("marks editable mode and shows resize handles", async () => {
    renderWithUI(<GridLayout editable layout={LAYOUT} renderItem={(item) => <div>{item.i}</div>} />);
    await screen.findByText("revenue");
    expect(document.querySelector("[data-slot=grid-layout]")).toHaveAttribute("data-editable");
    expect(document.querySelectorAll(".react-resizable-handle").length).toBeGreaterThan(0);
  });
});
