import { readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Token checks that need no browser: WCAG contrast of the text inks against
 * the surfaces they sit on (light and dark), the UI type scale and the
 * density presets. Values are read straight from styles/tokens.css.
 */
// Vitest runs from the package root.
const css = readFileSync(
  resolvePath(process.cwd(), "styles/tokens.css"),
  "utf8",
);

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no block ${selector}`);
  const body = css.slice(
    css.indexOf("{", start) + 1,
    css.indexOf("\n}", start),
  );
  const out: Record<string, string> = {};
  for (const m of body
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    out[m[1]] = m[2].trim();
  }
  return out;
}

const root = block(":root");
const dark = { ...root, ...block('[data-theme="dark"],\n.dark') };
const compact = block('[data-density="compact"]');

function resolve(scope: Record<string, string>, name: string): string {
  let value = scope[name];
  if (value === undefined) throw new Error(`--${name} is not defined`);
  for (let i = 0; i < 10 && value.includes("var("); i++) {
    value = value.replace(
      /var\(--([\w-]+)\)/g,
      (_, n: string) => scope[n] ?? "",
    );
  }
  return value;
}

function rgb(value: string): [number, number, number] {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex)
    return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)) as [
      number,
      number,
      number,
    ];
  const fn = value.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (fn) return [Number(fn[1]), Number(fn[2]), Number(fn[3])];
  throw new Error(`not an opaque colour: ${value}`);
}

function luminance([r, g, b]: [number, number, number]) {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(scope: Record<string, string>, fg: string, bg: string) {
  const a = luminance(rgb(resolve(scope, fg)));
  const b = luminance(rgb(resolve(scope, bg)));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const THEMES = { light: root, dark } as const;
const MAIN = ["ui-bg", "ui-surface", "ui-surface-2"];

describe("token contrast (WCAG 2.2)", () => {
  for (const [theme, scope] of Object.entries(THEMES)) {
    describe(theme, () => {
      it.each(MAIN)("ink-1 and ink-2 reach 7:1 on --%s", (bg) => {
        expect(contrast(scope, "ui-ink-1", bg)).toBeGreaterThanOrEqual(7);
        expect(contrast(scope, "ui-ink-2", bg)).toBeGreaterThanOrEqual(7);
      });

      it.each(MAIN)("ink-3 (meta text) reaches 6:1 on --%s", (bg) => {
        expect(contrast(scope, "ui-ink-3", bg)).toBeGreaterThanOrEqual(6);
      });

      it("ink-3 stays AA (4.5:1) on the tinted inset surface", () => {
        expect(
          contrast(scope, "ui-ink-3", "ui-surface-inset"),
        ).toBeGreaterThanOrEqual(4.5);
      });

      it.each([...MAIN, "ui-surface-inset"])(
        "ink-4 (placeholders) reaches 3:1 on --%s",
        (bg) => {
          expect(contrast(scope, "ui-ink-4", bg)).toBeGreaterThanOrEqual(3);
        },
      );

      it("ink-4 stays visibly lighter than ink-3", () => {
        expect(contrast(scope, "ui-ink-3", "ui-surface")).toBeGreaterThan(
          contrast(scope, "ui-ink-4", "ui-surface") + 1.5,
        );
      });

      it.each([
        "ui-success-ink",
        "ui-warning-ink",
        "ui-error-ink",
        "ui-info-ink",
      ])("--%s reaches 4.5:1 on the surface", (ink) => {
        expect(contrast(scope, ink, "ui-surface")).toBeGreaterThanOrEqual(4.5);
      });
    });
  }

  it("light ink-3 reaches 6:1 on every light surface, including mist and warm", () => {
    for (const bg of ["ui-surface-inset", "ui-mist", "ui-surface-warm"]) {
      expect(contrast(root, "ui-ink-3", bg), bg).toBeGreaterThanOrEqual(6);
    }
  });
});

describe("type scale and density", () => {
  it("uses the 0.5 UI type scale", () => {
    const sizes = Object.fromEntries(
      [
        "micro",
        "caption",
        "helper",
        "label",
        "body",
        "control",
        "title",
        "heading",
        "display",
      ].map((k) => [k, root[`tj-fs-ui-${k}`]]),
    );
    expect(sizes).toEqual({
      micro: "11px",
      caption: "12.5px",
      helper: "13px",
      label: "14px",
      body: "15px",
      control: "15px",
      title: "17px",
      heading: "20px",
      display: "24px",
    });
    expect(root["tj-lh-body"]).toBe("1.5");
  });

  it("defaults to comfortable controls; compact is 30/34/38", () => {
    expect([
      root["tj-control-sm"],
      root["tj-control-md"],
      root["tj-control-lg"],
    ]).toEqual(["32px", "36px", "40px"]);
    expect([
      compact["tj-control-sm"],
      compact["tj-control-md"],
      compact["tj-control-lg"],
    ]).toEqual(["30px", "34px", "38px"]);
  });

  it("keeps cards flat", () => {
    expect(root["ui-card-shadow"]).toBe("none");
    expect(dark["ui-card-shadow"]).toBe("none");
  });

  it("defines the strong hairline and the light rail in both themes", () => {
    expect(root["ui-hairline-strong"]).toBeTruthy();
    expect(dark["ui-hairline-strong"]).toBeTruthy();
    const rail = block('[data-rail="light"]');
    expect(Object.keys(rail).sort()).toEqual(
      [
        "ui-rail-active",
        "ui-rail-active-ink",
        "ui-rail-bg",
        "ui-rail-border",
        "ui-rail-hover",
        "ui-rail-ink",
        "ui-rail-ink-muted",
      ].sort(),
    );
    // The light rail's text is the theme's ink, so it is readable on its surface.
    const light = { ...root, ...rail };
    const darkRail = { ...dark, ...rail };
    expect(
      contrast(light, "ui-rail-ink-muted", "ui-rail-bg"),
    ).toBeGreaterThanOrEqual(7);
    expect(
      contrast(darkRail, "ui-rail-ink-muted", "ui-rail-bg"),
    ).toBeGreaterThanOrEqual(7);
  });
});
