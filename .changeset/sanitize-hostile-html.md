---
"tajerp_ui": patch
---

Security: `sanitizeHtml` (and so `RichTextContent`) is now an allowlist on DOMPurify, safe for HTML from outside such as inbound e-mail and messenger templates. It keeps what `RichTextEditor` writes; it removes SVG, MathML, forms and embeds, cuts inline styles down to text formatting and table sizes, keeps only the editor's own classes, and drops `id`/`name`. A new optional `{ isolated: true }` keeps classes, ids and styles for HTML shown in a sandboxed document of its own (an e-mail iframe). Without a DOM (server rendering) it returns the text only. `ChatBubble` links a file only for http(s), blob, relative or media/PDF `data:` URLs; any other `src` is shown without a link.
