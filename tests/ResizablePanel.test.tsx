import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ResizablePanel } from "../src";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("ResizablePanel", () => {
  afterEach(() => window.localStorage.clear());

  it("resizes with the keyboard within min/max and persists the width", async () => {
    const onWidthChange = vi.fn();
    renderWithUI(
      <ResizablePanel
        defaultWidth={300}
        minWidth={200}
        maxWidth={400}
        storageKey="crm.sidebar"
        onWidthChange={onWidthChange}
      >
        Боковая панель
      </ResizablePanel>,
    );
    const handle = screen.getByRole("separator", { name: "Изменить ширину панели" });
    expect(handle).toHaveAttribute("aria-valuenow", "300");
    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onWidthChange).toHaveBeenLastCalledWith(316);
    expect(window.localStorage.getItem("crm.sidebar")).toBe("316");
    await userEvent.keyboard("{End}");
    expect(handle).toHaveAttribute("aria-valuenow", "400");
    await userEvent.keyboard("{Home}");
    expect(handle).toHaveAttribute("aria-valuenow", "200");
    expect(handle.parentElement).toHaveStyle({ width: "200px" });
    await expectNoA11yViolations();
  });

  it("reads the stored width and survives blocked storage", () => {
    window.localStorage.setItem("crm.sidebar", "350");
    const { unmount } = renderWithUI(
      <ResizablePanel defaultWidth={300} storageKey="crm.sidebar">
        x
      </ResizablePanel>,
    );
    expect(screen.getByRole("separator")).toHaveAttribute("aria-valuenow", "350");
    unmount();
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    renderWithUI(
      <ResizablePanel defaultWidth={280} storageKey="crm.sidebar">
        x
      </ResizablePanel>,
    );
    expect(screen.getByRole("separator")).toHaveAttribute("aria-valuenow", "280");
    spy.mockRestore();
  });

  it("drags the edge with the pointer (left side handle grows to the left)", () => {
    renderWithUI(
      <ResizablePanel side="left" defaultWidth={300}>
        Подробности сделки
      </ResizablePanel>,
    );
    const handle = screen.getByRole("separator");
    fireEvent.pointerDown(handle, { button: 0, clientX: 500, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 450, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientX: 450, pointerId: 1 });
    expect(handle).toHaveAttribute("aria-valuenow", "350");
  });

  it("labels the handle in Tajik", () => {
    renderWithUI(<ResizablePanel defaultWidth={300}>x</ResizablePanel>, { provider: { locale: "tg" } });
    expect(screen.getByRole("separator", { name: "Тағйир додани паҳнои панел" })).toBeInTheDocument();
  });
});
