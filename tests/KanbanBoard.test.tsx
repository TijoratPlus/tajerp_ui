import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KanbanBoard, type KanbanColumn, type KanbanMove } from "../src";
import { mockDndLayout } from "./dnd";
import { expectNoA11yViolations, renderWithUI } from "./utils";

interface Deal {
  id: string;
  title: string;
}

const COLUMNS: KanbanColumn<Deal>[] = [
  {
    id: "new",
    title: "Новые",
    color: "info",
    items: [
      { id: "d1", title: "ООО «Сомон»" },
      { id: "d2", title: "Душанбе Плаза" },
    ],
    hasMore: true,
    count: 12,
  },
  { id: "won", title: "Выиграно", color: "success", items: [{ id: "d3", title: "Хуҷанд Савдо" }] },
  { id: "lost", title: "Проиграно", items: [] },
];

function Board(props: Partial<React.ComponentProps<typeof KanbanBoard<Deal>>>) {
  return (
    <KanbanBoard<Deal>
      columns={COLUMNS}
      getItemId={(d) => d.id}
      renderCard={(d) => <span>{d.title}</span>}
      {...props}
    />
  );
}

describe("KanbanBoard", () => {
  let restore: { mockRestore: () => void } | undefined;
  afterEach(() => restore?.mockRestore());

  it("renders columns with counts, empty state and header actions", async () => {
    const onAddItem = vi.fn();
    const onLoadMore = vi.fn();
    const onToggleCollapse = vi.fn();
    renderWithUI(
      <Board onAddItem={onAddItem} onLoadMore={onLoadMore} onToggleCollapse={onToggleCollapse} />,
    );
    const newCol = screen.getByRole("region", { name: "Новые" });
    expect(within(newCol).getByLabelText("Карточек: 12")).toHaveTextContent("12");
    expect(within(newCol).getAllByRole("listitem")).toHaveLength(2);
    expect(within(screen.getByRole("region", { name: "Проиграно" })).getByText("Нет карточек")).toBeInTheDocument();

    await userEvent.click(within(newCol).getByRole("button", { name: "Добавить карточку" }));
    expect(onAddItem).toHaveBeenCalledWith("new");
    await userEvent.click(within(newCol).getByRole("button", { name: "Загрузить ещё" }));
    expect(onLoadMore).toHaveBeenCalledWith("new");
    await userEvent.click(within(newCol).getByRole("button", { name: "Свернуть колонку" }));
    expect(onToggleCollapse).toHaveBeenCalledWith("new");
    await expectNoA11yViolations();
  });

  it("shows a collapsed column as a strip with an expand button", async () => {
    renderWithUI(
      <Board
        columns={[{ ...COLUMNS[0]!, collapsed: true }, COLUMNS[1]!]}
        onToggleCollapse={() => {}}
      />,
    );
    const strip = screen.getByRole("region", { name: "Новые" });
    expect(strip).toHaveAttribute("data-collapsed");
    expect(within(strip).queryByText("ООО «Сомон»")).not.toBeInTheDocument();
    expect(within(strip).getByRole("button", { name: "Развернуть колонку" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expectNoA11yViolations();
  });

  it("opens a card with Enter or a click", async () => {
    const onCardClick = vi.fn();
    renderWithUI(<Board onCardClick={onCardClick} />);
    const card = screen.getByText("Душанбе Плаза").closest("li")!;
    await userEvent.click(card);
    expect(onCardClick).toHaveBeenLastCalledWith(COLUMNS[0]!.items[1]);
    act(() => card.focus());
    await userEvent.keyboard("{Enter}");
    expect(onCardClick).toHaveBeenCalledTimes(2);
  });

  it("moves a card within a column with the keyboard", async () => {
    restore = mockDndLayout();
    const onMove = vi.fn<(m: KanbanMove) => void>();
    renderWithUI(<Board onMove={onMove} />);
    const card = screen.getByText("ООО «Сомон»").closest("li")!;
    act(() => card.focus());
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard(" ");
    expect(onMove).toHaveBeenCalledWith({ itemId: "d1", fromColumn: "new", toColumn: "new", toIndex: 1 });
  });

  it("moves a card to another column with the keyboard", async () => {
    restore = mockDndLayout();
    const onMove = vi.fn<(m: KanbanMove) => void>();
    renderWithUI(<Board onMove={onMove} />);
    const card = screen.getByText("ООО «Сомон»").closest("li")!;
    act(() => card.focus());
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard(" ");
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove.mock.calls[0]![0]).toMatchObject({ itemId: "d1", fromColumn: "new", toColumn: "won" });
  });

  it("reorders columns from the header grip", async () => {
    restore = mockDndLayout();
    const onColumnsReorder = vi.fn();
    renderWithUI(<Board onColumnsReorder={onColumnsReorder} />);
    const grip = within(screen.getByRole("region", { name: "Новые" })).getByRole("button", {
      name: "Переместить колонку",
    });
    act(() => grip.focus());
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard(" ");
    expect(onColumnsReorder).toHaveBeenCalledWith(["won", "new", "lost"]);
  });

  it("localizes to Tajik", () => {
    renderWithUI(<Board onAddItem={() => {}} />, { provider: { locale: "tg" } });
    expect(screen.getAllByRole("button", { name: "Илова кардани корт" })).toHaveLength(3);
    expect(screen.getByText("Корт нест")).toBeInTheDocument();
  });
});
