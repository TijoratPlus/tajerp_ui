import { Extension, type AnyExtension, type Editor } from "@tiptap/core";
import { Image } from "@tiptap/extension-image";
import { Mention } from "@tiptap/extension-mention";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { StarterKit, type StarterKitOptions } from "@tiptap/starter-kit";
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Code,
  Heading,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Quote,
  RemoveFormatting,
  Smile,
  Strikethrough,
  Table2,
  Underline,
} from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { controlFocusWithin, focusRing } from "../lib/control";
import { floatingPanelClass } from "../lib/overlay";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Button } from "./Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { EmojiPicker } from "./EmojiPicker";
import { Input } from "./Input";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Spinner } from "./Spinner";
import { useCommonMessages, useMessages, usePortalContainer } from "./TajUIProvider";

// ─── Strings ────────────────────────────────────────────────────────

export const richTextEditorMessages = defineMessages("richTextEditor", {
  ru: {
    toolbar: "Форматирование",
    editorLabel: "Текст",
    bold: "Жирный",
    italic: "Курсив",
    underline: "Подчёркнутый",
    strike: "Зачёркнутый",
    heading: "Стиль текста",
    paragraph: "Обычный текст",
    heading1: "Заголовок 1",
    heading2: "Заголовок 2",
    heading3: "Заголовок 3",
    bulletList: "Маркированный список",
    orderedList: "Нумерованный список",
    taskList: "Список задач",
    blockquote: "Цитата",
    code: "Код",
    link: "Ссылка",
    linkUrl: "Адрес ссылки",
    linkRemove: "Убрать ссылку",
    image: "Изображение",
    uploading: "Загрузка изображения…",
    table: "Таблица",
    insertTable: "Вставить таблицу",
    addRow: "Добавить строку",
    addColumn: "Добавить столбец",
    deleteRow: "Удалить строку",
    deleteColumn: "Удалить столбец",
    deleteTable: "Удалить таблицу",
    align: "Выравнивание",
    alignLeft: "По левому краю",
    alignCenter: "По центру",
    alignRight: "По правому краю",
    emoji: "Эмодзи",
    clear: "Очистить форматирование",
    mentions: "Упоминания",
    noMentions: "Никого не найдено",
  },
  tg: {
    toolbar: "Форматкунӣ",
    editorLabel: "Матн",
    bold: "Ғафс",
    italic: "Курсив",
    underline: "Хатзер",
    strike: "Хатхӯрда",
    heading: "Услуби матн",
    paragraph: "Матни оддӣ",
    heading1: "Сарлавҳаи 1",
    heading2: "Сарлавҳаи 2",
    heading3: "Сарлавҳаи 3",
    bulletList: "Рӯйхати нуқтадор",
    orderedList: "Рӯйхати рақамдор",
    taskList: "Рӯйхати вазифаҳо",
    blockquote: "Иқтибос",
    code: "Код",
    link: "Пайванд",
    linkUrl: "Суроғаи пайванд",
    linkRemove: "Нест кардани пайванд",
    image: "Тасвир",
    uploading: "Боркунии тасвир…",
    table: "Ҷадвал",
    insertTable: "Гузоштани ҷадвал",
    addRow: "Илова кардани сатр",
    addColumn: "Илова кардани сутун",
    deleteRow: "Нест кардани сатр",
    deleteColumn: "Нест кардани сутун",
    deleteTable: "Нест кардани ҷадвал",
    align: "Ҳамворкунӣ",
    alignLeft: "Аз чап",
    alignCenter: "Дар марказ",
    alignRight: "Аз рост",
    emoji: "Эмодзи",
    clear: "Тоза кардани формат",
    mentions: "Ёдовариҳо",
    noMentions: "Касе ёфт нашуд",
  },
  en: {
    toolbar: "Formatting",
    editorLabel: "Text",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    strike: "Strikethrough",
    heading: "Text style",
    paragraph: "Normal text",
    heading1: "Heading 1",
    heading2: "Heading 2",
    heading3: "Heading 3",
    bulletList: "Bulleted list",
    orderedList: "Numbered list",
    taskList: "Task list",
    blockquote: "Quote",
    code: "Code",
    link: "Link",
    linkUrl: "Link address",
    linkRemove: "Remove link",
    image: "Image",
    uploading: "Uploading image…",
    table: "Table",
    insertTable: "Insert table",
    addRow: "Add row",
    addColumn: "Add column",
    deleteRow: "Delete row",
    deleteColumn: "Delete column",
    deleteTable: "Delete table",
    align: "Alignment",
    alignLeft: "Align left",
    alignCenter: "Align center",
    alignRight: "Align right",
    emoji: "Emoji",
    clear: "Clear formatting",
    mentions: "Mentions",
    noMentions: "No one found",
  },
});

