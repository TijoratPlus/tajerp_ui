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

describe("ChatBubble channels, statuses and media", () => {
  it("labels the Instagram and Messenger channels with their own icons", () => {
    renderWithUI(
      <>
        <ChatBubble role="assistant" author="Мадина" channel="instagram">
          Салом! Ин курта ҳаст?
        </ChatBubble>
        <ChatBubble role="assistant" author="Бахтиёр" channel="messenger">
          Есть доставка в Худжанд?
        </ChatBubble>
      </>,
    );
    const instagram = document.querySelector('[data-channel="instagram"]')!;
    const messenger = document.querySelector('[data-channel="messenger"]')!;
    expect(instagram).toHaveTextContent("Канал: Instagram");
    expect(messenger).toHaveTextContent("Канал: Messenger");
    expect(instagram.querySelector("svg")).not.toBeNull();
    expect(messenger.querySelector("svg")).not.toBeNull();
  });

  it("shows ticks for sent, delivered and read, and nothing visible for received", () => {
    renderWithUI(
      <>
        <ChatBubble role="user" status="sent">1</ChatBubble>
        <ChatBubble role="user" status="delivered">2</ChatBubble>
        <ChatBubble role="user" status="read">3</ChatBubble>
        <ChatBubble role="assistant" status="received">4</ChatBubble>
      </>,
    );
    const status = (s: string) => document.querySelector(`[data-slot="chat-bubble-status"][data-status="${s}"]`)!;
    expect(status("sent").querySelectorAll("svg")).toHaveLength(1);
    expect(status("delivered")).toHaveTextContent("Доставлено");
    expect(status("delivered").querySelector("svg")).not.toBeNull();
    expect(status("read").querySelector("svg")).toHaveClass("text-brand-ink");
    expect(status("received").querySelector("svg")).toBeNull();
    expect(screen.getByText("Получено")).toHaveClass("sr-only");
  });

  it("renders image, file, video and audio media", async () => {
    const onOpen = vi.fn();
    renderWithUI(
      <>
        <ChatBubble role="assistant" media={{ kind: "image", src: "/kurta.jpg", name: "kurta.jpg", onOpen }}>
          Вот этот цвет
        </ChatBubble>
        <ChatBubble role="user" media={{ kind: "file", src: "/invoice.pdf", name: "Счёт №42.pdf" }} />
        <ChatBubble role="assistant" media={{ kind: "video", src: "/clip.mp4" }} />
        <ChatBubble role="assistant" media={{ kind: "audio", src: "/voice.ogg" }} />
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Открыть изображение: kurta.jpg" }));
    expect(onOpen).toHaveBeenCalledOnce();
    expect(screen.getByRole("img", { name: "kurta.jpg" })).toHaveAttribute("src", "/kurta.jpg");
    expect(screen.getByRole("link", { name: "Счёт №42.pdf" })).toHaveAttribute("href", "/invoice.pdf");
    expect(document.querySelector('[data-kind="video"] video')).toHaveAttribute("src", "/clip.mp4");
    expect(document.querySelector('[data-kind="audio"] audio')).toHaveAttribute("src", "/voice.ogg");
    await expectNoA11yViolations();
  });

  it("shows the meta line only at the end of a group and keeps it for errors", () => {
    renderWithUI(
      <>
        <ChatBubble role="user" grouped="first" time="10:00" status="sent">а</ChatBubble>
        <ChatBubble role="user" grouped="middle" time="10:01" status="error">б</ChatBubble>
        <ChatBubble role="user" grouped="last" time="10:02" status="read">в</ChatBubble>
      </>,
    );
    const [first, middle, last] = screen.getAllByRole("article");
    expect(first.querySelector('[data-slot="chat-bubble-meta"]')).toBeNull();
    // Hidden meta still reaches screen readers.
    expect(first).toHaveTextContent("10:00 Отправлено");
    expect(middle.querySelector('[data-slot="chat-bubble-meta"]')).not.toBeNull();
    expect(last.querySelector('[data-slot="chat-bubble-meta"]')).not.toBeNull();
    const content = (el: Element) => el.querySelector('[data-slot="chat-bubble-content"]')!;
    expect(content(first)).toHaveClass("!rounded-br-md");
    expect(content(last)).toHaveClass("!rounded-tr-md", "!rounded-br-sm");
  });

  it("uses a neutral outgoing fill and a 640px max width by default", () => {
    renderWithUI(
      <ChatBubble role="user" tone="neutral">
        Хорошо
      </ChatBubble>,
    );
    const article = screen.getByRole("article");
    expect(article.querySelector('[data-slot="chat-bubble-content"]')).toHaveClass("bg-mist");
    expect(article.querySelector('[data-slot="chat-bubble-body"]')).toHaveStyle({
      maxWidth: "min(75%, 640px)",
    });
  });
});
