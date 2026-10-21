import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ExportMenu } from "../src/components/ExportMenu";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("ExportMenu", () => {
  it("opens a labelled menu and exports synchronously", async () => {
    const onExport = vi.fn();
    renderWithUI(<ExportMenu onExport={onExport} />);
    const trigger = screen.getByRole("button", { name: "Экспорт" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await userEvent.click(trigger);
    const menu = await screen.findByRole("menu", { name: "Экспорт" });
    expect(screen.getAllByRole("menuitem")).toHaveLength(4);
    await waitFor(() =>
      expect(screen.getAllByRole("menuitem")[0]).toHaveFocus(),
    );
    await expectNoA11yViolations();
    await userEvent.click(screen.getByRole("menuitem", { name: /Excel/ }));
    expect(onExport).toHaveBeenCalledWith("excel");
    await waitFor(() => expect(menu).not.toBeInTheDocument());
  });

  it("moves with arrows, wraps, and Escape returns focus", async () => {
    const onExport = vi.fn();
    renderWithUI(
      <ExportMenu onExport={onExport} formats={["pdf", "csv", "email"]} />,
    );
    const trigger = screen.getByRole("button", { name: "Экспорт" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await screen.findByRole("menu");
    const items = screen.getAllByRole("menuitem");
    await waitFor(() => expect(items[0]).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    expect(items[1]).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(items[2]).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(items[0]).toHaveFocus();
    await userEvent.keyboard("c");
    expect(items[1]).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onExport).toHaveBeenCalledWith("csv");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());

    await userEvent.click(trigger);
    await screen.findByRole("menu");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it("ArrowUp on the trigger focuses the last item", async () => {
    renderWithUI(<ExportMenu onExport={() => {}} />);
    screen.getByRole("button", { name: "Экспорт" }).focus();
    await userEvent.keyboard("{ArrowUp}");
    await screen.findByRole("menu");
    await waitFor(() =>
      expect(
        screen.getByRole("menuitem", { name: /Отправить на почту/ }),
      ).toHaveFocus(),
    );
  });

  it("shows a spinner on the item while the Promise is pending", async () => {
    let resolve!: () => void;
    const onExport = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    renderWithUI(<ExportMenu onExport={onExport} />);
    await userEvent.click(screen.getByRole("button", { name: "Экспорт" }));
    const pdf = await screen.findByRole("menuitem", { name: /PDF/ });
    await userEvent.click(pdf);
    expect(pdf).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("menuitem", { name: /CSV/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("status")).toHaveTextContent("Готовим файл…");
    // A second choice is ignored while busy.
    await userEvent.click(screen.getByRole("menuitem", { name: /CSV/ }));
    expect(onExport).toHaveBeenCalledTimes(1);
    resolve();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("reports rejected exports and keeps the menu open", async () => {
    const onExportError = vi.fn();
    renderWithUI(
      <ExportMenu
        onExport={() => Promise.reject(new Error("offline"))}
        onExportError={onExportError}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Экспорт" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: /CSV/ }));
    await waitFor(() =>
      expect(onExportError).toHaveBeenCalledWith(expect.any(Error), "csv"),
    );
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /CSV/ })).not.toHaveAttribute(
      "aria-busy",
    );
  });

  it("localizes", async () => {
    renderWithUI(<ExportMenu onExport={() => {}} defaultOpen />, {
      provider: { locale: "tg" },
    });
    expect(
      await screen.findByRole("menuitem", {
        name: /Ба почтаи электронӣ фиристодан/,
      }),
    ).toBeInTheDocument();
  });
});
