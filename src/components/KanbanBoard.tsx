import {
  closestCenter,
  closestCorners,
  DndContext,
  DragOverlay,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronsLeftRight, ChevronsRightLeft, Plus } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { arrayMove, DragHandle, useSortableSensors } from "./Sortable";
import { useMessages } from "./TajUIProvider";

export const kanbanBoardMessages = defineMessages("kanbanBoard", {
  ru: {
    board: "Канбан-доска",
    loadMore: "Загрузить ещё",
    empty: "Нет карточек",
    add: "Добавить карточку",
    collapse: "Свернуть колонку",
    expand: "Развернуть колонку",
    moveColumn: "Переместить колонку",
    count: (n: number) => `Карточек: ${n}`,
    loading: "Загрузка…",
    cardRole: "перемещаемая карточка",
    columnRole: "перемещаемая колонка",
    instructions:
      "Чтобы взять карточку, нажмите Пробел. Стрелки перемещают её внутри колонки и между колонками, Пробел или Enter — положить, Escape — отменить.",
    picked: (column: string) => `Карточка взята из колонки «${column}».`,
    over: (column: string, pos: number) => `Колонка «${column}», позиция ${pos}.`,
    dropped: (column: string, pos: number) =>
      `Карточка перемещена в колонку «${column}» на позицию ${pos}.`,
    cancelled: "Перемещение отменено.",
  },
  tg: {
    board: "Тахтаи канбан",
    loadMore: "Боз бор кардан",
    empty: "Корт нест",
    add: "Илова кардани корт",
    collapse: "Печондани сутун",
    expand: "Кушодани сутун",
    moveColumn: "Ҷойивазкунии сутун",
    count: (n: number) => `Кортҳо: ${n}`,
    loading: "Боркунӣ…",
    cardRole: "корти ҷойивазшаванда",
    columnRole: "сутуни ҷойивазшаванда",
    instructions:
      "Барои гирифтани корт Фосиларо пахш кунед. Тирчаҳо онро дар дохили сутун ва байни сутунҳо мекашонанд, Фосила ё Enter — гузоштан, Escape — бекор кардан.",
    picked: (column: string) => `Корт аз сутуни «${column}» гирифта шуд.`,
    over: (column: string, pos: number) => `Сутуни «${column}», ҷойи ${pos}.`,
    dropped: (column: string, pos: number) =>
      `Корт ба сутуни «${column}», ҷойи ${pos} гузошта шуд.`,
    cancelled: "Ҷойивазкунӣ бекор шуд.",
  },
  en: {
    board: "Kanban board",
    loadMore: "Load more",
    empty: "No cards",
    add: "Add card",
    collapse: "Collapse column",
    expand: "Expand column",
    moveColumn: "Move column",
    count: (n: number) => `${n} cards`,
    loading: "Loading…",
    cardRole: "draggable card",
    columnRole: "draggable column",
    instructions:
      "To pick up a card, press Space. Arrow keys move it within and between columns; press Space or Enter to drop, Escape to cancel.",
    picked: (column: string) => `Picked up card from column “${column}”.`,
    over: (column: string, pos: number) => `Column “${column}”, position ${pos}.`,
    dropped: (column: string, pos: number) =>
      `Card moved to column “${column}”, position ${pos}.`,
    cancelled: "Move cancelled.",
  },
});

export type KanbanBoardLabels = (typeof kanbanBoardMessages.locales)["ru"];

export interface KanbanColumn<T> {
  id: string;
  title: React.ReactNode;
  /**
   * Accent of the column dot: a tone (`brand | neutral | success | warning |
   * danger | info`) or any CSS colour, e.g. a status colour from the server.
   */
  color?: string;
  items: T[];
  /** Total in the column (server count); defaults to `items.length`. */
  count?: number;
  /** Show "Load more" at the bottom of the column. */
  hasMore?: boolean;
  /** Narrow vertical strip with title and count. */
  collapsed?: boolean;
  /** Plain-text title for announcements when `title` is not a string. */
  textTitle?: string;
}

export interface KanbanMove {
  itemId: string;
  fromColumn: string;
  toColumn: string;
  /** Index in the target column after the move. */
  toIndex: number;
}

