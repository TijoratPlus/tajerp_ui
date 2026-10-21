import * as React from "react";

export interface UseBarcodeScannerOptions {
  /** Fires with the scanned code once a fast burst ends with Enter / Tab. */
  onScan: (code: string) => void;
  /** Shortest code accepted. Defaults to 4. */
  minLength?: number;
  /**
   * Longest gap between two keystrokes of one scan, in ms. Scanners type a
   * whole code in a few ms per key; people need 80 ms or more. Defaults to 35.
   */
  maxInterval?: number;
  /**
   * Where to listen: `"window"` (default) catches scans anywhere on the page;
   * pass an element ref to listen inside one region only.
   */
  target?: "window" | React.RefObject<HTMLElement | null>;
  /** Turn the listener off, e.g. while a dialog that takes text is open. */
  enabled?: boolean;
  /**
   * Cancel the default action of the key that ends a scan, so the scanner's
   * Enter does not submit a form and its Tab does not move focus. Characters
   * typed before the scan was recognised still reach the focused field.
   */
  preventDefault?: boolean;
  /** Keys that end a scan. Defaults to Enter and Tab. */
  endKeys?: string[];
}

const DEFAULT_END_KEYS = ["Enter", "Tab"];

/**
 * Detect keyboard-wedge barcode scanners: they "type" the code as a burst of
 * keystrokes a few milliseconds apart, followed by Enter (or Tab). Normal
 * typing is slower than `maxInterval` between keys and is ignored, so the hook
 * can listen on the whole window while cashiers type in search fields.
 *
 *   useBarcodeScanner({ onScan: (code) => addToCart(code) });
 */
export function useBarcodeScanner({
  onScan,
  minLength = 4,
  maxInterval = 35,
  target = "window",
  enabled = true,
  preventDefault = false,
  endKeys = DEFAULT_END_KEYS,
}: UseBarcodeScannerOptions): void {
  const onScanRef = React.useRef(onScan);
  React.useEffect(() => {
    onScanRef.current = onScan;
  });

  const endKeysKey = endKeys.join("\u0000");

  React.useEffect(() => {
    if (!enabled) return;
    const el: Window | HTMLElement | null =
      target === "window" ? window : target.current;
    if (!el) return;

    const ends = endKeysKey.split("\u0000");
    let buffer = "";
    let last = Number.NEGATIVE_INFINITY;

    const onKeyDown = (event: Event) => {
      const e = event as KeyboardEvent;
      if (e.isComposing || e.repeat) return;
      const now = Date.now();
      const gap = now - last;

      if (ends.includes(e.key)) {
        const code = buffer;
        buffer = "";
        last = Number.NEGATIVE_INFINITY;
        if (code.length >= minLength && gap <= maxInterval) {
          if (preventDefault) e.preventDefault();
          onScanRef.current(code);
        }
        return;
      }

      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) {
        // Shift and other modifiers are pressed inside scans; anything else breaks one.
        if (e.key !== "Shift") {
          buffer = "";
          last = Number.NEGATIVE_INFINITY;
        }
        return;
      }

      buffer = gap <= maxInterval ? buffer + e.key : e.key;
      last = now;
    };

    el.addEventListener("keydown", onKeyDown, true);
    return () => el.removeEventListener("keydown", onKeyDown, true);
  }, [enabled, target, minLength, maxInterval, preventDefault, endKeysKey]);
}
