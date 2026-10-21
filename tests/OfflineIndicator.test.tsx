import { act, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OfflineIndicator, SyncStatus } from "../src/components/OfflineIndicator";
import { useOnlineStatus } from "../src/lib/useOnlineStatus";
import { expectNoA11yViolations, renderWithUI } from "./utils";

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", { configurable: true, get: () => value });
  act(() => {
    window.dispatchEvent(new Event(value ? "online" : "offline"));
  });
}

afterEach(() => {
  Object.defineProperty(window.navigator, "onLine", { configurable: true, get: () => true });
});

describe("useOnlineStatus", () => {
  it("follows online/offline events", () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
    setOnline(false);
    expect(result.current).toBe(false);
    setOnline(true);
    expect(result.current).toBe(true);
  });
});

describe("SyncStatus", () => {
  it("shows the full offline message with pending sales (Russian plurals)", async () => {
    const { rerender } = renderWithUI(<SyncStatus status="offline" pending={3} />);
    expect(screen.getByRole("status")).toHaveTextContent("Нет связи · 3 продажи ждут отправки");
    rerender(<SyncStatus status="offline" pending={1} />);
    expect(screen.getByRole("status")).toHaveTextContent("1 продажа ждёт отправки");
    rerender(<SyncStatus status="offline" pending={11} />);
    expect(screen.getByRole("status")).toHaveTextContent("11 продаж ждут отправки");
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    await expectNoA11yViolations();
  });

  it("compact variant keeps the text for screen readers", async () => {
    renderWithUI(<SyncStatus status="syncing" pending={2} variant="compact" />);
    expect(screen.getByRole("status")).toHaveTextContent("Синхронизация… · 2 продажи ждут отправки");
    await expectNoA11yViolations();
  });

  it("offers retry on error", async () => {
    const onRetry = vi.fn();
    renderWithUI(<SyncStatus status="error" onRetry={onRetry} lastSyncedAt={Date.now() - 5 * 60_000} />);
    expect(screen.getByText(/Синхронизировано 5 минут назад/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(onRetry).toHaveBeenCalledOnce();
    await expectNoA11yViolations();
  });

  it("localizes to Tajik", () => {
    renderWithUI(<SyncStatus status="offline" pending={4} />, { provider: { locale: "tg" } });
    expect(screen.getByRole("status")).toHaveTextContent("Алоқа нест · 4 фурӯш дар навбати ирсол");
  });
});

describe("OfflineIndicator", () => {
  it("reflects the browser connection", () => {
    const onOnlineChange = vi.fn();
    renderWithUI(<OfflineIndicator pending={2} syncing onOnlineChange={onOnlineChange} />);
    expect(screen.getByRole("status")).toHaveTextContent("Синхронизация…");
    setOnline(false);
    expect(screen.getByRole("status")).toHaveTextContent("Нет связи · 2 продажи ждут отправки");
    expect(onOnlineChange).toHaveBeenLastCalledWith(false);
    setOnline(true);
    expect(onOnlineChange).toHaveBeenLastCalledWith(true);
  });
});
