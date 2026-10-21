import { describe, expect, it } from "vitest";

import {
  addDays,
  addMonths,
  endOfMonth,
  formatDateInput,
  getMonthGrid,
  isAfter,
  isBefore,
  isSameDay,
  isWithin,
  normalizeRange,
  parseDateInput,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  toISODate,
} from "../src/lib/date";

const d = (y: number, m: number, day: number, h = 0) => new Date(y, m - 1, day, h);

describe("date utils", () => {
  it("startOfDay / isSameDay / isBefore / isAfter work at day precision", () => {
    expect(startOfDay(d(2026, 10, 21, 15)).getHours()).toBe(0);
    expect(isSameDay(d(2026, 10, 21, 1), d(2026, 10, 21, 23))).toBe(true);
    expect(isSameDay(d(2026, 10, 21), undefined)).toBe(false);
    expect(isBefore(d(2026, 10, 21, 23), d(2026, 10, 21, 1))).toBe(false);
    expect(isBefore(d(2026, 10, 20, 23), d(2026, 10, 21, 1))).toBe(true);
    expect(isAfter(d(2026, 10, 22), d(2026, 10, 21, 23))).toBe(true);
  });

  it("adds days and months, clamping month ends", () => {
    expect(toISODate(addDays(d(2026, 10, 31), 1))).toBe("2026-11-01");
    expect(toISODate(addDays(d(2026, 3, 1), -1))).toBe("2026-02-28");
    expect(toISODate(addMonths(d(2026, 1, 31), 1))).toBe("2026-02-28");
    expect(toISODate(addMonths(d(2024, 1, 31), 1))).toBe("2024-02-29");
    expect(toISODate(addMonths(d(2026, 1, 15), -1))).toBe("2025-12-15");
  });

  it("finds month, quarter and week boundaries (Monday first)", () => {
    expect(toISODate(startOfMonth(d(2026, 10, 21)))).toBe("2026-10-01");
    expect(toISODate(endOfMonth(d(2026, 2, 10)))).toBe("2026-02-28");
    expect(toISODate(startOfQuarter(d(2026, 10, 21)))).toBe("2026-10-01");
    expect(toISODate(startOfQuarter(d(2026, 8, 3)))).toBe("2026-07-01");
    // 21.10.2026 is a Wednesday; 25.10.2026 a Sunday.
    expect(toISODate(startOfWeek(d(2026, 10, 21)))).toBe("2026-10-19");
    expect(toISODate(startOfWeek(d(2026, 10, 25)))).toBe("2026-10-19");
    expect(toISODate(startOfWeek(d(2026, 10, 19)))).toBe("2026-10-19");
  });

  it("checks ranges inclusively and normalises reversed ones", () => {
    const range = { from: d(2026, 10, 1), to: d(2026, 10, 21) };
    expect(isWithin(d(2026, 10, 1, 12), range)).toBe(true);
    expect(isWithin(d(2026, 10, 21, 23), range)).toBe(true);
    expect(isWithin(d(2026, 10, 22), range)).toBe(false);
    expect(isWithin(d(2026, 10, 5), { from: range.to, to: range.from })).toBe(true);
    expect(isWithin(d(2026, 10, 5), { from: d(2026, 10, 5) })).toBe(true);
    expect(isWithin(d(2026, 10, 5), {})).toBe(false);
    expect(normalizeRange({ from: d(2026, 10, 9), to: d(2026, 10, 2) })).toEqual({
      from: d(2026, 10, 2),
      to: d(2026, 10, 9),
    });
  });

  it("builds a 6×7 Monday-first month grid", () => {
    const grid = getMonthGrid(2026, 9); // October 2026
    expect(grid).toHaveLength(6);
    for (const week of grid) expect(week).toHaveLength(7);
    expect(toISODate(grid[0][0])).toBe("2026-09-28");
    expect(grid[0][0].getDay()).toBe(1);
    expect(toISODate(grid[0][3])).toBe("2026-10-01");
    expect(toISODate(grid[5][6])).toBe("2026-11-08");
    // A month starting on Monday begins in the first cell.
    expect(toISODate(getMonthGrid(2026, 5)[0][0])).toBe("2026-06-01");
  });

  it("formats dd.mm.yyyy and local ISO dates", () => {
    expect(formatDateInput(d(2026, 1, 5))).toBe("05.01.2026");
    expect(toISODate(d(2026, 10, 21, 23))).toBe("2026-10-21");
  });

  it("parses typed dates in several formats", () => {
    for (const input of [
      "21.10.2026",
      "21/10/2026",
      "21-10-2026",
      "21,10,2026",
      " 21.10.26 ",
      "21102026",
      "2026-10-21",
    ]) {
      expect(toISODate(parseDateInput(input) as Date)).toBe("2026-10-21");
    }
    expect(toISODate(parseDateInput("1.2.2026") as Date)).toBe("2026-02-01");
  });

  it("rejects invalid input", () => {
    for (const input of ["", "abc", "31.02.2026", "29.02.2026", "00.10.2026", "21.13.2026", "21.10", "2026-13-01"]) {
      expect(parseDateInput(input)).toBeNull();
    }
    expect(parseDateInput("29.02.2024")).not.toBeNull();
  });

  it("round-trips format → parse", () => {
    const date = d(2026, 12, 31);
    expect(isSameDay(parseDateInput(formatDateInput(date)) as Date, date)).toBe(true);
  });
});
