import { describe, expect, it, vi } from "vitest";

import { sanitizeHtml } from "../src/editor";

const parse = (html: string) => {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
};

/** No element left that can run script, fetch on load, or navigate somewhere hostile. */
function expectInert(html: string) {
  const root = parse(html);
  for (const el of Array.from(root.querySelectorAll("*"))) {
    for (const attr of Array.from(el.attributes)) {
      expect(attr.name.startsWith("on"), `${el.tagName} ${attr.name}`).toBe(false);
      expect(/^\s*(?:javascript|vbscript|data:text\/html)/i.test(attr.value), `${el.tagName} ${attr.name}=${attr.value}`).toBe(false);
    }
  }
  expect(root.querySelector("script, style, iframe, object, embed, svg, math, form, base, meta, link, template, animate, set")).toBeNull();
}

describe("sanitizeHtml with hostile input", () => {
  const payloads: [string, string][] = [
    ["script", "<p>hi</p><script>alert(1)</script>"],
    ["event handler", '<img src="x" onerror="alert(1)">'],
    ["javascript: link", '<a href="javascript:alert(1)">x</a>'],
    ["obfuscated scheme", '<a href=" java&#x09;script:alert(1)">x</a>'],
    ["vbscript", '<a href="vbscript:msgbox(1)">x</a>'],
    ["data:text/html", '<a href="data:text/html,<script>alert(1)</script>">x</a>'],
    ["svg animate values", '<svg><a><animate attributeName="href" values="javascript:alert(1)"/><text y="20">x</text></a></svg>'],
    ["svg set to", '<svg><set attributeName="onmouseover" to="alert(1)"/></svg>'],
    ["svg onload", "<svg onload=alert(1)>"],
    ["mathml href", '<math><mtext><a href="javascript:alert(1)">x</a></mtext></math>'],
    ["mathml mglyph namespace confusion", "<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>"],
    ["iframe srcdoc", '<iframe srcdoc="<script>alert(1)</script>"></iframe>'],
    ["form action", '<form action="https://evil.example"><button formaction="javascript:alert(1)">x</button></form>'],
    ["meta refresh", '<meta http-equiv="refresh" content="0;url=https://evil.example">'],
    ["base href", '<base href="https://evil.example/">'],
    ["noscript parser differential", '<noscript><p title="</noscript><img src=x onerror=alert(1)>">'],
    ["template", "<template><img src=x onerror=alert(1)></template>"],
    ["object", '<object data="javascript:alert(1)"></object>'],
  ];
  for (const [name, html] of payloads) {
    it(`neutralises ${name}`, () => {
      const out = sanitizeHtml(html);
      expectInert(out);
      expect(out).not.toMatch(/alert\(1\)["']?\s*[>/]?\s*<\/?(?:script|svg)/i);
    });
  }

  it("removes inline styles that can cover the page and classes that borrow the app's", () => {
    const out = parse(
      sanitizeHtml(
        '<div style="position:fixed;inset:0;z-index:9999;background:url(https://evil.example/x)" class="fixed inset-0 bg-brand-solid">Login again</div>',
      ),
    ).firstElementChild!;
    expect(out.getAttribute("style")).toBeNull();
    expect(out.getAttribute("class")).toBeNull();
    expect(out.textContent).toBe("Login again");
  });

  it("drops ids and names that could clobber globals", () => {
    const out = parse(sanitizeHtml('<img id="config" name="cookie" src="/a.png"><a id="location" href="/x">x</a>'));
    expect(out.querySelector("[id], [name]")).toBeNull();
  });

  it("turns any input into a checkbox", () => {
    const input = parse(sanitizeHtml('<input type="password" placeholder="Password">')).querySelector("input");
    expect(input?.getAttribute("type")).toBe("checkbox");
    expect(input?.hasAttribute("placeholder")).toBe(false);
  });
});

describe("sanitizeHtml keeps what the editor writes", () => {
  it("keeps headings, marks, lists, quotes and code", () => {
    const html =
      '<h2>Итоги</h2><p><strong>b</strong> <em>i</em> <u>u</u> <s>s</s> <code>c</code></p><ul><li><p>a</p></li></ul><ol start="3"><li><p>b</p></li></ol><blockquote><p>q</p></blockquote><pre><code class="language-js">x()</code></pre><hr>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it("keeps text alignment, task lists, tables, images and mentions", () => {
    const html = [
      '<p style="text-align: center">mid</p>',
      '<ul data-type="taskList"><li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>done</p></div></li></ul>',
      '<table style="min-width: 50px"><colgroup><col style="min-width: 25px"><col style="min-width: 25px"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>h</p></th><td colspan="1" rowspan="1" colwidth="120"><p>c</p></td></tr></tbody></table>',
      '<img src="https://shop.example/files/a.png" alt="a.png">',
      '<img src="data:image/png;base64,iVBORw0KGgo=" alt="pasted">',
      '<p><span class="tj-mention" data-type="mention" data-id="u@x" data-label="Ali" data-mention-suggestion-char="@">@Ali</span></p>',
    ].join("");
    expect(sanitizeHtml(html)).toBe(html);
  });

  it("keeps links and makes a new-tab link safe", () => {
    expect(sanitizeHtml('<p><a href="https://tijorat.plus" target="_blank">сайт</a></p>')).toBe(
      '<p><a href="https://tijorat.plus" target="_blank" rel="noopener noreferrer nofollow">сайт</a></p>',
    );
    expect(sanitizeHtml('<a href="mailto:a@b.tj">m</a><a href="tel:+992">t</a><a href="/files/x.pdf">f</a>')).toBe(
      '<a href="mailto:a@b.tj">m</a><a href="tel:+992">t</a><a href="/files/x.pdf">f</a>',
    );
    expect(sanitizeHtml('<a href="https://x.example" target="opener">x</a>')).toBe('<a href="https://x.example">x</a>');
  });

  it("keeps colour and weight from e-mail, without anything that loads", () => {
    expect(sanitizeHtml('<span style="color: rgb(200, 0, 0); font-weight: bold; background-image: url(https://t.example/p.gif)">red</span>')).toBe(
      '<span style="color: rgb(200, 0, 0); font-weight: bold">red</span>',
    );
  });
});

describe("sanitizeHtml for an isolated document", () => {
  it("keeps the e-mail's classes, ids and styles but still removes script", () => {
    const html = '<div class="gmail_quote" id="appendonsend" style="position: relative; margin: 0">q</div><img src=x onerror=alert(1)>';
    const out = sanitizeHtml(html, { isolated: true });
    const root = parse(out);
    expect(root.querySelector("div.gmail_quote#appendonsend")?.getAttribute("style")).toBe("position: relative; margin: 0");
    expectInert(out);
  });
});

describe("sanitizeHtml without a DOM (server rendering)", () => {
  it("returns the text only, never markup", () => {
    vi.stubGlobal("window", undefined);
    try {
      expect(sanitizeHtml('<p>Салом <b>дӯст</b></p><img src=x onerror=alert(1)><scr<script>ipt>alert(1)</script>')).toBe(
        "Салом дӯстipt&gt;alert(1)",
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
