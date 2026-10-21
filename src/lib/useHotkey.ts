import * as React from "react";

/**
 * Keyboard shortcut helpers. Combos are written as `+`-separated tokens,
 * case-insensitive: `"mod+k"`, `"shift+?"`, `"ctrl+alt+n"`, `"escape"`, `"/"`.
 *
 * - `mod` is ⌘ (Meta) on Apple platforms and Ctrl elsewhere.
 * - Letters and digits also match by physical key (`KeyK`, `Digit1`), so a
 *   shortcut keeps working when the user types on a Russian or Tajik layout
 *   (Ctrl+K on ЙЦУКЕН produces `key === "л"`).
 * - Named keys: `enter`, `escape`/`esc`, `space`, `tab`, `backspace`,
 *   `delete`, `up`/`down`/`left`/`right` (or `arrowup` …), `plus`, `f1`…`f12`.
 */

export interface ParsedHotkey {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

const KEY_ALIASES: Record<string, string> = {
  esc: "escape",
  return: "enter",
  space: " ",
  spacebar: " ",
  plus: "+",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  del: "delete",
};

/** True on macOS / iOS / iPadOS, where `mod` means ⌘. */
export function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent || "";
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/** Parse `"mod+shift+k"` into key + modifier flags for the current platform. */
export function parseHotkey(combo: string, mac = isApplePlatform()): ParsedHotkey {
  const tokens = combo
    .toLowerCase()
    .split("+")
    .map((t) => t.trim());
  // "mod++" → last token is empty: the key is "+" itself.
  if (tokens.length > 1 && tokens[tokens.length - 1] === "") {
    tokens.pop();
    if (tokens[tokens.length - 1] === "") tokens.pop();
    tokens.push("+");
  }
  const out: ParsedHotkey = { key: "", ctrl: false, meta: false, alt: false, shift: false };
  for (const token of tokens) {
    switch (token) {
      case "mod":
        if (mac) out.meta = true;
        else out.ctrl = true;
        break;
      case "ctrl":
      case "control":
        out.ctrl = true;
        break;
      case "meta":
      case "cmd":
      case "command":
        out.meta = true;
        break;
      case "alt":
      case "option":
        out.alt = true;
        break;
      case "shift":
        out.shift = true;
        break;
      default:
        out.key = KEY_ALIASES[token] ?? token;
    }
  }
  return out;
}

const isPunctuation = (key: string) => key.length === 1 && !/[a-z0-9 ]/.test(key);

function keyMatches(e: KeyboardEvent, key: string): boolean {
  const pressed = e.key?.toLowerCase();
  if (/^[a-z]$/.test(key)) {
    return pressed === key || e.code === `Key${key.toUpperCase()}`;
  }
  if (/^[0-9]$/.test(key)) {
    return pressed === key || e.code === `Digit${key}`;
  }
  return pressed === key;
}

/** Does this keyboard event match the combo? */
export function matchesHotkey(
  e: KeyboardEvent,
  combo: string | ParsedHotkey,
  mac = isApplePlatform(),
): boolean {
  const hk = typeof combo === "string" ? parseHotkey(combo, mac) : combo;
  if (!hk.key) return false;
  if (e.ctrlKey !== hk.ctrl || e.metaKey !== hk.meta || e.altKey !== hk.alt) return false;
  // "?" and "+" need Shift on most layouts: don't demand it be absent.
  if (hk.shift ? !e.shiftKey : e.shiftKey && !isPunctuation(hk.key)) return false;
  return keyMatches(e, hk.key);
}

const KEY_LABELS: Record<string, { mac: string; other: string }> = {
  enter: { mac: "↵", other: "Enter" },
  escape: { mac: "Esc", other: "Esc" },
  " ": { mac: "Space", other: "Space" },
  tab: { mac: "⇥", other: "Tab" },
  backspace: { mac: "⌫", other: "Backspace" },
  delete: { mac: "⌦", other: "Del" },
  arrowup: { mac: "↑", other: "↑" },
  arrowdown: { mac: "↓", other: "↓" },
  arrowleft: { mac: "←", other: "←" },
  arrowright: { mac: "→", other: "→" },
};

/** Human label for a combo: `"⌘K"` on Apple platforms, `"Ctrl+K"` elsewhere. */
export function formatHotkey(combo: string, mac = isApplePlatform()): string {
  const hk = parseHotkey(combo, mac);
  const key =
    KEY_LABELS[hk.key]?.[mac ? "mac" : "other"] ??
    (hk.key.length === 1 ? hk.key.toUpperCase() : hk.key.charAt(0).toUpperCase() + hk.key.slice(1));
  if (mac) {
    return `${hk.ctrl ? "⌃" : ""}${hk.alt ? "⌥" : ""}${hk.shift ? "⇧" : ""}${hk.meta ? "⌘" : ""}${key}`;
  }
  const parts: string[] = [];
  if (hk.ctrl) parts.push("Ctrl");
  if (hk.alt) parts.push("Alt");
  if (hk.shift) parts.push("Shift");
  if (hk.meta) parts.push("Win");
  parts.push(key);
  return parts.join("+");
}

/** The combo in `aria-keyshortcuts` syntax, e.g. `"Control+K"`. */
export function toAriaKeyshortcuts(combo: string, mac = isApplePlatform()): string {
  const hk = parseHotkey(combo, mac);
  const parts: string[] = [];
  if (hk.ctrl) parts.push("Control");
  if (hk.alt) parts.push("Alt");
  if (hk.shift) parts.push("Shift");
  if (hk.meta) parts.push("Meta");
  const key =
    hk.key === " "
      ? "Space"
      : hk.key === "+"
        ? "Plus"
        : hk.key.length === 1
          ? hk.key.toUpperCase()
          : hk.key.replace(/^arrow(\w)/, (_, c: string) => `Arrow${c.toUpperCase()}`).replace(/^\w/, (c) => c.toUpperCase());
  parts.push(key);
  return parts.join("+");
}

/** True when the event comes from a field where typing should not trigger shortcuts. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof (target as Element).tagName !== "string") return false;
  const el = target as HTMLElement;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    const type = ((el as HTMLInputElement).type || "text").toLowerCase();
    return !["checkbox", "radio", "button", "submit", "reset", "range", "color", "file", "image"].includes(type);
  }
  if (el.isContentEditable) return true;
  const ce = el.getAttribute?.("contenteditable");
  return ce === "" || ce === "true" || ce === "plaintext-only";
}

export interface UseHotkeyOptions {
  /** Listen only while true. Defaults to true. */
  enabled?: boolean;
  /** Also fire while focus is in an input, textarea, select or contenteditable. Defaults to false. */
  allowInInputs?: boolean;
  /** Call `preventDefault()` on a match (e.g. to stop the browser's own Ctrl+K). Defaults to true. */
  preventDefault?: boolean;
  /** Ignore auto-repeat while the key is held. Defaults to true. */
  ignoreRepeat?: boolean;
  /** Event to listen to. Defaults to "keydown". */
  event?: "keydown" | "keyup";
  /** Where to listen. Defaults to `window`. */
  target?: Window | Document | HTMLElement | null;
}

