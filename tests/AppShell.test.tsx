import type * as React from "react";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  AppShell,
  AppShellMenuButton,
  useAppShell,
} from "../src/components/AppShell";
import { Sidebar, type SidebarItem } from "../src/components/Sidebar";
import { Topbar, TopbarTitle } from "../src/components/Topbar";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const items: SidebarItem[] = [
  { id: "pos", label: "Касса", href: "#pos" },
  { id: "stock", label: "Склад", href: "#stock" },
];

function Shell(props: Partial<React.ComponentProps<typeof AppShell>>) {
  return (
    <AppShell
      sidebar={
        <Sidebar items={items} collapsible={false} aria-label="Разделы" />
      }
      topbar={<Topbar start={<TopbarTitle>Касса</TopbarTitle>} />}
      {...props}
    >
      <p>Содержимое</p>
    </AppShell>
  );
}

describe("AppShell", () => {
  it("renders a skip link first and a focusable main region", async () => {
    renderWithUI(<Shell />);
    const skip = screen.getByRole("link", { name: "Перейти к содержимому" });
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");
    await userEvent.tab();
    expect(skip).toHaveFocus();
    await userEvent.click(skip);
    expect(main).toHaveFocus();
    await expectNoA11yViolations();
  });

  it("opens the mobile navigation sheet from the topbar button", async () => {
    const onChange = vi.fn();
    renderWithUI(<Shell onMobileNavOpenChange={onChange} />);
    const btn = screen.getByRole("button", { name: "Открыть меню" });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(btn);
    const dialog = await screen.findByRole("dialog", { name: "Главное меню" });
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(
      within(dialog).getByRole("link", { name: "Склад" }),
    ).toBeInTheDocument();
    await expectNoA11yViolations(dialog);

    // Navigating closes the sheet.
    await userEvent.click(within(dialog).getByRole("link", { name: "Склад" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("closes the sheet with its close button and Escape", async () => {
    renderWithUI(<Shell defaultMobileNavOpen />);
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Закрыть меню" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await userEvent.click(screen.getByRole("button", { name: "Открыть меню" }));
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("supports controlled mobileNavOpen", async () => {
    const onChange = vi.fn();
    const { rerender } = renderWithUI(
      <Shell mobileNavOpen={false} onMobileNavOpenChange={onChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Открыть меню" }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(<Shell mobileNavOpen onMobileNavOpenChange={onChange} />);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("closes the sheet when the viewport reaches the breakpoint", async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
    const onChange = vi.fn();
    renderWithUI(
      <Shell defaultMobileNavOpen onMobileNavOpenChange={onChange} />,
    );
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(false));
    window.matchMedia = original;
  });

  it("exposes controls through useAppShell and hides the menu button without a sidebar", async () => {
    function Opener() {
      const shell = useAppShell();
      return (
        <button type="button" onClick={shell.openMobileNav}>
          {shell.isMobileNavOpen ? "открыто" : "закрыто"}
        </button>
      );
    }
    renderWithUI(
      <Shell topbar={<Topbar menuButton={false} end={<Opener />} />} />,
    );
    expect(screen.queryByRole("button", { name: "Открыть меню" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "закрыто" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    const { container } = renderWithUI(<AppShellMenuButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it("localizes strings", () => {
    renderWithUI(<Shell />, { provider: { locale: "tg" } });
    expect(
      screen.getByRole("link", { name: "Гузаштан ба мундариҷа" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Кушодани меню" }),
    ).toBeInTheDocument();
  });
});
