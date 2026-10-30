import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Avatar, AvatarFallback, ConversationListItem } from "../src";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("ConversationListItem", () => {
  it("is a button with title, preview, channel and unread count", async () => {
    const onClick = vi.fn();
    const now = new Date();
    renderWithUI(
      <ConversationListItem
        title="Мадина Каримова"
        subtitle="@madina.k"
        preview="Курта ҳаст?"
        channel="instagram"
        time={new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 5)}
        unread={3}
        avatar={
          <Avatar size="md">
            <AvatarFallback>МК</AvatarFallback>
          </Avatar>
        }
        onClick={onClick}
      />,
    );
    const row = screen.getByRole("button", { name: /Мадина Каримова/ });
    expect(row).toHaveTextContent("09:05");
    expect(row).toHaveTextContent("Канал: Instagram");
    expect(row).toHaveTextContent("3 непрочитанных");
    expect(row).toHaveAttribute("data-unread", "true");
    await userEvent.click(row);
    expect(onClick).toHaveBeenCalledOnce();
    await expectNoA11yViolations();
  });

  it("renders a link, marks the active row and shows an unread dot", () => {
    renderWithUI(
      <ConversationListItem
        title="Бахтиёр"
        href="/inbox/1"
        active
        unread
        preview="Рахмат"
        channel="telegram"
      />,
    );
    const link = screen.getByRole("link", { name: /Бахтиёр/ });
    expect(link).toHaveAttribute("href", "/inbox/1");
    expect(link).toHaveAttribute("aria-current", "true");
    expect(link).toHaveTextContent("Есть непрочитанные");
  });

  it("prints older dates and Tajik counters", () => {
    renderWithUI(
      <ConversationListItem
        title="Фарҳод"
        time={new Date(2024, 0, 15, 10, 0)}
        unread={1}
      />,
      { provider: { locale: "tg" } },
    );
    expect(screen.getByText(/^15[./]01[./]2024$/)).toBeInTheDocument();
    expect(screen.getByText("1 паёми нахонда")).toHaveClass("sr-only");
  });
});
