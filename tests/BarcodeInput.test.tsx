import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BarcodeInput } from "../src/components/BarcodeInput";
import { useBarcodeScanner, type UseBarcodeScannerOptions } from "../src/lib/useBarcodeScanner";
import { expectNoA11yViolations, renderWithUI } from "./utils";

function Scanner(props: UseBarcodeScannerOptions) {
  useBarcodeScanner(props);
  return <input aria-label="Поиск" />;
}

/** Type `text` key by key, `gap` ms apart, then the end key. */
function typeBurst(target: Element | Document | Window, text: string, gap: number, end = "Enter") {
  for (const ch of text) {
    fireEvent.keyDown(target, { key: ch });
    vi.advanceTimersByTime(gap);
  }
  return fireEvent.keyDown(target, { key: end });
}

describe("useBarcodeScanner", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("detects a fast burst ending with Enter", () => {
    vi.useFakeTimers();
    const onScan = vi.fn();
    render(<Scanner onScan={onScan} />);
    typeBurst(window, "4600000000000", 5);
    expect(onScan).toHaveBeenCalledWith("4600000000000");
  });

  it("ignores slow typing", () => {
    vi.useFakeTimers();
    const onScan = vi.fn();
    render(<Scanner onScan={onScan} />);
    typeBurst(screen.getByLabelText("Поиск"), "460000", 120);
    expect(onScan).not.toHaveBeenCalled();
  });

  it("only keeps the fast tail after a pause and honours minLength", () => {
    vi.useFakeTimers();
    const onScan = vi.fn();
    render(<Scanner onScan={onScan} minLength={6} />);
    fireEvent.keyDown(window, { key: "x" });
    vi.advanceTimersByTime(500);
    typeBurst(window, "12345", 5);
    expect(onScan).not.toHaveBeenCalled();
    typeBurst(window, "123456", 5, "Tab");
    expect(onScan).toHaveBeenCalledWith("123456");
  });

  it("prevents the end key's default when asked, and can be disabled", () => {
    vi.useFakeTimers();
    const onScan = vi.fn();
    const { rerender } = render(<Scanner onScan={onScan} preventDefault />);
    const notCancelled = typeBurst(window, "987654", 3);
    expect(notCancelled).toBe(false);
    rerender(<Scanner onScan={onScan} enabled={false} />);
    typeBurst(window, "111111", 3);
    expect(onScan).toHaveBeenCalledTimes(1);
  });

  it("listens on an element ref target", () => {
    vi.useFakeTimers();
    const onScan = vi.fn();
    function Region() {
      const ref = React.useRef<HTMLDivElement>(null);
      useBarcodeScanner({ onScan, target: ref });
      return (
        <div ref={ref} data-testid="region">
          <button type="button">btn</button>
        </div>
      );
    }
    render(<Region />);
    typeBurst(window, "22223333", 3);
    expect(onScan).not.toHaveBeenCalled();
    typeBurst(screen.getByRole("button"), "22223333", 3);
    expect(onScan).toHaveBeenCalledWith("22223333");
  });
});

describe("BarcodeInput", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("submits on Enter, clears itself, announces and is accessible", async () => {
    const onScan = vi.fn();
    renderWithUI(<BarcodeInput onScan={onScan} />);
    const input = screen.getByRole("textbox", { name: "Штрихкод" });
    await userEvent.type(input, " 4600000000000 {Enter}");
    expect(onScan).toHaveBeenCalledWith("4600000000000");
    expect(input).toHaveValue("");
    expect(screen.getByRole("status")).toHaveTextContent("Отсканировано: 4600000000000");
    await expectNoA11yViolations();
  });

  it("hides the status after statusDuration and ignores short codes", () => {
    vi.useFakeTimers();
    const onScan = vi.fn();
    renderWithUI(<BarcodeInput onScan={onScan} minLength={4} statusDuration={1000} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "12" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onScan).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "123456" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onScan).toHaveBeenCalledWith("123456");
    expect(screen.getByRole("status")).toHaveTextContent("123456");
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("is controlled and keeps the value with clearOnScan={false}", async () => {
    function Controlled() {
      const [v, setV] = React.useState("");
      return <BarcodeInput aria-label="Код" value={v} onValueChange={setV} clearOnScan={false} />;
    }
    renderWithUI(<Controlled />);
    const input = screen.getByRole("textbox", { name: "Код" });
    await userEvent.type(input, "777{Enter}");
    expect(input).toHaveValue("777");
  });

  it("autoFocuses and refocuses when focus falls to the body", async () => {
    renderWithUI(
      <>
        <BarcodeInput autoFocus refocus />
        <button type="button">Оплата</button>
      </>,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveFocus();
    input.blur();
    expect(document.body).toHaveFocus();
    await new Promise((r) => setTimeout(r, 80));
    expect(input).toHaveFocus();
    // Moving focus to another control is respected.
    screen.getByRole("button", { name: "Оплата" }).focus();
    await new Promise((r) => setTimeout(r, 80));
    expect(screen.getByRole("button", { name: "Оплата" })).toHaveFocus();
  });

  it("speaks Tajik", () => {
    renderWithUI(<BarcodeInput />, { provider: { locale: "tg" } });
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "placeholder",
      "Штрихкодро скан кунед ё ворид намоед",
    );
  });
});
