import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { expect, test, type Page } from "@playwright/test";

const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve("axe-core/axe.min.js");

interface IndexEntry {
  id: string;
  title: string;
  name: string;
  type: "story" | "docs";
  tags?: string[];
}

const index = JSON.parse(readFileSync("storybook-static/index.json", "utf8")) as {
  entries: Record<string, IndexEntry>;
};
const stories = Object.values(index.entries).filter((e) => e.type === "story");

/** Stories split into chunks so workers run in parallel. */
const CHUNKS = 8;
const THEMES = ["light", "dark"] as const;

async function checkStory(page: Page, story: IndexEntry, theme: string) {
  const errors: string[] = [];
  const onError = (err: Error) => errors.push(err.message);
  page.on("pageerror", onError);
  await page.goto(`/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`);
  await page.waitForSelector("#storybook-root > *, .sb-show-errordisplay", {
    timeout: 15_000,
  });
  // Let enter animations finish before measuring contrast.
  await page.waitForTimeout(350);
  const shown = await page.locator(".sb-show-errordisplay").count();
  if (shown) errors.push(await page.locator("#error-message").innerText());

  await page.addScriptTag({ path: AXE_PATH });
  const violations = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: typeof import("axe-core") }).axe;
    // Inactive (disabled) UI is exempt from contrast requirements (WCAG
    // 1.4.3), so disabled controls and their labels are left out.
    const context = {
      include: [["body"]],
      exclude: [["[data-disabled]"], ['[aria-disabled="true"]'], ["[disabled]"]],
    };
    const result = await axe.run(context, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
    });
    return result.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
  });
  page.off("pageerror", onError);
  return { errors, violations };
}

for (let chunk = 0; chunk < CHUNKS; chunk++) {
  test(`stories chunk ${chunk + 1}/${CHUNKS}`, async ({ page }) => {
    const mine = stories.filter((_, i) => i % CHUNKS === chunk);
    const failures: string[] = [];
    for (const story of mine) {
      for (const theme of THEMES) {
        const { errors, violations } = await checkStory(page, story, theme);
        if (theme === "light") {
          await page.screenshot({
            path: `test-results/screens/${story.id}.png`,
            fullPage: true,
          });
        }
        for (const e of errors) failures.push(`[${theme}] ${story.id} — error: ${e}`);
        for (const v of violations) failures.push(`[${theme}] ${story.id} — axe ${v}`);
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
}
