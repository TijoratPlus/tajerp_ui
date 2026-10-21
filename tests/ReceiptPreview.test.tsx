import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReceiptPreview, printReceipt } from "../src/components/ReceiptPreview";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const props = {
  store: { name: "Дӯкони Сомон", address: "Душанбе, пр. Рудаки 45", inn: "020012345", phone: "+992 900 00 00 00" },
  meta: { number: "000123", date: new Date(2026, 9, 21, 14, 5), cashier: "Фарида Р.", shift: "12" },
  lines: [
    { name: "Кофе латте", quantity: 2, price: 18 },
    { name: "Круассан", quantity: 1, price: 14, discount: 1.4 },
  ],
  totals: { tax: 5.69, taxRate: 12 },
  payments: [
    { label: "Наличные", amount: 50 },
  ],
  change: 1.4,
};

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.classList.remove("tj-printing-receipt");
});

describe("ReceiptPreview", () => {
  it("renders header, lines, totals, payments and footer", async () => {
    renderWithUI(<ReceiptPreview {...props} qr={<img src="qr.png" alt="QR-код чека" />} />);
    const receipt = screen.getByRole("article", { name: "Чек № 000123" });
    expect(receipt).toHaveAttribute("data-width", "80mm");
    expect(receipt.style.width).toBe("80mm");
    expect(receipt).toHaveTextContent("ИНН: 020012345");
    expect(receipt).toHaveTextContent("Фарида Р.");
    expect(receipt).toHaveTextContent(/2 × 18,00\s?с/);
    // subtotal 50, discount 1,40, total 48,60
    expect(screen.getByText("Подытог").nextElementSibling).toHaveTextContent("50,00");
    expect(screen.getByText("Скидка").nextElementSibling).toHaveTextContent("−1,40");
    expect(screen.getByText("в т. ч. НДС 12%")).toBeInTheDocument();
    expect(screen.getByText("ИТОГО").nextElementSibling).toHaveTextContent("48,60");
    expect(screen.getByText("Сдача").nextElementSibling).toHaveTextContent("1,40");
    expect(screen.getByText("Спасибо за покупку!")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "QR-код чека" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("stays black on white regardless of theme", () => {
    renderWithUI(<ReceiptPreview {...props} width="58mm" />);
    const receipt = screen.getByRole("article");
    expect(receipt.style.getPropertyValue("--tj-receipt-bg")).toBe("var(--tj-white)");
    expect(receipt.style.getPropertyValue("--tj-receipt-ink")).toBe("var(--tj-ink)");
    expect(receipt.style.width).toBe("58mm");
  });

  it("localizes labels to Tajik", () => {
    renderWithUI(<ReceiptPreview {...props} />, { provider: { locale: "tg" } });
    expect(screen.getByRole("article")).toHaveTextContent("РМА: 020012345");
    expect(screen.getByText("ҲАМАГӢ")).toBeInTheDocument();
    expect(screen.getByText("Ташаккур барои харид!")).toBeInTheDocument();
  });

  it("printReceipt marks the receipt and <html> until afterprint", () => {
    const print = vi.fn();
    vi.spyOn(window, "print").mockImplementation(print);
    renderWithUI(<ReceiptPreview {...props} />);
    const receipt = screen.getByRole("article");

    expect(printReceipt()).toBe(true);
    expect(print).toHaveBeenCalledOnce();
    expect(document.documentElement).toHaveClass("tj-printing-receipt");
    expect(receipt).toHaveAttribute("data-print-target");
    expect(document.getElementById("tj-receipt-print-style")?.textContent).toContain("@media print");

    window.dispatchEvent(new Event("afterprint"));
    expect(document.documentElement).not.toHaveClass("tj-printing-receipt");
    expect(receipt).not.toHaveAttribute("data-print-target");
  });

  it("printReceipt returns false without a receipt", () => {
    expect(printReceipt()).toBe(false);
  });
});
