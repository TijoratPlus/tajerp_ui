import { describe, expect, it } from "vitest";

import {
  decimalSeparator,
  formatMoney,
  formatNumber,
  parseNumber,
  roundTo,
} from "../src/i18n/format";

const plain = (s: string) => s.replace(/[\u00a0\u202f]/g, " ");

describe("formatMoney", () => {
  it("prints somoni after the amount in ru/tg", () => {
    expect(plain(formatMoney(1234.5))).toBe("1 234,50 с");
    expect(plain(formatMoney(1234.5, { locale: "tg" }))).toBe("1 234,50 с");
  });
  it("uses TJS in English", () => {
    expect(plain(formatMoney(1234.5, { locale: "en" }))).toBe("1,234.50 TJS");
  });
  it("can hide the symbol and format other currencies", () => {
    expect(plain(formatMoney(10, { hideSymbol: true }))).toBe("10,00");
    expect(formatMoney(10, { locale: "en", currency: "USD" })).toBe("$10.00");
  });
  it("returns a dash for non-finite input", () => {
    expect(formatMoney(Number.NaN)).toBe("—");
  });
});

describe("formatNumber / decimalSeparator", () => {
  it("groups thousands per locale", () => {
    expect(plain(formatNumber(1234567))).toBe("1 234 567");
    expect(formatNumber(1234567, { locale: "en" })).toBe("1,234,567");
  });
  it("knows the decimal separator", () => {
    expect(decimalSeparator("ru")).toBe(",");
    expect(decimalSeparator("en")).toBe(".");
  });
});

describe("parseNumber", () => {
  it.each([
    ["12,5", 12.5],
    ["12.5", 12.5],
    ["1 234,50", 1234.5],
    ["1\u00a0234,50", 1234.5],
    ["1,234.50", 1234.5],
    ["-7", -7],
    ["−7", -7],
  ])("parses %s", (input, expected) => {
    expect(parseNumber(input)).toBe(expected);
  });
  it.each(["", "abc", "-", ",", "1,2,x"])("rejects %s", (input) => {
    expect(parseNumber(input)).toBeNaN();
  });
});

describe("roundTo", () => {
  it("removes floating point noise", () => {
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
  });
});
