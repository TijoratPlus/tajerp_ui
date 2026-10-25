---
"tajerp_ui": patch
---

Meet WCAG 2.5.8 target size in two new components:

- **EventCalendar:** month-view event chips are now at least 24px tall.
- **RichTextEditor:** task-list checkboxes are now 24px targets. The visible box is still 14px; a transparent border supplies the rest of the hit area. The editor itself is focusable, so spacing alone could not satisfy the rule.