export type RichTextEditorLabels = (typeof richTextEditorMessages.locales)["ru"];

// ─── Types ──────────────────────────────────────────────────────────

export interface MentionItem {
  id: string;
  label: string;
  avatar?: string;
  /** Secondary line in the suggestion list (e-mail, role). */
  description?: string;
}

export type RichTextToolbarItem =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "heading"
  | "bulletList"
  | "orderedList"
  | "taskList"
  | "blockquote"
  | "code"
  | "link"
  | "image"
  | "table"
  | "align"
  | "emoji"
  | "clear";

/** The full toolbar, in order. `image` shows only with `onImageUpload`. */
export const RICH_TEXT_TOOLBAR: RichTextToolbarItem[] = [
  "heading",
  "bold",
  "italic",
  "underline",
  "strike",
  "bulletList",
  "orderedList",
  "taskList",
  "blockquote",
  "code",
  "align",
  "link",
  "image",
  "table",
  "emoji",
  "clear",
];

export interface RichTextEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "onSubmit"> {
  /** HTML. An empty document is `""`. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (html: string) => void;
  placeholder?: string;
  /** `false` renders read mode (no toolbar, not editable). Defaults to true. */
  editable?: boolean;
  /** `true` (default) = full toolbar, `false` = none, or the items to show. */
  toolbar?: boolean | RichTextToolbarItem[];
  /** Enables `@` mentions; return the people matching the query. */
  mentions?: (query: string) => MentionItem[] | Promise<MentionItem[]>;
  /** Enables the image button, paste and drop; resolve with the file URL. */
  onImageUpload?: (file: File) => Promise<string>;
  /** Called when an image upload rejects. */
  onImageUploadError?: (error: unknown, file: File) => void;
  /**
   * Extra tiptap extensions. One with the same name as a built-in one
   * (`image`, `mention`, `placeholder`, `table`, …) replaces it.
   * Read once, when the editor is created.
   */
  extensions?: AnyExtension[];
  /**
   * StarterKit options merged over the defaults: `{ paragraph: false }`
   * drops its paragraph so `extensions` can supply another one.
   * Read once, when the editor is created.
   */
  replaceStarterKit?: Partial<StarterKitOptions>;
  onEditorReady?: (editor: Editor) => void;
  minHeight?: number | string;
  maxHeight?: number | string;
  /** Classes for the editable content element. */
  contentClassName?: string;
  autofocus?: boolean;
  /** Mod+Enter (Ctrl/⌘+Enter) — send a comment or an e-mail. */
  onSubmit?: () => void;
  labels?: Partial<RichTextEditorLabels>;
}

// ─── Sanitising read-only HTML ─────────────────────────────────────

const DROP_TAGS = "script,style,iframe,object,embed,link,meta,base,form,frame,frameset,noscript,template";
const URL_ATTRS = ["href", "src", "xlink:href", "action", "formaction", "srcset"];

