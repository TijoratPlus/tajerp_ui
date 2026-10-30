import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Sidebar, type SidebarItem } from "../src";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const ITEMS: SidebarItem[] = [
  { id: "pos", label: "Касса", href: "/pos" },
  {
    id: "stock",
    label: "Склад",
    children: [
      { id: "stock.items", label: "Товары", href: "/stock/items" },
      { id: "stock.receipt", label: "Приход", href: "/stock/receipt" },
    ],
  },
];

describe("Sidebar", () => {
  it("opens the active item's group when activeId changes", () => {
    const { rerender } = renderWithUI(<Sidebar items={ITEMS} activeId="pos" />);
    expect(screen.queryByText("Приход")).toBeNull();
    rerender(<Sidebar items={ITEMS} activeId="stock.receipt" />);
    expect(screen.getByRole("link", { name: "Приход" })).toHaveAttribute("aria-current", "page");
  });

  it("is a labelled landmark and renders router links", async () => {
    renderWithUI(
      <Sidebar
        items={ITEMS}
        renderLink={({ href, children, ...p }) => (
          <a data-router="1" href={`#${href}`} {...p}>
            {children}
          </a>
        )}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Основная навигация" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Касса" })).toHaveAttribute("data-router", "1");
    await expectNoA11yViolations();
  });

  it("collapses with a localized toggle", async () => {
    renderWithUI(<Sidebar items={ITEMS} />, { provider: { locale: "tg" } });
    await userEvent.click(screen.getByRole("button", { name: "Печондани меню" }));
    expect(screen.getByRole("button", { name: "Кушодани меню" })).toBeInTheDocument();
  });

  it("defaults to the dark rail and switches to the light tone", () => {
    const { rerender } = renderWithUI(<Sidebar items={ITEMS} activeId="pos" />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("data-rail", "dark");
    const active = screen.getByRole("link", { name: "Касса" });
    expect(active).toHaveClass("bg-rail-active", "text-rail-active-ink", "shadow-tj-sm");
    rerender(<Sidebar items={ITEMS} activeId="pos" tone="light" />);
    expect(nav).toHaveAttribute("data-rail", "light");
    expect(screen.getByRole("link", { name: "Касса" })).not.toHaveClass("shadow-tj-sm");
  });
});