export interface KanbanBoardProps<T> {
  columns: KanbanColumn<T>[];
  getItemId: (item: T) => string;
  renderCard: (item: T, column: KanbanColumn<T>) => React.ReactNode;
  /** Card dropped in a new place. Apply the move to `columns` (optimistically). */
  onMove?: (args: KanbanMove) => void;
  /** Columns reordered by drag (the header grip appears when set). */
  onColumnsReorder?: (columnIds: string[]) => void;
  onLoadMore?: (columnId: string) => void;
  /** "+" in the column header. */
  onAddItem?: (columnId: string) => void;
  /** Collapse/expand button in the header (state lives in `column.collapsed`). */
  onToggleCollapse?: (columnId: string) => void;
  /** Extra header content, e.g. a column DropdownMenu. */
  columnHeaderExtra?: (column: KanbanColumn<T>) => React.ReactNode;
  onCardClick?: (item: T) => void;
  /** Rendered after the last column, e.g. an "Add column" button. */
  footer?: React.ReactNode;
  /** Columns ids whose "Load more" is in flight. */
  loadingMore?: string[];
  loading?: boolean;
  /** Width of an expanded column in px. Defaults to 280. */
  columnWidth?: number;
  className?: string;
  "aria-label"?: string;
  labels?: Partial<KanbanBoardLabels>;
}

const COL_PREFIX = "column:";
const colKey = (id: string) => `${COL_PREFIX}${id}`;
const isColKey = (id: UniqueIdentifier) => String(id).startsWith(COL_PREFIX);
const fromColKey = (id: UniqueIdentifier) => String(id).slice(COL_PREFIX.length);

const TONES: Record<string, string> = {
  brand: "bg-brand-solid",
  neutral: "bg-ink-3",
  success: "bg-tj-success",
  warning: "bg-tj-warning",
  danger: "bg-tj-error",
  error: "bg-tj-error",
  info: "bg-tj-info",
};

function ColumnDot({ color }: { color?: string }) {
  if (!color) return null;
  const tone = TONES[color];
  return (
    <span
      aria-hidden
      className={cn("size-2.5 shrink-0 !rounded-full", tone)}
      style={tone ? undefined : { backgroundColor: color }}
    />
  );
}

const iconButton = cn(
  "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center !rounded-md text-ink-3 transition-colors hover:bg-ui-surface-2 hover:text-ink-1 [[data-density=touch]_&]:size-11",
  focusRing,
);

/**
 * Kanban board for CRM pipelines (leads, deals, tasks). Cards drag within and
 * between columns with mouse, touch or keyboard; columns optionally reorder,
 * collapse to a narrow strip, load more and add cards. The board is
 * controlled: it reports `onMove` and the app updates `columns`.
 */