/**
 * Strip scripts, event handlers and `javascript:` URLs from HTML stored by
 * an editor before it is rendered. A defence-in-depth helper for trusted
 * sources (your own instance), not a full HTML sanitiser for hostile input.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  if (typeof DOMParser === "undefined") {
    return html
      .replace(/<(script|style|iframe|object|embed|noscript|template)[\s\S]*?<\/\1\s*>/gi, "")
      .replace(/<(script|style|iframe|object|embed|link|meta|base)\b[^>]*>/gi, "")
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/(href|src)\s*=\s*(["']?)\s*(javascript|vbscript|data:text\/html)[^"'\s>]*\2/gi, "$1=\"#\"");
  }
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  doc.body.querySelectorAll(DROP_TAGS).forEach((el) => el.remove());
  doc.body.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      // eslint-disable-next-line no-control-regex
      const v = attr.value.replace(/[\s\u0000-\u001f]/g, "").toLowerCase();
      if (name.startsWith("on")) el.removeAttribute(attr.name);
      else if (
        URL_ATTRS.includes(name) &&
        (v.startsWith("javascript:") || v.startsWith("vbscript:") || v.startsWith("data:text/html"))
      ) {
        el.removeAttribute(attr.name);
      }
    }
    if (el.tagName === "A" && el.getAttribute("target") === "_blank") {
      el.setAttribute("rel", "noopener noreferrer nofollow");
    }
  });
  return doc.body.innerHTML;
}

/** Typography shared by the editor and RichTextContent (styles/editor.css). */
const proseClass = "tj-prose";

export interface RichTextContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** HTML from a RichTextEditor (comments, notes, e-mail bodies). */
  html: string;
}

/** Read-only rendering of editor HTML with the same typography, sanitised. */
export const RichTextContent = React.forwardRef<HTMLDivElement, RichTextContentProps>(
  ({ html, className, ...props }, ref) => {
    const safe = React.useMemo(() => sanitizeHtml(html), [html]);
    return (
      <div
        ref={ref}
        data-slot="rich-text-content"
        className={cn(proseClass, className)}
        dangerouslySetInnerHTML={{ __html: safe }}
        {...props}
      />
    );
  },
);
RichTextContent.displayName = "RichTextContent";

// ─── Mentions popup ────────────────────────────────────────────────

interface SuggestState {
  items: MentionItem[];
  index: number;
  rect: DOMRect | null;
  loading: boolean;
  command: (item: { id: string; label: string }) => void;
}

