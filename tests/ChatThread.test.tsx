import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ChatBubble, ChatThread, layoutChatThread } from "../src";
import { expectNoA11yViolations, renderWithUI } from "./utils";

interface Msg {
  id: string;
  from: string;
  at: Date;
  text: string;
}

const minutes = (base: Date, m: number) =>
  new Date(base.getTime() + m * 60_000);

const now = new Date();
const today9 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0);
const yesterday9 = new Date(today9);
yesterday9.setDate(today9.getDate() - 1);

const MESSAGES: Msg[] = [
  { id: "1", from: "client", at: yesterday9, text: "Салом" },
  { id: "2", from: "client", at: today9, text: "Курта ҳаст?" },
  { id: "3", from: "client", at: minutes(today9, 2), text: "Размер M" },
  { id: "4", from: "client", at: minutes(today9, 4), text: "Синий" },
  { id: "5", from: "me", at: minutes(today9, 5), text: "Есть" },
  { id: "6", from: "me", at: minutes(today9, 30), text: "Отправить?" },
];

const key = (m: Msg) => m.id;
const time = (m: Msg) => m.at;
const author = (m: Msg) => m.from;

describe("layoutChatThread", () => {
  it("groups by author within 5 minutes and marks each new day", () => {
    const rows = layoutChatThread(MESSAGES, key, time, author);
    expect(rows.map((r) => r.grouped)).toEqual([
      "single",
      "first",
      "middle",
      "last",
      "single",
      "single",
    ]);
    expect(rows.map((r) => !!r.day)).toEqual([
      true,
      true,
      false,
      false,
      false,
      false,
    ]);
  });

  it("reads Frappe datetimes (space-separated)", () => {
    const rows = layoutChatThread(
      [
        { id: "a", from: "x", at: "2026-10-29 23:58:00" },
        { id: "b", from: "x", at: "2026-10-30 00:01:00" },
      ],
      (m) => m.id,
      (m) => m.at,
      (m) => m.from,
    );
    // Different days never group, even 3 minutes apart.
    expect(rows.map((r) => r.grouped)).toEqual(["single", "single"]);
    expect(rows[1].day?.getDate()).toBe(30);
  });
});

/** jsdom has no layout: give the viewport scroll metrics we control. */
const metrics = { scrollHeight: 1000, clientHeight: 400 };
const scrollTops = new WeakMap<Element, number>();
const isViewport = (el: Element) =>
  el.getAttribute("data-slot") === "chat-thread-viewport";

beforeEach(() => {
  metrics.scrollHeight = 1000;
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get(this: HTMLElement) {
      return isViewport(this) ? metrics.scrollHeight : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get(this: HTMLElement) {
      return isViewport(this) ? metrics.clientHeight : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollTop", {
    configurable: true,
    get(this: HTMLElement) {
      return scrollTops.get(this) ?? 0;
    },
    set(this: HTMLElement, v: number) {
      const max = Math.max(
        0,
        isViewport(this) ? metrics.scrollHeight - metrics.clientHeight : 0,
      );
      scrollTops.set(this, Math.min(Math.max(0, v), max));
    },
  });
});

afterEach(() => {
  // Restore jsdom's own (zero) implementations.
  delete (HTMLElement.prototype as unknown as Record<string, unknown>)
    .scrollHeight;
  delete (HTMLElement.prototype as unknown as Record<string, unknown>)
    .clientHeight;
  delete (HTMLElement.prototype as unknown as Record<string, unknown>)
    .scrollTop;
});

function Thread({
  items,
  ...rest
}: {
  items: Msg[];
  hasOlder?: boolean;
  onLoadOlder?: () => void;
}) {
  return (
    <div style={{ height: 400, display: "flex", flexDirection: "column" }}>
      <ChatThread
        items={items}
        getKey={key}
        getTime={time}
        getAuthorKey={author}
        empty={<p>Сообщений пока нет</p>}
        renderItem={(m, grouped) => (
          <ChatBubble
            role={m.from === "me" ? "user" : "assistant"}
            grouped={grouped}
            author={m.from}
          >
            {m.text}
          </ChatBubble>
        )}
        {...rest}
      />
    </div>
  );
}

const viewport = () => screen.getByRole("log");

describe("ChatThread", () => {
  it("renders day separators and passes the group position to renderItem", async () => {
    renderWithUI(<Thread items={MESSAGES} />);
    expect(screen.getByText("Вчера")).toBeInTheDocument();
    expect(screen.getByText("Сегодня")).toBeInTheDocument();
    const grouped = screen
      .getAllByRole("article")
      .map((a) => a.getAttribute("data-grouped"));
    expect(grouped).toEqual([
      "single",
      "first",
      "middle",
      "last",
      "single",
      "single",
    ]);
    await expectNoA11yViolations();
  });

  it("shows the empty state", () => {
    renderWithUI(<Thread items={[]} />);
    expect(screen.getByText("Сообщений пока нет")).toBeInTheDocument();
  });

  it("starts at the bottom and follows new messages while at the bottom", () => {
    const { rerender } = renderWithUI(<Thread items={MESSAGES.slice(0, 4)} />);
    expect(viewport().scrollTop).toBe(600);
    metrics.scrollHeight = 1100;
    rerender(<Thread items={MESSAGES.slice(0, 5)} />);
    expect(viewport().scrollTop).toBe(700);
    expect(screen.queryByText("Новые сообщения")).toBeNull();
  });

  it("stays put when scrolled up and offers a new-messages pill", async () => {
    const { rerender } = renderWithUI(<Thread items={MESSAGES.slice(0, 4)} />);
    act(() => {
      viewport().scrollTop = 100;
      viewport().dispatchEvent(new Event("scroll"));
    });
    metrics.scrollHeight = 1200;
    rerender(<Thread items={MESSAGES} />);
    expect(viewport().scrollTop).toBe(100);
    const pill = screen.getByRole("button", { name: /Новые сообщения/ });
    expect(pill).toHaveTextContent("2");
    await userEvent.click(pill);
    expect(viewport().scrollTop).toBe(800);
    expect(
      screen.queryByRole("button", { name: /Новые сообщения/ }),
    ).toBeNull();
  });

  it("keeps the reading position when older messages are prepended", () => {
    const { rerender } = renderWithUI(
      <Thread items={MESSAGES.slice(3)} hasOlder />,
    );
    act(() => {
      viewport().scrollTop = 200;
      viewport().dispatchEvent(new Event("scroll"));
    });
    metrics.scrollHeight = 1500;
    rerender(<Thread items={MESSAGES} hasOlder />);
    expect(viewport().scrollTop).toBe(700);
  });

  it("asks for older messages near the top and from the button", async () => {
    const onLoadOlder = vi.fn();
    renderWithUI(
      <Thread items={MESSAGES} hasOlder onLoadOlder={onLoadOlder} />,
    );
    act(() => {
      viewport().scrollTop = 20;
      viewport().dispatchEvent(new Event("scroll"));
    });
    expect(onLoadOlder).toHaveBeenCalledTimes(1);
    // Only once until new items arrive or loading ends.
    act(() => {
      viewport().dispatchEvent(new Event("scroll"));
    });
    expect(onLoadOlder).toHaveBeenCalledTimes(1);
  });

  it("has a load-older button for keyboard users", async () => {
    const onLoadOlder = vi.fn();
    renderWithUI(
      <Thread items={MESSAGES} hasOlder onLoadOlder={onLoadOlder} />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Показать более ранние" }),
    );
    expect(onLoadOlder).toHaveBeenCalledOnce();
  });
});