export function KanbanBoard<T>({
  columns,
  getItemId,
  renderCard,
  onMove,
  onColumnsReorder,
  onLoadMore,
  onAddItem,
  onToggleCollapse,
  columnHeaderExtra,
  onCardClick,
  footer,
  loadingMore,
  loading = false,
  columnWidth = 280,
  className,
  "aria-label": ariaLabel,
  labels,
}: KanbanBoardProps<T>) {
  const t = useMessages(kanbanBoardMessages, labels);
  const sensors = useSortableSensors();
  const reorderable = !!onColumnsReorder;

  // Item lookup across columns.
  const itemById = React.useMemo(() => {
    const map = new Map<string, { item: T; column: string }>();
    for (const c of columns)
      for (const item of c.items) map.set(getItemId(item), { item, column: c.id });
    return map;
  }, [columns, getItemId]);

  const propContainers = React.useMemo(
    () => Object.fromEntries(columns.map((c) => [c.id, c.items.map(getItemId)])),
    [columns, getItemId],
  );

  // While a card is dragged, its tentative position lives here.
  const [drag, setDrag] = React.useState<{
    activeId: string;
    type: "card" | "column";
    fromColumn: string;
    containers: Record<string, string[]>;
  } | null>(null);
  const containers = drag?.containers ?? propContainers;

  const columnById = React.useMemo(
    () => Object.fromEntries(columns.map((c) => [c.id, c])),
    [columns],
  );
  const titleOf = (id: string) => {
    const c = columnById[id];
    if (!c) return id;
    return c.textTitle ?? (typeof c.title === "string" ? c.title : c.id);
  };

  const findContainer = (
    id: UniqueIdentifier,
    within: Record<string, string[]> = containers,
  ): string | undefined => {
    if (isColKey(id)) return fromColKey(id);
    const key = String(id);
    return Object.keys(within).find((c) => within[c]!.includes(key));
  };

  const collisionDetection: CollisionDetection = (args) => {
    if (args.active.data.current?.type === "column") {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter((d) => isColKey(d.id)),
      });
    }
    return closestCorners(args);
  };

  const onDragStart = ({ active }: DragStartEvent) => {
    const type = active.data.current?.type === "column" ? "column" : "card";
    setDrag({
      activeId: String(active.id),
      type,
      fromColumn: type === "column" ? fromColKey(active.id) : (findContainer(active.id) ?? ""),
      containers: propContainers,
    });
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!drag || drag.type !== "card" || !over) return;
    setDrag((d) => {
      if (!d) return d;
      const from = findContainer(active.id, d.containers);
      const to = findContainer(over.id, d.containers);
      if (!from || !to || from === to) return d;
      const fromItems = d.containers[from]!.filter((id) => id !== String(active.id));
      const toItems = [...d.containers[to]!];
      const overIndex = toItems.indexOf(String(over.id));
      const insertAt = overIndex >= 0 ? overIndex : toItems.length;
      toItems.splice(insertAt, 0, String(active.id));
      return { ...d, containers: { ...d.containers, [from]: fromItems, [to]: toItems } };
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const d = drag;
    setDrag(null);
    if (!d || !over) return;
    if (d.type === "column") {
      if (!onColumnsReorder || active.id === over.id) return;
      const ids = columns.map((c) => c.id);
      const from = ids.indexOf(fromColKey(active.id));
      const to = ids.indexOf(fromColKey(over.id));
      if (from >= 0 && to >= 0) onColumnsReorder(arrayMove(ids, from, to));
      return;
    }
    const itemId = String(active.id);
    const toColumn = findContainer(over.id, d.containers);
    if (!toColumn) return;
    let list = d.containers[toColumn]!;
    const activeIndex = list.indexOf(itemId);
    const overIndex = isColKey(over.id) ? list.length - 1 : list.indexOf(String(over.id));
    if (activeIndex >= 0 && overIndex >= 0 && activeIndex !== overIndex)
      list = arrayMove(list, activeIndex, overIndex);
    const toIndex = list.indexOf(itemId);
    const originalIndex = propContainers[d.fromColumn]?.indexOf(itemId) ?? -1;
    if (toColumn === d.fromColumn && toIndex === originalIndex) return;
    onMove?.({ itemId, fromColumn: d.fromColumn, toColumn, toIndex });
  };

  const posIn = (id: UniqueIdentifier, column: string) =>
    (containers[column]?.indexOf(String(id)) ?? -1) + 1 || (containers[column]?.length ?? 0) + 1;

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      active.data.current?.type === "column"
        ? undefined
        : t.picked(titleOf(findContainer(active.id) ?? "")),
    onDragOver: ({ active, over }) => {
      if (!over || active.data.current?.type === "column") return undefined;
      const c = findContainer(over.id) ?? "";
      return t.over(titleOf(c), posIn(active.id, c));
    },
    onDragEnd: ({ active, over }) => {
      if (!over) return t.cancelled;
      if (active.data.current?.type === "column") return undefined;
      const c = findContainer(over.id) ?? "";
      return t.dropped(titleOf(c), posIn(active.id, c));
    },
    onDragCancel: () => t.cancelled,
  };

  const activeCard =
    drag?.type === "card" ? itemById.get(drag.activeId) : undefined;

  return (
    <div
      data-slot="kanban-board"
      role="region"
      aria-label={ariaLabel ?? t.board}
      aria-busy={loading || undefined}
      className={cn("flex h-full min-h-0 gap-3 overflow-x-auto pb-2", className)}
    >
      {loading && columns.length === 0 ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            aria-hidden
            style={{ width: columnWidth }}
            className="flex shrink-0 flex-col gap-2 !rounded-xl bg-ui-surface-2 p-2"
          >
            <div className="h-4 w-1/2 !rounded bg-ui-surface motion-safe:animate-pulse" />
            {Array.from({ length: 3 }).map((__, j) => (
              <div key={j} className="h-20 !rounded-lg bg-ui-surface motion-safe:animate-pulse" />
            ))}
          </div>
        ))
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragCancel={() => setDrag(null)}
          accessibility={{
            announcements,
            screenReaderInstructions: { draggable: t.instructions },
          }}
        >
          <SortableContext
            items={columns.map((c) => colKey(c.id))}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column, columnIndex) => (
              <KanbanColumnView
                key={column.id}
                index={columnIndex}
                column={column}
                itemIds={containers[column.id] ?? []}
                itemById={itemById}
                renderCard={renderCard}
                reorderable={reorderable}
                onLoadMore={onLoadMore}
                onAddItem={onAddItem}
                onToggleCollapse={onToggleCollapse}
                columnHeaderExtra={columnHeaderExtra}
                onCardClick={onCardClick}
                loadingMore={loadingMore?.includes(column.id) ?? false}
                loading={loading}
                width={columnWidth}
                t={t}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeCard && columnById[activeCard.column] ? (
              <div
                data-slot="kanban-card-overlay"
                className="cursor-grabbing !rounded-lg border border-hairline bg-ui-surface p-3 shadow-tj-lg"
                style={{ width: columnWidth - 16 }}
              >
                {renderCard(activeCard.item, columnById[activeCard.column]!)}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      {footer ? <div className="shrink-0">{footer}</div> : null}
    </div>
  );
}