/**
 * Run `handler` when a keyboard shortcut is pressed.
 *
 *   useHotkey("mod+k", () => setOpen((o) => !o));
 *   useHotkey(["/", "shift+?"], openHelp);
 */
export function useHotkey(
  combo: string | string[],
  handler: (event: KeyboardEvent) => void,
  {
    enabled = true,
    allowInInputs = false,
    preventDefault = true,
    ignoreRepeat = true,
    event = "keydown",
    target,
  }: UseHotkeyOptions = {},
): void {
  const handlerRef = React.useRef(handler);
  React.useEffect(() => {
    handlerRef.current = handler;
  });

  const combos = Array.isArray(combo) ? combo : [combo];
  const comboKey = combos.join("|");

  React.useEffect(() => {
    if (!enabled) return;
    const node = target === undefined ? (typeof window !== "undefined" ? window : null) : target;
    if (!node) return;
    const mac = isApplePlatform();
    const parsed = comboKey.split("|").map((c) => parseHotkey(c, mac));

    const listener = (raw: Event) => {
      const e = raw as KeyboardEvent;
      if (ignoreRepeat && e.repeat) return;
      if (e.isComposing) return;
      if (!allowInInputs && isEditableTarget(e.composedPath?.()[0] ?? e.target)) return;
      if (!parsed.some((hk) => matchesHotkey(e, hk, mac))) return;
      if (preventDefault) e.preventDefault();
      handlerRef.current(e);
    };

    node.addEventListener(event, listener);
    return () => node.removeEventListener(event, listener);
  }, [comboKey, enabled, allowInInputs, preventDefault, ignoreRepeat, event, target]);
}
