import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChatComposer, type ChatComposerProps } from "../src";
import { autosizeTextarea } from "../src/components/ChatComposer";
import { expectNoA11yViolations, renderWithUI } from "./utils";

function Harness({
  onSend,
  initial = "",
  ...rest
}: Partial<ChatComposerProps> & { initial?: string }) {
  const [value, setValue] = React.useState(initial);
  return (
    <ChatComposer
      value={value}
      onChange={setValue}
      onSend={() => {
        onSend?.();
        setValue("");
      }}
      {...rest}
    />
  );
}

const field = () => screen.getByRole("textbox", { name: "Сообщение" });

describe("ChatComposer", () => {
  it("sends on Enter and adds a line on Shift+Enter", async () => {
    const onSend = vi.fn();
    renderWithUI(<Harness onSend={onSend} />);
    await userEvent.type(field(), "Салом{Shift>}{Enter}{/Shift}Нархаш чанд?");
    expect(field()).toHaveValue("Салом\nНархаш чанд?");
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    expect(onSend).toHaveBeenCalledOnce();
    expect(field()).toHaveValue("");
    await expectNoA11yViolations();
  });

  it("does not send empty text or while sending", async () => {
    const onSend = vi.fn();
    const { rerender } = renderWithUI(
      <ChatComposer value="   " onChange={() => {}} onSend={onSend} />,
    );
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
    rerender(
      <ChatComposer value="Да" onChange={() => {}} onSend={onSend} sending />,
    );
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(
      screen.getByRole("button", { name: "Отправляется…" }),
    ).toBeDisabled();
    expect(onSend).not.toHaveBeenCalled();
  });

  it("ignores the Enter that commits an IME composition", () => {
    const onSend = vi.fn();
    renderWithUI(
      <ChatComposer value="你好" onChange={() => {}} onSend={onSend} />,
    );
    fireEvent.compositionStart(field());
    fireEvent.keyDown(field(), { key: "Enter" });
    fireEvent.compositionEnd(field());
    // Safari: keydown after compositionend, flagged with keyCode 229.
    fireEvent.keyDown(field(), { key: "Enter", keyCode: 229 });
    fireEvent.keyDown(field(), { key: "Enter", isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(onSend).toHaveBeenCalledOnce();
  });

  it("sends from the button and renders leading/trailing slots", async () => {
    const onSend = vi.fn();
    renderWithUI(
      <Harness
        onSend={onSend}
        initial="Ок"
        leading={<button type="button">Прикрепить</button>}
        trailing={<button type="button">Шаблоны</button>}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Прикрепить" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Шаблоны" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Отправить" }));
    expect(onSend).toHaveBeenCalledOnce();
  });

  it("explains why sending is disabled", async () => {
    renderWithUI(
      <ChatComposer
        value=""
        onChange={() => {}}
        onSend={() => {}}
        disabledReason="Окно ответа 24 часа закрыто — отправьте шаблон."
      />,
    );
    expect(field()).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Окно ответа 24 часа закрыто",
    );
    expect(field()).toHaveAccessibleDescription(/Окно ответа 24 часа закрыто/);
    await expectNoA11yViolations();
  });

  it("uses Tajik strings", () => {
    renderWithUI(
      <ChatComposer value="" onChange={() => {}} onSend={() => {}} />,
      {
        provider: { locale: "tg" },
      },
    );
    expect(screen.getByRole("textbox", { name: "Паём" })).toHaveAttribute(
      "placeholder",
      "Паём нависед…",
    );
  });
});

describe("autosizeTextarea", () => {
  afterEach(() => {
    delete (HTMLTextAreaElement.prototype as unknown as Record<string, unknown>)
      .scrollHeight;
  });

  function withContentHeight(px: number) {
    Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
      configurable: true,
      get: () => px,
    });
  }

  it("grows with the content and stops at maxRows", () => {
    const el = document.createElement("textarea");
    el.style.lineHeight = "20px";
    el.style.padding = "6px 0";
    el.style.boxSizing = "border-box";
    document.body.appendChild(el);

    withContentHeight(52); // two lines + padding
    autosizeTextarea(el, 8);
    expect(el.style.height).toBe("52px");
    expect(el.style.overflowY).toBe("hidden");

    withContentHeight(400); // 19 lines
    autosizeTextarea(el, 8);
    expect(el.style.height).toBe(`${20 * 8 + 12}px`);
    expect(el.style.overflowY).toBe("auto");
    el.remove();
  });
});
