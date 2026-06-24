/* ============================================================
   scope-css.mjs — confine generated Tailwind utilities to a root class.

   The compiled stylesheet (dist/tajerp-ui.css) is loaded inside the Frappe
   desk, whose legacy Bootstrap-era CSS defines bare class names (.table,
   .border, .flex, .block, .hidden, .container, …) that overlap with Tailwind
   utility names. To prevent collisions, every selector inside the
   `@layer utilities { … }` block is prefixed with `.tj-react-root ` so the
   utilities only apply inside a React page root.

   Theme variables (`@layer theme`), the brand `:root`/[data-theme] tokens,
   keyframes, @property and @font-face stay untouched (they are global and
   harmless / required). The scoped preflight replacement already lives under
   `.tj-react-root` in compiled.entry.css.
   ============================================================ */
import { readFileSync, writeFileSync } from "node:fs";

const SCOPE = ".tj-react-root";
const file = process.argv[2];
if (!file) {
  console.error("usage: node scope-css.mjs <file.css>");
  process.exit(1);
}

let css = readFileSync(file, "utf8");

const marker = "@layer utilities";
const start = css.indexOf(marker);
if (start === -1) {
  console.error("scope-css: no '@layer utilities' block found — leaving file as-is");
  process.exit(0);
}
const open = css.indexOf("{", start);
const end = matchBrace(css, open);
if (end === -1) {
  console.error("scope-css: unbalanced braces after '@layer utilities'");
  process.exit(1);
}

const scoped = scopeRules(css.slice(open + 1, end));
css = css.slice(0, open + 1) + scoped + css.slice(end);
writeFileSync(file, css);
console.log(`scope-css: scoped utilities under '${SCOPE}' in ${file}`);

/** Index of the '}' matching the '{' at position `open`. */
function matchBrace(s, open) {
  let depth = 0;
  let str = null;
  for (let i = open; i < s.length; i++) {
    const c = s[i];
    if (str) {
      if (c === str && s[i - 1] !== "\\") str = null;
      continue;
    }
    if (c === '"' || c === "'") str = c;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Split `s` on top-level occurrences of `sep`, respecting (), [], and strings. */
function splitTopLevel(s, sep) {
  const parts = [];
  let depth = 0;
  let str = null;
  let buf = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (str) {
      buf += c;
      if (c === str && s[i - 1] !== "\\") str = null;
      continue;
    }
    if (c === '"' || c === "'") {
      str = c;
      buf += c;
      continue;
    }
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    if (c === sep && depth === 0) {
      parts.push(buf);
      buf = "";
    } else {
      buf += c;
    }
  }
  parts.push(buf);
  return parts;
}

/** Walk the rules in a block body; prefix style-rule selectors with SCOPE. */
function scopeRules(block) {
  let out = "";
  let i = 0;
  const n = block.length;
  while (i < n) {
    // Read a prelude up to '{' (block rule) or ';' (statement at-rule).
    let j = i;
    let str = null;
    let kind = null;
    for (; j < n; j++) {
      const c = block[j];
      if (str) {
        if (c === str && block[j - 1] !== "\\") str = null;
        continue;
      }
      if (c === '"' || c === "'") str = c;
      else if (c === "{") {
        kind = "block";
        break;
      } else if (c === ";") {
        kind = "statement";
        break;
      }
    }
    if (kind === null) {
      out += block.slice(i); // trailing whitespace
      break;
    }
    const prelude = block.slice(i, j);
    if (kind === "statement") {
      out += prelude + ";";
      i = j + 1;
      continue;
    }
    const close = matchBrace(block, j);
    const body = block.slice(j + 1, close);
    const trimmed = prelude.trim();
    if (trimmed.startsWith("@")) {
      const at = trimmed.slice(1).split(/[\s({]/)[0].toLowerCase();
      if (at === "media" || at === "supports" || at === "container" || at === "layer") {
        out += prelude + "{" + scopeRules(body) + "}"; // recurse into grouping at-rules
      } else {
        out += prelude + "{" + body + "}"; // keyframes / font-face / property: leave alone
      }
    } else {
      const sel = splitTopLevel(prelude, ",")
        .map((s) => (s.trim() ? ` ${SCOPE} ${s.trim()}` : s))
        .join(",");
      out += sel + "{" + body + "}";
    }
    i = close + 1;
  }
  return out;
}
