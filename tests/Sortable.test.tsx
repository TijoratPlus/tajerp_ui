import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DragHandle, SortableList, arrayMove } from "../src";
import { mockDndLayout } from "./dnd";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const STAGES = ["Новый", "Квалификация", "Переговоры"];

function List({ onReorder }: { onReorder?: (items: string[]) => void }) {
  const [items, setItems] = React.useState(STAGES);
  return (
    <SortableList
      items={items}
      getId={(s) => s}
      aria-label="Этапы сделки"
      as="ul"
      itemAs="li"
      onReorder={(next) => {
        setItems(next);
        onReorder?.(next);
      }}
      renderItem={(stage, handle) => (
        <div className="flex items-center gap-2">
          <DragHandle {...handle} aria-label={`Переместить «${stage}»`} />
          <span>{stage}</span>
        </div>
      )}
    />
  );
}

describe("arrayMove", () => {
  it("moves an element without mutating the input", () => {
    const input = ["a", "b", "c", "d"];
    expect(arrayMove(input, 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(arrayMove(input, 3, 0)).toEqual(["d", "a", "b", "c"]);
    expect(input).toEqual(["a", "b", "c", "d"]);
  });
});

describe("SortableList", () => {
  let restore: { mockRestore: () => void } | undefined;
  afterEach(() => restore?.mockRestore());

  it("renders items with labelled drag handles and no a11y violations", async () => {
    renderWithUI(<List />);
    expect(screen.getByRole("list", { name: "Этапы сделки" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    const handle = screen.getByRole("button", { name: "Переместить «Новый»" });
    expect(handle).toHaveAttribute("aria-roledescription", "перемещаемый элемент");
    await expectNoA11yViolations();
  });

  it("reorders with the keyboard (Space, ArrowDown, Space)", async () => {
    restore = mockDndLayout();
    const onReorder = vi.fn();
    renderWithUI(<List onReorder={onReorder} />);
    const handle = screen.getByRole("button", { name: "Переместить «Новый»" });
    act(() => handle.focus());
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard(" ");
    expect(onReorder).toHaveBeenCalledWith(["Квалификация", "Новый", "Переговоры"]);
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Квалификация",
      "Новый",
      "Переговоры",
    ]);
  });

  it("uses the default Tajik handle label", () => {
    renderWithUI(<DragHandle />, { provider: { locale: "tg" } });
    expect(screen.getByRole("button", { name: "Кашидан" })).toBeInTheDocument();
  });
});
