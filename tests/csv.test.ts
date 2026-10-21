import { afterEach, describe, expect, it, vi } from "vitest";

import { CSV_BOM, downloadFile, escapeCSVField, toCSV } from "../src/lib/csv";

interface Row {
  name: string;
  qty: number | null;
  note?: string;
}

const columns = [
  { header: "Товар", value: (r: Row) => r.name },
  { header: "Остаток", value: (r: Row) => r.qty },
  { header: "Примечание", value: (r: Row) => r.note },
];

describe("toCSV", () => {
  it("starts with a UTF-8 BOM and uses ; and CRLF by default", () => {
    const csv = toCSV([{ name: "Чой сабз", qty: 12 }], columns);
    expect(csv.startsWith(CSV_BOM)).toBe(true);
    expect(csv.slice(1)).toBe("Товар;Остаток;Примечание\r\nЧой сабз;12;");
  });

  it("omits the BOM when asked", () => {
    expect(toCSV([], columns, { bom: false })).toBe("Товар;Остаток;Примечание");
  });

  it("escapes quotes, delimiters and newlines", () => {
    const csv = toCSV(
      [{ name: 'Нон "Тандир"', qty: null, note: "строка 1\nстрока 2; ещё" }],
      columns,
      { bom: false },
    );
    expect(csv.split("\r\n")[1]).toBe(
      '"Нон ""Тандир""";;"строка 1\nстрока 2; ещё"',
    );
  });

  it("writes comma decimals for ; and dot decimals for ,", () => {
    const rows = [{ name: "Шакар", qty: 1234.5 }];
    expect(toCSV(rows, columns, { bom: false }).split("\r\n")[1]).toBe(
      "Шакар;1234,5;",
    );
    expect(
      toCSV(rows, columns, { bom: false, delimiter: "," }).split("\r\n")[1],
    ).toBe("Шакар,1234.5,");
  });

  it("neutralises formulas but keeps phone numbers and negatives", () => {
    const csv = toCSV(
      [
        { name: "=HYPERLINK(1)", qty: -5, note: "+992 93 123 45 67" },
        { name: "-2+3", qty: 0, note: "@SUM(A1)" },
      ],
      columns,
      { bom: false },
    );
    const [, a, b] = csv.split("\r\n");
    expect(a).toBe("'=HYPERLINK(1);-5;+992 93 123 45 67");
    expect(b).toBe("'-2+3;0;'@SUM(A1)");
  });

  it("escapeCSVField quotes surrounding whitespace", () => {
    expect(escapeCSVField(" a")).toBe('" a"');
    expect(escapeCSVField("a")).toBe("a");
  });
});

describe("downloadFile", () => {
  afterEach(() => vi.restoreAllMocks());

  it("clicks a temporary link with the file name", () => {
    const create = vi.fn(() => "blob:x");
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    downloadFile("a;b", "отчёт.csv");
    expect(create).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    const anchor = click.mock.instances[0] as unknown as HTMLAnchorElement;
    expect(anchor.download).toBe("отчёт.csv");
    expect(document.querySelector("a[download]")).toBeNull();
  });
});