function MentionList({
  state,
  labels,
  onPick,
  onHover,
}: {
  state: SuggestState;
  labels: RichTextEditorLabels;
  onPick: (item: MentionItem) => void;
  onHover: (index: number) => void;
}) {
  const container = usePortalContainer();
  const listId = React.useId();
  const common = useCommonMessages();
  React.useEffect(() => {
    document.getElementById(`${listId}-${state.index}`)?.scrollIntoView({ block: "nearest" });
  }, [state.index, listId]);
  if (!state.rect || typeof document === "undefined") return null;
  return createPortal(
    <div
      data-slot="rich-text-mentions"
      className={cn(floatingPanelClass, "fixed max-h-64 w-64 overflow-y-auto p-1")}
      style={{ top: state.rect.bottom + 4, left: state.rect.left }}
    >
      <ul role="listbox" aria-label={labels.mentions} className="flex flex-col gap-0.5">
        {state.items.length === 0 ? (
          <li role="presentation" className="px-2.5 py-1.5 text-ui-label text-ink-3">
            {state.loading ? common.loading : labels.noMentions}
          </li>
        ) : (
          state.items.map((item, i) => (
            <li
              key={item.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === state.index}
              data-slot="rich-text-mention-option"
              onPointerDown={(e) => e.preventDefault()}
              onPointerEnter={() => onHover(i)}
              onClick={() => onPick(item)}
              className={cn(
                "flex min-h-8 cursor-pointer items-center gap-2 !rounded-lg px-2 py-1 text-ui-body text-ink-1",
                i === state.index && "bg-mist text-mist-ink",
              )}
            >
              <Avatar size="xs">
                {item.avatar ? <AvatarImage src={item.avatar} alt="" /> : null}
                <AvatarFallback>{item.label.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{item.label}</span>
                {item.description ? (
                  <span className="truncate text-ui-caption text-ink-3">{item.description}</span>
                ) : null}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>,
    container ?? document.body,
  );
}

// ─── Toolbar ────────────────────────────────────────────────────────

const toolBtn = cn(
  "inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center gap-0.5 !rounded-md text-ink-2 transition-colors",
  "hover:bg-mist hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-50",
  "aria-pressed:bg-mist aria-pressed:text-brand-ink data-[state=open]:bg-mist [&_svg]:size-4",
  focusRing,
);

const ToolButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }
>(({ label, active, className, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={label}
    title={label}
    aria-pressed={active}
    data-slot="rich-text-tool"
    // Keep the editor's selection when clicking a tool.
    onMouseDown={(e) => e.preventDefault()}
    className={cn(toolBtn, className)}
    {...props}
  >
    {children}
  </button>
));
ToolButton.displayName = "ToolButton";

function LinkTool({ editor, t }: { editor: Editor; t: RichTextEditorLabels }) {
  const common = useCommonMessages();
  const [open, setOpen] = React.useState(false);
  const [href, setHref] = React.useState("");
  const active = useEditorState({ editor, selector: ({ editor: e }) => e.isActive("link") });
  const apply = () => {
    const url = href.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (url) chain.setLink({ href: /^[a-z][a-z0-9+.-]*:|^\/|^#/i.test(url) ? url : `https://${url}` }).run();
    else chain.unsetLink().run();
    setOpen(false);
  };
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setHref((editor.getAttributes("link").href as string | undefined) ?? "");
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <ToolButton label={t.link} active={active}>
          <Link2 aria-hidden />
        </ToolButton>
      </PopoverTrigger>
      <PopoverContent align="start" aria-label={t.link} className="w-80">
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <Input
            aria-label={t.linkUrl}
            placeholder="https://"
            value={href}
            autoFocus
            onChange={(e) => setHref(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            {active ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  editor.chain().focus().extendMarkRange("link").unsetLink().run();
                  setOpen(false);
                }}
              >
                {t.linkRemove}
              </Button>
            ) : null}
            <Button type="submit" size="sm">
              {common.apply}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function Toolbar({
  editor,
  items,
  t,
  uploading,
  onPickImage,
}: {
  editor: Editor;
  items: RichTextToolbarItem[];
  t: RichTextEditorLabels;
  uploading: boolean;
  onPickImage: () => void;
}) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      taskList: e.isActive("taskList"),
      blockquote: e.isActive("blockquote"),
      code: e.isActive("code"),
      table: e.isActive("table"),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      center: e.isActive({ textAlign: "center" }),
      right: e.isActive({ textAlign: "right" }),
    }),
  });
  const chain = () => editor.chain().focus();
  const has = (name: string) => editor.extensionManager.extensions.some((x) => x.name === name);

  const toggle = (
    key: keyof typeof s,
    label: string,
    icon: React.ReactNode,
    run: () => void,
  ) => (
    <ToolButton key={key} label={label} active={s[key]} onClick={run}>
      {icon}
    </ToolButton>
  );

  const render = (item: RichTextToolbarItem): React.ReactNode => {
    switch (item) {
      case "bold":
        return toggle("bold", t.bold, <Bold aria-hidden />, () => chain().toggleBold().run());
      case "italic":
        return toggle("italic", t.italic, <Italic aria-hidden />, () => chain().toggleItalic().run());
      case "underline":
        return has("underline")
          ? toggle("underline", t.underline, <Underline aria-hidden />, () => chain().toggleUnderline().run())
          : null;
      case "strike":
        return toggle("strike", t.strike, <Strikethrough aria-hidden />, () => chain().toggleStrike().run());
      case "bulletList":
        return toggle("bulletList", t.bulletList, <List aria-hidden />, () => chain().toggleBulletList().run());
      case "orderedList":
        return toggle("orderedList", t.orderedList, <ListOrdered aria-hidden />, () =>
          chain().toggleOrderedList().run(),
        );
      case "taskList":
        return has("taskList")
          ? toggle("taskList", t.taskList, <ListChecks aria-hidden />, () => chain().toggleTaskList().run())
          : null;
      case "blockquote":
        return toggle("blockquote", t.blockquote, <Quote aria-hidden />, () => chain().toggleBlockquote().run());
      case "code":
        return toggle("code", t.code, <Code aria-hidden />, () => chain().toggleCode().run());
      case "clear":
        return (
          <ToolButton
            key="clear"
            label={t.clear}
            onClick={() => chain().unsetAllMarks().clearNodes().run()}
          >
            <RemoveFormatting aria-hidden />
          </ToolButton>
        );
      case "link":
        return has("link") ? <LinkTool key="link" editor={editor} t={t} /> : null;
      case "image":
        return (
          <ToolButton key="image" label={uploading ? t.uploading : t.image} onClick={onPickImage} disabled={uploading}>
            {uploading ? <Spinner className="size-4 text-current" /> : <ImagePlus aria-hidden />}
          </ToolButton>
        );
      case "emoji":
        return (
          <EmojiPicker
            key="emoji"
            onSelect={(emoji) => chain().insertContent(emoji).run()}
            trigger={
              <ToolButton label={t.emoji}>
                <Smile aria-hidden />
              </ToolButton>
            }
          />
        );
      case "heading":
        return (
          <DropdownMenu key="heading">
            <DropdownMenuTrigger asChild>
              <ToolButton label={t.heading} className="w-auto px-1.5">
                <Heading aria-hidden />
                <ChevronDown aria-hidden className="!size-3" />
              </ToolButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => chain().setParagraph().run()}>{t.paragraph}</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => chain().toggleHeading({ level: 1 }).run()}>
                <span className={cn("text-ui-title font-bold", s.h1 && "text-brand-ink")}>{t.heading1}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => chain().toggleHeading({ level: 2 }).run()}>
                <span className={cn("font-bold", s.h2 && "text-brand-ink")}>{t.heading2}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => chain().toggleHeading({ level: 3 }).run()}>
                <span className={cn("font-semibold", s.h3 && "text-brand-ink")}>{t.heading3}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      case "align":
        return has("textAlign") ? (
          <DropdownMenu key="align">
            <DropdownMenuTrigger asChild>
              <ToolButton label={t.align} className="w-auto px-1.5">
                {s.center ? <AlignCenter aria-hidden /> : s.right ? <AlignRight aria-hidden /> : <AlignLeft aria-hidden />}
                <ChevronDown aria-hidden className="!size-3" />
              </ToolButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => chain().setTextAlign("left").run()}>
                <AlignLeft aria-hidden /> {t.alignLeft}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => chain().setTextAlign("center").run()}>
                <AlignCenter aria-hidden /> {t.alignCenter}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => chain().setTextAlign("right").run()}>
                <AlignRight aria-hidden /> {t.alignRight}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null;
      case "table":
        return has("table") ? (
          <DropdownMenu key="table">
            <DropdownMenuTrigger asChild>
              <ToolButton label={t.table} active={s.table} className="w-auto px-1.5">
                <Table2 aria-hidden />
                <ChevronDown aria-hidden className="!size-3" />
              </ToolButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onSelect={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              >
                {t.insertTable}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={!s.table} onSelect={() => chain().addRowAfter().run()}>
                {t.addRow}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!s.table} onSelect={() => chain().addColumnAfter().run()}>
                {t.addColumn}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!s.table} onSelect={() => chain().deleteRow().run()}>
                {t.deleteRow}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!s.table} onSelect={() => chain().deleteColumn().run()}>
                {t.deleteColumn}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="danger"
                disabled={!s.table}
                onSelect={() => chain().deleteTable().run()}
              >
                {t.deleteTable}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null;
    }
  };

  return (
    <div
      role="toolbar"
      aria-label={t.toolbar}
      data-slot="rich-text-toolbar"
      className="flex flex-wrap items-center gap-0.5 border-b border-hairline bg-ui-surface-2 px-1.5 py-1"
    >
      {items.map(render)}
    </div>
  );
}

