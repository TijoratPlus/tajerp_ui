import type { Editor } from "@tiptap/core";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  RichTextContent,
  RichTextEditor,
  sanitizeHtml,
} from "../src/editor";
import { expectNoA11yViolations, renderWithUI } from "./utils";

// ProseMirror measures text; jsdom has no layout.
Range.prototype.getClientRects ??= () => [] as unknown as DOMRectList;
Range.prototype.getBoundingClientRect ??= () => new DOMRect();
document.elementFromPoint ??= () => null;

async function mount(ui: React.ReactElement, options?: Parameters<typeof renderWithUI>[1]) {
  let editor: Editor | undefined;
  const withReady = React.cloneElement(ui as React.ReactElement<{ onEditorReady?: (e: Editor) => void }>, {
    onEditorReady: (e: Editor) => {
      editor = e;
    },
  });
  const result = renderWithUI(withReady, options);
  await waitFor(() => expect(editor).toBeDefined());
  return { ...result, editor: editor! };
}

describe("RichTextEditor", () => {
  it("renders an accessible textbox with a toolbar and emits HTML", async () => {
    const onValueChange = vi.fn();
    const { editor } = await mount(
      <RichTextEditor aria-label="Заметка" placeholder="Добавьте заметку…" onValueChange={onValueChange} />,
    );
    const textbox = screen.getByRole("textbox", { name: "Заметка" });
    expect(textbox).toHaveAttribute("contenteditable", "true");
    expect(screen.getByRole("toolbar", { name: "Форматирование" })).toBeInTheDocument();
    // Image only appears with onImageUpload.
    expect(screen.queryByRole("button", { name: "Изображение" })).toBeNull();
    await expectNoA11yViolations();

    act(() => {
      editor.commands.insertContent("Позвонить завтра");
      editor.commands.selectAll();
    });
    expect(onValueChange).toHaveBeenLastCalledWith("<p>Позвонить завтра</p>");

    await userEvent.click(screen.getByRole("button", { name: "Жирный" }));
    expect(onValueChange).toHaveBeenLastCalledWith("<p><strong>Позвонить завтра</strong></p>");
    expect(screen.getByRole("button", { name: "Жирный" })).toHaveAttribute("aria-pressed", "true");

    act(() => {
      editor.commands.clearContent(true);
    });
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it("follows a controlled value and toggles task lists", async () => {
    function Harness() {
      const [value, setValue] = React.useState("<p>Первый</p>");
      return (
        <>
          <RichTextEditor aria-label="Текст" value={value} onValueChange={setValue} toolbar={["taskList", "bold"]} />
          <button type="button" onClick={() => setValue("<p>Второй</p>")}>
            Заменить
          </button>
        </>
      );
    }
    renderWithUI(<Harness />);
    const textbox = await screen.findByRole("textbox", { name: "Текст" });
    expect(textbox).toHaveTextContent("Первый");
    await userEvent.click(screen.getByRole("button", { name: "Заменить" }));
    expect(textbox).toHaveTextContent("Второй");
    expect(screen.getAllByRole("button")).toHaveLength(3);

    await userEvent.click(screen.getByRole("button", { name: "Список задач" }));
    expect(textbox.querySelector('ul[data-type="taskList"]')).toBeInTheDocument();
  });

  it("submits on Mod+Enter", async () => {
    const onSubmit = vi.fn();
    await mount(<RichTextEditor aria-label="Комментарий" onSubmit={onSubmit} />);
    const textbox = screen.getByRole("textbox", { name: "Комментарий" });
    fireEvent.keyDown(textbox, { key: "Enter", ctrlKey: true });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("suggests mentions after @ and inserts the picked person", async () => {
    const mentions = vi.fn((q: string) =>
      [
        { id: "alisher@tijorat.tj", label: "Алишер Раҳимов" },
        { id: "zarina@tijorat.tj", label: "Зарина Каримова" },
      ].filter((p) => p.label.toLowerCase().includes(q.toLowerCase())),
    );
    const onValueChange = vi.fn();
    const { editor } = await mount(
      <RichTextEditor aria-label="Комментарий" mentions={mentions} onValueChange={onValueChange} />,
    );
    act(() => {
      editor.chain().focus().insertContent("@За").run();
    });
    const list = await screen.findByRole("listbox", { name: "Упоминания" });
    await waitFor(() => expect(screen.getByRole("option", { name: /Зарина Каримова/ })).toBeInTheDocument());
    expect(list).toBeInTheDocument();
    expect(mentions).toHaveBeenLastCalledWith("За");

    await userEvent.click(screen.getByRole("option", { name: /Зарина Каримова/ }));
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    const html = onValueChange.mock.lastCall?.[0] as string;
    expect(html).toContain('data-type="mention"');
    expect(html).toContain('data-id="zarina@tijorat.tj"');
    expect(html).toContain("@Зарина Каримова");
  });

  it("is read-only with editable={false} and uses Tajik labels", async () => {
    await mount(<RichTextEditor aria-label="Қайд" editable={false} defaultValue="<p>Салом</p>" />, {
      provider: { locale: "tg" },
    });
    expect(screen.queryByRole("toolbar")).toBeNull();
    expect(screen.getByRole("textbox", { name: "Қайд" })).toHaveAttribute("contenteditable", "false");
  });

  it("shows Tajik toolbar strings", async () => {
    await mount(<RichTextEditor aria-label="Матн" toolbar={["bold", "link"]} />, {
      provider: { locale: "tg" },
    });
    expect(screen.getByRole("toolbar", { name: "Форматкунӣ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ғафс" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Пайванд" })).toBeInTheDocument();
  });
});

describe("RichTextContent", () => {
  it("renders sanitised HTML with prose styles", async () => {
    renderWithUI(
      <RichTextContent
        html={'<h2>Итоги встречи</h2><p onclick="alert(1)">Готово <a href="javascript:alert(1)">ссылка</a></p><script>alert(1)</script>'}
      />,
    );
    const heading = screen.getByRole("heading", { name: "Итоги встречи" });
    const root = heading.parentElement!;
    expect(root).toHaveClass("tj-prose");
    expect(root.querySelector("script")).toBeNull();
    expect(root.querySelector("p")).not.toHaveAttribute("onclick");
    expect(screen.getByText("ссылка")).not.toHaveAttribute("href");
    await expectNoA11yViolations();
  });

  it("sanitizeHtml keeps safe markup", () => {
    expect(sanitizeHtml('<p><a href="https://tijorat.plus" target="_blank">сайт</a></p>')).toBe(
      '<p><a href="https://tijorat.plus" target="_blank" rel="noopener noreferrer nofollow">сайт</a></p>',
    );
  });
});
