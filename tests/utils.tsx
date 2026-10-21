import { render, type RenderOptions } from "@testing-library/react";
import axe from "axe-core";
import * as React from "react";
import { expect } from "vitest";

import {
  TajUIProvider,
  type TajUIProviderProps,
} from "../src/components/TajUIProvider";

/** Render inside a TajUIProvider (locale defaults to "ru"). */
export function renderWithUI(
  ui: React.ReactElement,
  {
    provider,
    ...options
  }: RenderOptions & { provider?: Omit<TajUIProviderProps, "children"> } = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <TajUIProvider {...provider}>{children}</TajUIProvider>
    ),
    ...options,
  });
}

/**
 * Assert axe finds no WCAG A/AA violations. Colour contrast is skipped: jsdom
 * does not compute styles (contrast is checked in Storybook and the
 * Playwright story smoke test instead).
 */
export async function expectNoA11yViolations(node: Element = document.body) {
  const result = await axe.run(node, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
    rules: { "color-contrast": { enabled: false } },
  });
  const summary = result.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
  );
  expect(summary).toEqual([]);
}
