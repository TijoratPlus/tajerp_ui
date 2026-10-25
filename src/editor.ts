// ─── tajerp_ui/editor — rich-text editing (tiptap) ──────────────────
// A separate entry so apps without an editor never bundle tiptap/ProseMirror.
// Prose styles ship in styles/editor.css, already part of styles/index.css.

export {
  RICH_TEXT_TOOLBAR,
  RichTextContent,
  RichTextEditor,
  richTextEditorMessages,
  sanitizeHtml,
} from "./components/RichTextEditor";
export type {
  MentionItem,
  RichTextContentProps,
  RichTextEditorLabels,
  RichTextEditorProps,
  RichTextToolbarItem,
} from "./components/RichTextEditor";

// Re-exported so consumers type their extensions and `onEditorReady`
// without adding tiptap as a direct dependency.
export type { AnyExtension, Editor, JSONContent } from "@tiptap/core";
