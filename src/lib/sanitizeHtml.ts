import createDOMPurify, { type Config, type DOMPurify } from "dompurify";

export interface SanitizeHtmlOptions {
  /**
   * The result goes into a document of its own with no scripts (a sandboxed
   * iframe, as for an e-mail body), not into the page. `class`, `id` and
   * inline styles are then kept as written: they can only reach that
   * document. Never set it for HTML rendered next to the app's own markup.
   */
  isolated?: boolean;
}

// What a RichTextEditor writes (StarterKit, tables, task lists, images,
// mentions, text alignment) plus the plain formatting found in e-mail and
// Desk rich text. No SVG, MathML, forms, embeds or custom elements.
const TAGS = [
  "a", "abbr", "b", "blockquote", "br", "caption", "center", "cite", "code", "col", "colgroup",
  "dd", "del", "div", "dl", "dt", "em", "figcaption", "figure", "font", "h1", "h2", "h3", "h4",
  "h5", "h6", "hr", "i", "img", "input", "ins", "kbd", "label", "li", "mark", "ol", "p", "pre",
  "q", "s", "small", "span", "strike", "strong", "sub", "sup", "table", "tbody", "td", "tfoot",
  "th", "thead", "tr", "u", "ul",
];

const ATTRS = [
  "href", "target", "rel", "src", "alt", "title", "width", "height", "colspan", "rowspan",
  "colwidth", "span", "start", "reversed", "type", "checked", "disabled", "dir", "lang", "align",
  "valign", "border", "cellpadding", "cellspacing", "bgcolor", "color", "face", "size", "class",
  "style", "data-type", "data-id", "data-label", "data-checked", "data-mention-suggestion-char",
];

// DOMPurify's default plus `blob:` (private files are shown through object
// URLs), minus the schemes a message body has no use for.
const URI = /^(?:(?:https?|mailto|tel|sms|cid|blob):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;

/** Classes the editor itself writes; anything else could borrow the app's utility classes. */
const SAFE_CLASS = /^(?:tj-mention|language-[\w-]+)$/;

/** Inline styles that format text or size a table, none of which can move content over the page. */
const SAFE_STYLE_PROPS = new Set([
  "text-align",
  "color",
  "background-color",
  "font-weight",
  "font-style",
  "text-decoration",
  "text-decoration-line",
  "vertical-align",
  "width",
  "min-width",
  "max-width",
  "height",
]);
const SAFE_STYLE_VALUE = /^[a-z0-9 #%.,()-]+$/i;
const COLOR_FUNCTION = /\b(?:rgb|rgba|hsl|hsla)\([^()]*\)/gi;

function safeStyle(style: string): string {
  const kept: string[] = [];
  for (const declaration of style.split(";")) {
    const colon = declaration.indexOf(":");
    if (colon === -1) continue;
    const prop = declaration.slice(0, colon).trim().toLowerCase();
    const value = declaration.slice(colon + 1).trim();
    if (!SAFE_STYLE_PROPS.has(prop) || !SAFE_STYLE_VALUE.test(value)) continue;
    // Colour functions are the only ones allowed: no url(), var(), expression().
    if (value.replace(COLOR_FUNCTION, "").includes("(")) continue;
    kept.push(`${prop}: ${value}`);
  }
  return kept.join("; ");
}

function create(isolated: boolean): { purify: DOMPurify; config: Config } {
  const purify = createDOMPurify(window);
  purify.addHook("uponSanitizeAttribute", (_node, data) => {
    if (isolated) return;
    if (data.attrName === "style") {
      data.attrValue = safeStyle(data.attrValue);
      if (!data.attrValue) data.keepAttr = false;
    } else if (data.attrName === "class") {
      data.attrValue = data.attrValue.split(/\s+/).filter((c) => SAFE_CLASS.test(c)).join(" ");
      if (!data.attrValue) data.keepAttr = false;
    }
  });
  purify.addHook("afterSanitizeAttributes", (node) => {
    if (node.nodeName === "A" && node.hasAttribute("target")) {
      if (node.getAttribute("target") === "_blank") node.setAttribute("rel", "noopener noreferrer nofollow");
      else node.removeAttribute("target");
    }
    // Task-list checkboxes are the only form control the editor writes; any other input becomes one.
    if (node.nodeName === "INPUT") node.setAttribute("type", "checkbox");
  });
  return {
    purify,
    config: {
      ALLOWED_TAGS: TAGS,
      ALLOWED_ATTR: isolated ? [...ATTRS, "id"] : ATTRS,
      ALLOWED_URI_REGEXP: URI,
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: false,
    },
  };
}

const instances: { page?: ReturnType<typeof create>; isolated?: ReturnType<typeof create> } = {};

/** Without a DOM there is nothing to parse with, so no markup survives: the text only. */
function textOnly(html: string): string {
  let previous: string;
  let text = html;
  do {
    previous = text;
    text = text.replace(/<[^>]*>/g, "");
  } while (text !== previous);
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Make HTML safe to render: editor content, and HTML from outside (inbound
 * e-mail, messenger templates, imports). An allowlist on DOMPurify — tags
 * and attributes the editor writes plus plain formatting; scripts, event
 * handlers, SVG, MathML, forms, embeds and script URLs are removed, inline
 * styles and classes are cut down to harmless ones.
 *
 * On a server (no DOM) the markup is dropped and the text returned, so
 * render it on the client when the formatting matters.
 */
export function sanitizeHtml(html: string, options: SanitizeHtmlOptions = {}): string {
  if (!html) return "";
  if (typeof window === "undefined" || typeof window.document === "undefined") return textOnly(html);
  const key = options.isolated ? "isolated" : "page";
  const { purify, config } = (instances[key] ??= create(key === "isolated"));
  if (!purify.isSupported) return textOnly(html);
  return purify.sanitize(html, config);
}
