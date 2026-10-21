import * as React from "react";

export type RovingOrientation = "horizontal" | "vertical" | "both";

const KEYS: Record<RovingOrientation, { next: string[]; prev: string[] }> = {
  horizontal: { next: ["ArrowRight"], prev: ["ArrowLeft"] },
  vertical: { next: ["ArrowDown"], prev: ["ArrowUp"] },
  both: { next: ["ArrowRight", "ArrowDown"], prev: ["ArrowLeft", "ArrowUp"] },
};

/**
 * Roving-tabindex keyboard model shared by Tabs, SegmentedControl and other
 * composite widgets: arrow keys (and Home/End) move focus between enabled
 * items, wrapping around, and report the new index via `onMove`.
 */
export function useRovingFocus({
  count,
  isDisabled,
  orientation = "horizontal",
  onMove,
}: {
  count: number;
  isDisabled?: (index: number) => boolean;
  orientation?: RovingOrientation;
  onMove?: (index: number) => void;
}) {
  const refs = React.useRef<Array<HTMLElement | null>>([]);

  const enabled = React.useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < count; i++) if (!isDisabled?.(i)) out.push(i);
    return out;
  }, [count, isDisabled]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (enabled.length === 0) return;
    const pos = Math.max(0, enabled.indexOf(index));
    const keys = KEYS[orientation];
    let next: number | undefined;
    if (keys.next.includes(e.key)) next = enabled[(pos + 1) % enabled.length];
    else if (keys.prev.includes(e.key))
      next = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") next = enabled[0];
    else if (e.key === "End") next = enabled[enabled.length - 1];
    else return;
    e.preventDefault();
    refs.current[next]?.focus();
    onMove?.(next);
  };

  const setRef = (index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el;
  };

  return { onKeyDown, setRef, enabled };
}
