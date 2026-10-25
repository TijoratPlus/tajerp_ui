import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Alert, Banner } from "../src/components/Alert";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("Alert", () => {
  it("renders title, description and action without a live role by default", async () => {
    renderWithUI(
      <Alert
        tone="warning"
        title="Мало товара"
        description="Сахар 1 кг: осталось 3 шт."
        action={<button type="button">Заказать</button>}
      />,
    );
    expect(screen.getByText("Мало товара")).toBeInTheDocument();
    expect(screen.getByText("Сахар 1 кг: осталось 3 шт.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    // Tone is not conveyed by colour alone.
    expect(screen.getByText(/Внимание/)).toHaveClass("sr-only");
    await expectNoA11yViolations();
  });

  it("uses role=alert for danger/warning and role=status otherwise when live", () => {
    const { rerender } = renderWithUI(
      <Alert live tone="danger" title="Ошибка синхронизации" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Ошибка синхронизации");
    rerender(<Alert live tone="error" title="Alias" />);
    expect(screen.getByRole("alert")).toHaveAttribute("data-tone", "danger");
    rerender(<Alert live tone="success" title="Импорт завершён" />);
    expect(screen.getByRole("status")).toHaveTextContent("Импорт завершён");
  });

  it("calls onDismiss from a localized close button", async () => {
    const onDismiss = vi.fn();
    renderWithUI(<Alert title="Огоҳӣ" onDismiss={onDismiss} />, {
      provider: { locale: "tg" },
    });
    const btn = screen.getByRole("button", { name: "Пӯшидани огоҳинома" });
    btn.focus();
    await userEvent.keyboard("{Enter}");
    expect(onDismiss).toHaveBeenCalledOnce();
    await expectNoA11yViolations();
  });
});

describe("Banner", () => {
  it("renders a sticky strip with message and dismiss", async () => {
    const onDismiss = vi.fn();
    renderWithUI(
      <Banner tone="warning" sticky live onDismiss={onDismiss}>
        Нет соединения — продажи сохраняются на устройстве
      </Banner>,
    );
    const banner = screen.getByRole("alert");
    expect(banner).toHaveClass("sticky");
    expect(banner).toHaveTextContent("Нет соединения");
    await userEvent.click(
      screen.getByRole("button", { name: "Закрыть уведомление" }),
    );
    expect(onDismiss).toHaveBeenCalledOnce();
    await expectNoA11yViolations();
  });
});
