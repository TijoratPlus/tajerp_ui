import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Label, TajUIProvider } from "../../src";
import { RichTextContent, RichTextEditor, type MentionItem } from "../../src/editor";

const meta: Meta<typeof RichTextEditor> = {
  title: "Components/Inputs/RichTextEditor",
  component: RichTextEditor,
  parameters: {
    docs: {
      description: {
        component:
          "Rich-text editor for CRM notes, comments and e-mails (`import { RichTextEditor } from \"tajerp_ui/editor\"`). Toolbar, `@` mentions, task lists, tables, links, images (button, paste, drop via `onImageUpload`) and emoji. Emits HTML; render stored HTML with `RichTextContent`. Ctrl/⌘+Enter calls `onSubmit`. `extensions` adds tiptap extensions (same name replaces a built-in), `replaceStarterKit` disables StarterKit parts such as `paragraph`.",
      },
    },
  },
  args: { editable: true, placeholder: "Добавьте заметку…" },
};
export default meta;

type Story = StoryObj<typeof RichTextEditor>;

const TEAM: MentionItem[] = [
  { id: "alisher@tijorat.tj", label: "Алишер Раҳимов", description: "Менеджер по продажам" },
  { id: "zarina@tijorat.tj", label: "Зарина Каримова", description: "Бухгалтер" },
  { id: "farrukh@tijorat.tj", label: "Фаррух Назаров", description: "Руководитель отдела" },
  { id: "nigina@tijorat.tj", label: "Нигина Саидова", description: "Поддержка" },
];
const searchTeam = (q: string) =>
  TEAM.filter((p) => p.label.toLowerCase().includes(q.toLowerCase())).slice(0, 6);

// Storybook stand-in for an upload endpoint: shows the picked file locally.
const fakeUpload = (file: File) =>
  new Promise<string>((resolve) => setTimeout(() => resolve(URL.createObjectURL(file)), 600));

const NOTE = `<h2>Итоги встречи с «Сомон Трейд»</h2>
<p>Клиент готов перейти на <strong>Tijorat+ Бизнес</strong> с 1 ноября. Нужен импорт остатков из 1С.</p>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Отправить коммерческое предложение</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Согласовать дату обучения кассиров</p></div></li>
</ul>
<blockquote><p>«Главное — чтобы касса работала без интернета».</p></blockquote>
<table><tbody>
  <tr><th><p>Филиал</p></th><th><p>Касс</p></th></tr>
  <tr><td><p>Душанбе, Рудаки 45</p></td><td><p>3</p></td></tr>
  <tr><td><p>Худжанд</p></td><td><p>2</p></td></tr>
</tbody></table>`;

export const Playground: Story = {
  render: (args) => {
    const [html, setHtml] = React.useState(NOTE);
    return (
      <div style={{ display: "grid", gap: 8, maxWidth: 720 }}>
        <Label id="note-label">Заметка по сделке</Label>
        <RichTextEditor
          {...args}
          aria-labelledby="note-label"
          value={html}
          onValueChange={setHtml}
          mentions={searchTeam}
          onImageUpload={fakeUpload}
          maxHeight={360}
        />
        <details>
          <summary style={{ fontSize: 13 }}>HTML</summary>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{html}</pre>
        </details>
      </div>
    );
  },
};

export const Comment: Story = {
  name: "Комментарий (Ctrl+Enter — отправить)",
  render: () => {
    const [sent, setSent] = React.useState<string[]>([]);
    const [draft, setDraft] = React.useState("");
    return (
      <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
        {sent.map((h, i) => (
          <RichTextContent key={i} html={h} style={{ padding: 8, borderRadius: 8, background: "var(--ui-surface-2)" }} />
        ))}
        <RichTextEditor
          aria-label="Комментарий"
          placeholder="Напишите комментарий, @ — упомянуть коллегу"
          toolbar={["bold", "italic", "bulletList", "link", "emoji"]}
          mentions={searchTeam}
          minHeight={64}
          value={draft}
          onValueChange={setDraft}
          onSubmit={() => {
            if (!draft) return;
            setSent((s) => [...s, draft]);
            setDraft("");
          }}
        />
      </div>
    );
  },
};

export const ReadMode: Story = {
  name: "Только чтение",
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 720 }}>
      <RichTextEditor aria-label="Заметка" editable={false} defaultValue={NOTE} />
      <RichTextContent html={'<p>Упомянута <span data-type="mention" class="tj-mention" data-id="zarina@tijorat.tj">@Зарина Каримова</span> — проверьте счёт.</p>'} />
    </div>
  ),
};

export const Tajik: Story = {
  name: "Тоҷикӣ",
  render: () => (
    <TajUIProvider locale="tg">
      <div style={{ maxWidth: 640 }}>
        <RichTextEditor
          aria-label="Қайд"
          placeholder="Қайд илова кунед…"
          defaultValue="<p>Мизоҷ хоҳиш кард, ки нархномаро то ҷумъа фиристем.</p>"
          mentions={searchTeam}
        />
      </div>
    </TajUIProvider>
  ),
};