interface ColumnViewProps<T> {
  index: number;
  column: KanbanColumn<T>;
  itemIds: string[];
  itemById: Map<string, { item: T; column: string }>;
  renderCard: (item: T, column: KanbanColumn<T>) => React.ReactNode;
  reorderable: boolean;
  onLoadMore?: (columnId: string) => void;
  onAddItem?: (columnId: string) => void;
  onToggleCollapse?: (columnId: string) => void;
  columnHeaderExtra?: (column: KanbanColumn<T>) => React.ReactNode;
  onCardClick?: (item: T) => void;
  loadingMore: boolean;
  loading: boolean;
  width: number;
  t: KanbanBoardLabels;
}

function KanbanColumnView<T>({
  index,
  column,
  itemIds,
  itemById,
  renderCard,
  reorderable,
  onLoadMore,
  onAddItem,
  onToggleCollapse,
  columnHeaderExtra,
  onCardClick,
  loadingMore,
  loading,
  width,
  t,
}: ColumnViewProps<T>) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: colKey(column.id),
    data: { type: "column" },
    disabled: { draggable: !reorderable, droppable: false },
  });
  const titleId = React.useId();
  const count = column.count ?? column.items.length;
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (column.collapsed) {
    return (
      <section
        ref={setNodeRef}
        data-slot="kanban-column"
        data-column-index={index}
        data-collapsed=""
        aria-labelledby={titleId}
        style={style}
        className="flex w-10 shrink-0 flex-col items-center gap-2 !rounded-xl bg-ui-surface-2 py-2"
      >
        {onToggleCollapse ? (
          <button
            type="button"
            aria-label={t.expand}
            aria-expanded={false}
            onClick={() => onToggleCollapse(column.id)}
            className={iconButton}
          >
            <ChevronsLeftRight className="size-4" aria-hidden />
          </button>
        ) : null}
        <ColumnDot color={column.color} />
        <h3
          id={titleId}
          className="text-ui-label font-semibold text-ink-1 [writing-mode:vertical-rl]"
        >
          {column.title}
        </h3>
        <span className="text-ui-caption tabular-nums text-ink-3" aria-label={t.count(count)}>
          {count}
        </span>
      </section>
    );
  }

  return (
    <section
      ref={setNodeRef}
      data-slot="kanban-column"
      data-column-index={index}
      aria-labelledby={titleId}
      style={{ ...style, width }}
      className={cn(
        "flex max-h-full shrink-0 flex-col !rounded-xl bg-ui-surface-2",
        isDragging && "opacity-60",
      )}
    >
      <header
        data-slot="kanban-column-header"
        className="flex items-center gap-1.5 px-2 pt-2 pb-1.5"
      >
        {reorderable ? (
          <DragHandle
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-roledescription={t.columnRole}
            aria-label={t.moveColumn}
          />
        ) : null}
        <ColumnDot color={column.color} />
        <h3
          id={titleId}
          className="min-w-0 truncate text-ui-label font-semibold text-ink-1"
        >
          {column.title}
        </h3>
        <span
          className="!rounded-pill bg-ui-surface px-1.5 text-ui-caption tabular-nums text-ink-3"
          aria-label={t.count(count)}
        >
          {count}
        </span>
        <span className="flex-1" />
        {columnHeaderExtra?.(column)}
        {onAddItem ? (
          <button
            type="button"
            aria-label={t.add}
            onClick={() => onAddItem(column.id)}
            className={iconButton}
          >
            <Plus className="size-4" aria-hidden />
          </button>
        ) : null}
        {onToggleCollapse ? (
          <button
            type="button"
            aria-label={t.collapse}
            aria-expanded
            onClick={() => onToggleCollapse(column.id)}
            className={iconButton}
          >
            <ChevronsRightLeft className="size-4" aria-hidden />
          </button>
        ) : null}
      </header>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <ul
          data-slot="kanban-column-body"
          aria-labelledby={titleId}
          className="flex min-h-16 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2"
        >
          {itemIds.map((id, cardIndex) => {
            const entry = itemById.get(id);
            if (!entry) return null;
            return (
              <KanbanCard
                key={id}
                id={id}
                index={cardIndex}
                onClick={onCardClick ? () => onCardClick(entry.item) : undefined}
                roleDescription={t.cardRole}
              >
                {renderCard(entry.item, column)}
              </KanbanCard>
            );
          })}
          {itemIds.length === 0 && !loading ? (
            <li className="py-6 text-center text-ui-label text-ink-3">{t.empty}</li>
          ) : null}
        </ul>
      </SortableContext>
      {column.hasMore && onLoadMore ? (
        <div className="px-2 pb-2">
          <button
            type="button"
            data-slot="kanban-load-more"
            disabled={loadingMore}
            aria-busy={loadingMore || undefined}
            onClick={() => onLoadMore(column.id)}
            className={cn(
              "w-full cursor-pointer !rounded-lg px-2 py-1.5 text-ui-label font-semibold text-brand-ink transition-colors hover:bg-mist disabled:cursor-wait disabled:opacity-60",
              focusRing,
            )}
          >
            {loadingMore ? t.loading : t.loadMore}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function KanbanCard({
  id,
  index,
  onClick,
  roleDescription,
  children,
}: {
  id: string;
  index: number;
  onClick?: () => void;
  roleDescription: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id,
    data: { type: "card" },
  });
  const { onKeyDown, ...pointerListeners } = (listeners ?? {}) as React.HTMLAttributes<HTMLElement>;
  return (
    <li
      ref={setNodeRef}
      data-slot="kanban-card"
      data-index={index}
      data-dragging={isDragging || undefined}
      {...attributes}
      role="listitem"
      aria-roledescription={roleDescription}
      {...pointerListeners}
      onKeyDown={(e) => {
        // Enter opens the card; Space picks it up (handled by dnd-kit).
        if (e.key === "Enter" && onClick && !isDragging && e.target === e.currentTarget) {
          e.preventDefault();
          onClick();
          return;
        }
        onKeyDown?.(e as React.KeyboardEvent<HTMLElement>);
      }}
      onClick={onClick}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "cursor-grab touch-manipulation !rounded-lg border border-hairline bg-ui-surface p-3 text-ui-body text-ink-1 shadow-tj-sm transition-shadow hover:shadow-tj-md",
        "outline-none focus-visible:ring-2 focus-visible:ring-focus",
        isDragging && "opacity-40",
      )}
    >
      {children}
    </li>
  );
}
