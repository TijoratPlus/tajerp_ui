import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { AIAssistantPanel, type AIMessage } from "../src/components/AIAssistantPanel";
import { ApprovalCard } from "../src/components/ApprovalCard";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const conversation: AIMessage[] = [
  { id: "1", role: "user", author: "Фарход", time: "09:12", content: "Что заканчивается?" },
  {
    id: "2",
    role: "assistant",
    time: "09:12",
    content: "Осталось мало муки и сахара.",
  },
];

describe("AIAssistantPanel", () => {
  it("renders header, log and greeting with suggestions when empty", async () => {
    renderWithUI(<AIAssistantPanel messages={[]} onSend={() => {}} onClose={() => {}} />);
    expect(screen.getByRole("heading", { name: "TijoratAI" })).toBeInTheDocument();
    const log = screen.getByRole("log", { name: "Переписка с TijoratAI" });
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Салом! Я TijoratAI")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Кто мне должен?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Закрыть" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("sends a suggestion via onSend", async () => {
    const onSend = vi.fn();
    renderWithUI(<AIAssistantPanel messages={[]} onSend={onSend} />);
    await userEvent.click(screen.getByRole("button", { name: "Что заканчивается на складе?" }));
    expect(onSend).toHaveBeenCalledWith("Что заканчивается на складе?");
  });

  it("hides suggestions once the conversation started", () => {
    renderWithUI(<AIAssistantPanel messages={conversation} onSend={() => {}} />);
    expect(screen.queryByRole("button", { name: "Кто мне должен?" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("Enter sends, Shift+Enter inserts a newline", async () => {
    const onSend = vi.fn();
    renderWithUI(<AIAssistantPanel messages={conversation} onSend={onSend} />);
    const box = screen.getByRole("textbox", { name: "Сообщение" });
    await userEvent.type(box, "Кто мне должен?{Shift>}{Enter}{/Shift}Список");
    expect(onSend).not.toHaveBeenCalled();
    expect(box).toHaveValue("Кто мне должен?\nСписок");
    await userEvent.type(box, "{Enter}");
    expect(onSend).toHaveBeenCalledWith("Кто мне должен?\nСписок");
    expect(box).toHaveValue("");
  });

  it("does not send empty text and blocks sending while busy", async () => {
    const onSend = vi.fn();
    const { rerender } = renderWithUI(
      <AIAssistantPanel messages={conversation} onSend={onSend} />,
    );
    const box = screen.getByRole("textbox", { name: "Сообщение" });
    const sendBtn = screen.getByRole("button", { name: "Отправить" });
    expect(sendBtn).toBeDisabled();
    await userEvent.type(box, "   {Enter}");
    expect(onSend).not.toHaveBeenCalled();

    rerender(<AIAssistantPanel messages={conversation} onSend={onSend} busy />);
    await userEvent.clear(box);
    await userEvent.type(box, "Ещё вопрос{Enter}");
    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();

    rerender(<AIAssistantPanel messages={conversation} onSend={onSend} />);
    await userEvent.click(screen.getByRole("button", { name: "Отправить" }));
    expect(onSend).toHaveBeenCalledWith("Ещё вопрос");
  });

  it("supports a controlled composer value", async () => {
    function Controlled() {
      const [value, setValue] = React.useState("Салом");
      return (
        <AIAssistantPanel
          messages={[]}
          value={value}
          onValueChange={setValue}
          onSend={() => {}}
        />
      );
    }
    renderWithUI(<Controlled />);
    const box = screen.getByRole("textbox", { name: "Сообщение" });
    expect(box).toHaveValue("Салом");
    await userEvent.type(box, "!");
    expect(box).toHaveValue("Салом!");
  });

  it("shows the typing indicator with screen-reader text and a mic button", async () => {
    const onVoice = vi.fn();
    renderWithUI(
      <AIAssistantPanel messages={conversation} typing onVoice={onVoice} onSend={() => {}} />,
    );
    expect(screen.getByText("TijoratAI печатает…")).toHaveClass("sr-only");
    await userEvent.click(screen.getByRole("button", { name: "Голосовой ввод" }));
    expect(onVoice).toHaveBeenCalledOnce();
    await expectNoA11yViolations();
  });

  it("renders an ApprovalCard inside an assistant bubble accessibly", async () => {
    const onApprove = vi.fn();
    renderWithUI(
      <AIAssistantPanel
        messages={[
          ...conversation,
          {
            id: "3",
            role: "assistant",
            fullWidth: true,
            content: (
              <ApprovalCard
                kind="purchase_order"
                amount={4850}
                requestedBy={{ name: "TijoratAI", kind: "ai" }}
                onApprove={onApprove}
              />
            ),
          },
        ]}
        onSend={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Одобрить" }));
    expect(onApprove).toHaveBeenCalledOnce();
    await expectNoA11yViolations();
  });

  it("localizes to Tajik", () => {
    renderWithUI(<AIAssistantPanel messages={[]} onSend={() => {}} />, {
      provider: { locale: "tg" },
    });
    expect(screen.getByRole("button", { name: "Кӣ ба ман қарздор аст?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Фиристодан" })).toBeInTheDocument();
  });
});
