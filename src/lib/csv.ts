/**
 * CSV export helpers. Pure (no React) so reports can build files anywhere.
 *
 * Defaults target Excel in Russian / Tajik locales: `;` as the delimiter
 * (Excel's list separator when the decimal separator is a comma), a UTF-8
 * byte-order mark so Cyrillic opens correctly, CRLF line endings and comma
 * decimals.
 */

export type CSVCell = string | number | null | undefined;

export interface CSVColumn<T> {
  /** Header cell text. */
  header: string;
  /** Cell value for a row. `null` / `undefined` become an empty cell. */
  value: (row: T, index: number) => CSVCell;
}

export interface CSVOptions {
  /** Field separator. Defaults to ";". */
  delimiter?: string;
  /** Prepend a UTF-8 byte-order mark (U+FEFF). Defaults to true. */
  bom?: boolean;
  /** Row separator. Defaults to "\r\n" (RFC 4180). */
  newline?: string;
  /**
   * Decimal separator for number cells. Defaults to "," when the delimiter
   * is ";" (ru/tg Excel) and "." otherwise.
   */
  decimalSeparator?: "," | ".";
  /** Include the header row. Defaults to true. */
  header?: boolean;
  /**
   * Neutralise spreadsheet formulas in text cells (CSV injection): text that
   * starts with `=`, `@`, a tab or CR, or with `+` / `-` followed by anything
   * other than a number or phone number, is prefixed with `'`. Defaults to
   * true. Number cells are never altered.
   */
  sanitizeFormulas?: boolean;
}

/** UTF-8 byte-order mark. */
export const CSV_BOM = "﻿";

const PLAIN_SIGNED = /^[+-][\d\s().,-]*$/;

function sanitize(text: string): string {
  const first = text.charAt(0);
  if (first === "=" || first === "@" || first === "\t" || first === "\r") {
    return `'${text}`;
  }
  if ((first === "+" || first === "-") && !PLAIN_SIGNED.test(text)) {
    return `'${text}`;
  }
  return text;
}

/** Quote a field when it contains the delimiter, a quote or a line break. */
export function escapeCSVField(text: string, delimiter = ";"): string {
  const needsQuotes =
    text.includes(delimiter) ||
    text.includes('"') ||
    text.includes("\n") ||
    text.includes("\r") ||
    text !== text.trim();
  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Serialise rows to CSV text.
 *
 *   toCSV(products, [
 *     { header: "Товар", value: (p) => p.name },
 *     { header: "Остаток", value: (p) => p.qty },
 *   ]);
 */
export function toCSV<T>(
  rows: readonly T[],
  columns: readonly CSVColumn<T>[],
  {
    delimiter = ";",
    bom = true,
    newline = "\r\n",
    decimalSeparator = delimiter === ";" ? "," : ".",
    header = true,
    sanitizeFormulas = true,
  }: CSVOptions = {},
): string {
  const cell = (value: CSVCell): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "number") {
      if (!Number.isFinite(value)) return "";
      const s = String(value);
      return escapeCSVField(
        decimalSeparator === "," ? s.replace(".", ",") : s,
        delimiter,
      );
    }
    const text = sanitizeFormulas ? sanitize(value) : value;
    return escapeCSVField(text, delimiter);
  };

  const lines: string[] = [];
  if (header) {
    lines.push(
      columns.map((c) => escapeCSVField(c.header, delimiter)).join(delimiter),
    );
  }
  rows.forEach((row, i) => {
    lines.push(columns.map((c) => cell(c.value(row, i))).join(delimiter));
  });
  return (bom ? CSV_BOM : "") + lines.join(newline);
}

/**
 * Save `content` as a file through a temporary object URL. No-op outside the
 * browser (SSR).
 */
export function downloadFile(
  content: string | Blob | ArrayBuffer | Uint8Array,
  filename: string,
  mime = "text/csv;charset=utf-8",
): void {
  if (typeof document === "undefined" || typeof URL === "undefined") return;
  const blob =
    content instanceof Blob
      ? content
      : new Blob([content as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
