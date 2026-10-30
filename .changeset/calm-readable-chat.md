---
"tajerp_ui": minor
---

Readability and calm surfaces for every consumer, plus conversation components.

**Tokens (visual change for all apps — see INTEGRATION.md "Upgrading to 0.5.0"):**

- UI type scale: `micro` 11, `caption` 12.5, `helper` 13, `label` 14, `body` 15, `control` 15, `title` 17, and new `text-ui-heading` (20) and `text-ui-display` (24). Body line height 1.5.
- Contrast: `ink-3` reaches 6:1+ on the background and surfaces (light and dark); `ink-4` reaches 3:1+ and is used for placeholders. Slightly stronger `--ui-hairline`, new `--ui-hairline-strong` (`border-hairline-strong`) for form fields.
- Flat cards (`--ui-card-shadow: none`).
- Density: `comfortable` stays the default; `compact` is now 30/34/38px (was 28/32/36).
- Light rail tokens under `[data-rail="light"]`, and `--ui-rail-active` / `--ui-rail-active-ink`.

**Components:**

- `Button`: semibold; only `solid` is bold.
- `Tabs`: taller triggers; new `overflow="menu"` collapses tabs that do not fit into a «Ещё» menu (the active tab stays visible); `labels` prop.
- `Sidebar`: new `tone="dark" | "light"` (default `dark`).
- `ChatBubble`: `instagram` and `messenger` channels, `delivered` and `received` statuses, `media` (image, video, audio, file), `grouped` positions, `tone="neutral"`, default max width `min(75%, 640px)`.
- New `ChatThread`: day separators, author grouping, stick-to-bottom with a "new messages" pill, `onLoadOlder` / `hasOlder`.
- New `ChatComposer`: auto-growing field (8 rows), Enter sends / Shift+Enter new line, IME-safe, `leading` / `trailing` slots, `disabledReason`.
- New `ConversationListItem`: inbox row with channel badge, time, preview and unread counter.