// ─── Editor ─────────────────────────────────────────────────────────

const toCss = (v: number | string | undefined) => (typeof v === "number" ? `${v}px` : v);

/**
 * Rich-text editor (tiptap) for notes, comments and e-mails: formatting
 * toolbar, `@` mentions, task lists, tables, links, images (button, paste,
 * drop) and emoji. Emits HTML; render stored HTML with `RichTextContent`.
 * Mod+Enter calls `onSubmit`.
 *
 * Import from `tajerp_ui/editor`, so apps without an editor do not ship
 * tiptap.
 */
export const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  (props, ref) => {
    const {
      value,
      defaultValue,
      onValueChange,
      placeholder,
      editable = true,
      toolbar = true,
      mentions,
      onImageUpload,
      onImageUploadError,
      extensions: extraExtensions,
      replaceStarterKit,
      onEditorReady,
      minHeight = 120,
      maxHeight,
      className,
      contentClassName,
      autofocus = false,
      onSubmit,
      labels,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      ...rest
    } = props;
    const t = useMessages(richTextEditorMessages, labels);

    // Callbacks read through refs: the editor is created once.
    const live = React.useRef({ onValueChange, onSubmit, mentions, onImageUpload, onImageUploadError, placeholder });
    live.current = { onValueChange, onSubmit, mentions, onImageUpload, onImageUploadError, placeholder };

    const [suggest, setSuggest] = React.useState<SuggestState | null>(null);
    const suggestRef = React.useRef<SuggestState | null>(null);
    const updateSuggest = (next: SuggestState | null) => {
      suggestRef.current = next;
      setSuggest(next);
    };

    const [uploads, setUploads] = React.useState(0);
    const fileRef = React.useRef<HTMLInputElement>(null);
    const editorRef = React.useRef<Editor | null>(null);
    const lastHtml = React.useRef<string>(value ?? defaultValue ?? "");

    const uploadImages = React.useCallback((files: File[]) => {
      const upload = live.current.onImageUpload;
      if (!upload) return false;
      const images = files.filter((f) => f.type.startsWith("image/"));
      if (!images.length) return false;
      for (const file of images) {
        setUploads((n) => n + 1);
        upload(file)
          .then((src) => {
            editorRef.current?.chain().focus().setImage({ src, alt: file.name }).run();
          })
          .catch((err: unknown) => live.current.onImageUploadError?.(err, file))
          .finally(() => setUploads((n) => n - 1));
      }
      return true;
    }, []);

    const extensions = React.useMemo(() => {
      const custom = extraExtensions ?? [];
      const replaced = new Set(custom.map((x) => x.name));
      const submit = Extension.create({
        name: "tjSubmit",
        addKeyboardShortcuts() {
          return {
            "Mod-Enter": () => {
              const fn = live.current.onSubmit;
              if (!fn) return false;
              fn();
              return true;
            },
          };
        },
      });
      const builtIn: AnyExtension[] = [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
          link: {
            openOnClick: false,
            autolink: true,
            HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
          },
          ...replaceStarterKit,
        }),
        Placeholder.configure({ placeholder: () => live.current.placeholder ?? "" }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TaskList,
        TaskItem.configure({ nested: true }),
        TableKit.configure({ table: { resizable: false } }),
        Image.configure({ inline: false }),
        submit,
      ];
      if (mentions) {
        builtIn.push(
          Mention.configure({
            HTMLAttributes: { class: "tj-mention" },
            suggestion: {
              char: "@",
              items: async ({ query }) => (await live.current.mentions?.(query)) ?? [],
              render: () => {
                const show = (p: SuggestionProps<MentionItem, { id: string; label: string }>) =>
                  updateSuggest({
                    items: p.items,
                    index: 0,
                    loading: p.loading,
                    rect: p.clientRect?.() ?? null,
                    command: p.command,
                  });
                return {
                  onStart: show,
                  onUpdate: show,
                  onExit: () => updateSuggest(null),
                  onKeyDown: ({ event }: SuggestionKeyDownProps) => {
                    const cur = suggestRef.current;
                    if (!cur) return false;
                    const n = cur.items.length;
                    if (event.key === "ArrowDown" && n) {
                      updateSuggest({ ...cur, index: (cur.index + 1) % n });
                      return true;
                    }
                    if (event.key === "ArrowUp" && n) {
                      updateSuggest({ ...cur, index: (cur.index - 1 + n) % n });
                      return true;
                    }
                    if ((event.key === "Enter" || event.key === "Tab") && n) {
                      const item = cur.items[cur.index];
                      cur.command({ id: item.id, label: item.label });
                      return true;
                    }
                    if (event.key === "Escape") {
                      updateSuggest(null);
                      return true;
                    }
                    return false;
                  },
                };
              },
            },
          }),
        );
      }
      return [...builtIn.filter((x) => !replaced.has(x.name)), ...custom];
      // Extensions are fixed for the editor's lifetime (see the prop docs).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const editor = useEditor({
      extensions,
      content: value ?? defaultValue ?? "",
      editable,
      autofocus,
      editorProps: {
        attributes: {
          class: cn(proseClass, "outline-none px-3 py-2", contentClassName),
          "aria-multiline": "true",
          "data-slot": "rich-text-editor-content",
          ...(ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : { "aria-label": ariaLabel ?? placeholder ?? t.editorLabel }),
          ...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {}),
        },
        handlePaste: (_view, event) => uploadImages(Array.from(event.clipboardData?.files ?? [])),
        handleDrop: (_view, event) => {
          const files = Array.from((event as DragEvent).dataTransfer?.files ?? []);
          if (!files.length) return false;
          const handled = uploadImages(files);
          if (handled) event.preventDefault();
          return handled;
        },
      },
      onUpdate: ({ editor: e }) => {
        const html = e.isEmpty ? "" : e.getHTML();
        lastHtml.current = html;
        live.current.onValueChange?.(html);
      },
    });
    editorRef.current = editor;

    React.useEffect(() => {
      if (editor) onEditorReady?.(editor);
      // Once per editor instance.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

    // Controlled value: push outside changes into the document.
    React.useEffect(() => {
      if (!editor || value === undefined || value === lastHtml.current) return;
      lastHtml.current = value;
      editor.commands.setContent(value || "", { emitUpdate: false });
    }, [editor, value]);

    React.useEffect(() => {
      if (editor && editor.isEditable !== editable) editor.setEditable(editable);
    }, [editor, editable]);

    const items = React.useMemo(() => {
      if (!toolbar || !editable) return [];
      const list = toolbar === true ? RICH_TEXT_TOOLBAR : toolbar;
      return list.filter((i) => i !== "image" || !!onImageUpload);
    }, [toolbar, editable, onImageUpload]);

    return (
      <div
        ref={ref}
        data-slot="rich-text-editor"
        data-editable={editable || undefined}
        className={cn(
          "flex flex-col overflow-hidden",
          editable && cn("!rounded-lg border border-hairline bg-ui-surface", controlFocusWithin),
          className,
        )}
        {...rest}
      >
        {editor && items.length ? (
          <Toolbar
            editor={editor}
            items={items}
            t={t}
            uploading={uploads > 0}
            onPickImage={() => fileRef.current?.click()}
          />
        ) : null}
        <div
          className="min-h-0 flex-1 cursor-text overflow-y-auto"
          style={{ minHeight: editable ? toCss(minHeight) : undefined, maxHeight: toCss(maxHeight) }}
          onMouseDown={(e) => {
            if (editable && e.target === e.currentTarget) {
              e.preventDefault();
              editor?.commands.focus("end");
            }
          }}
        >
          <EditorContent editor={editor} className={cn(!editable && "[&_.tj-prose]:p-0")} />
        </div>
        {onImageUpload ? (
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              uploadImages(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
        ) : null}
        {suggest ? (
          <MentionList
            state={suggest}
            labels={t}
            onHover={(index) => updateSuggest({ ...suggest, index })}
            onPick={(item) => suggest.command({ id: item.id, label: item.label })}
          />
        ) : null}
      </div>
    );
  },
);
RichTextEditor.displayName = "RichTextEditor";
