import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChatBubble } from "../src/components/ChatBubble";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("ChatBubble", () => {
  it("is an article labelled with author and time", async () => {
    renderWithUI(
      <ChatBubble role="user" author="Фарход" time="14:05" channel="telegram" status="read">
        Сколько я заработал сегодня?
      </ChatBubble>,
    );
    const article = screen.getByRole("article", { name: "Фарход, 14:05" });
    expect(article).toHaveAttribute("data-role", "user");
    expect(screen.getByText("Telegram")).toBeInTheDocument();
    expect(screen.getByText("Прочитано")).toHaveClass("sr-only");
    await expectNoA11yViolations();
  });

  it("formats Date times and defaults the author by role", () => {
    renderWithUI(
      <ChatBubble role="assistant" time={new Date(2026, 9, 21, 9, 7)}>
        Салом!
      </ChatBubble>,
    );
    expect(screen.getByRole("article", { name: "TijoratAI, 09:07" })).toBeInTheDocument();
  });

  it("shows an error with a retry button", async () => {
    const onRetry = vi.fn();
    renderWithUI(
      <ChatBubble role="user" status="error" onRetry={onRetry} channel="sms">
        Напоминание о долге
      </ChatBubble>,
    );
    expect(screen.getByText("Не отправлено")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(onRetry).toHaveBeenCalledOnce();
    await expectNoA11yViolations();
  });

  it("renders system notices centred and Tajik channel labels", () => {
    renderWithUI(
      <>
        <ChatBubble role="system">Сессия оғоз шуд</ChatBubble>
        <ChatBubble role="assistant" channel="app">
          Салом
        </ChatBubble>
      </>,
      { provider: { locale: "tg" } },
    );
    expect(screen.getByRole("article", { name: "Низом" })).toHaveAttribute("data-role", "system");
    expect(screen.getByText("Барнома")).toBeInTheDocument();
  });
});
