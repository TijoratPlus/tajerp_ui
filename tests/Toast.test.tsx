import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { toast, Toaster } from "../src";
import { renderWithUI } from "./utils";

afterEach(() => act(() => toast.dismiss()));

describe("Toast", () => {
  it("puts errors in an assertive region and others in a polite one", () => {
    renderWithUI(<Toaster />);
    act(() => {
      toast.success("Чек отправлен");
      toast.error("Нет связи");
    });
    expect(screen.getByText("Нет связи").closest("[aria-live]")).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByText("Чек отправлен").closest("[aria-live]")).toHaveAttribute("aria-live", "polite");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("runs an action and dismisses", async () => {
    const undo = vi.fn();
    renderWithUI(<Toaster />);
    act(() => {
      toast.info("Товар удалён", { action: { label: "Отменить", onClick: undo } });
    });
    await userEvent.click(screen.getByRole("button", { name: "Отменить" }));
    expect(undo).toHaveBeenCalled();
    expect(screen.queryByText("Товар удалён")).toBeNull();
  });

  it("updates a promise toast in place", async () => {
    renderWithUI(<Toaster />);
    let resolve!: (v: string) => void;
    const p = new Promise<string>((r) => (resolve = r));
    act(() => {
      toast.promise(p, { loading: "Отправка…", success: (v) => `Готово: ${v}`, error: "Ошибка" });
    });
    expect(screen.getByText("Отправка…")).toBeInTheDocument();
    await act(async () => {
      resolve("№42");
      await p;
    });
    expect(screen.getByText("Готово: №42")).toBeInTheDocument();
    expect(screen.queryByText("Отправка…")).toBeNull();
  });

  it("limits visible toasts", () => {
    renderWithUI(<Toaster limit={2} />);
    act(() => {
      toast.info("1");
      toast.info("2");
      toast.info("3");
    });
    expect(screen.queryByText("1")).toBeNull();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
