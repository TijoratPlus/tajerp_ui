import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove as dndArrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { useMessages } from "./TajUIProvider";

export const sortableMessages = defineMessages("sortable", {
  ru: {
    dragHandle: "Перетащить",
    roleDescription: "перемещаемый элемент",
    instructions:
      "Чтобы взять элемент, нажмите Пробел. Перемещайте стрелками, Пробел — положить, Escape — отменить.",
    picked: (pos: number, total: number) => `Элемент взят. Позиция ${pos} из ${total}.`,
    moved: (pos: number, total: number) => `Позиция ${pos} из ${total}.`,
    dropped: (pos: number, total: number) => `Элемент перемещён на позицию ${pos} из ${total}.`,
    cancelled: "Перемещение отменено.",
  },
  tg: {
    dragHandle: "Кашидан",
    roleDescription: "унсури ҷойивазшаванда",
    instructions:
      "Барои гирифтани унсур Фосиларо пахш кунед. Бо тирчаҳо ҳаракат диҳед, Фосила — гузоштан, Escape — бекор кардан.",
    picked: (pos: number, total: number) => `Унсур гирифта шуд. Ҷойи ${pos} аз ${total}.`,
    moved: (pos: number, total: number) => `Ҷойи ${pos} аз ${total}.`,
    dropped: (pos: number, total: number) => `Унсур ба ҷойи ${pos} аз ${total} гузошта шуд.`,
    cancelled: "Ҷойивазкунӣ бекор шуд.",
  },
  en: {
    dragHandle: "Drag to reorder",
    roleDescription: "sortable item",
    instructions:
      "To pick up an item, press Space. Move it with the arrow keys, press Space to drop or Escape to cancel.",
    picked: (pos: number, total: number) => `Picked up item. Position ${pos} of ${total}.`,
    moved: (pos: number, total: number) => `Position ${pos} of ${total}.`,
    dropped: (pos: number, total: number) => `Item dropped at position ${pos} of ${total}.`,
    cancelled: "Move cancelled.",
  },
});

export type SortableLabels = (typeof sortableMessages.locales)["ru"];

/** Return a copy of `arr` with the element at `from` moved to `to`. */
export function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  return dndArrayMove(arr, from, to);
}

/**
 * Props for the element that starts a drag (keyboard + pointer). Spread them
 * on a `DragHandle` (or any element) — the `ref` marks it as the activator.
 */
export type SortableHandleProps = React.HTMLAttributes<HTMLElement> & {
  ref: (el: HTMLElement | null) => void;
};

export interface SortableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  /** Called with the items in their new order after a drop. */
  onReorder: (items: T[]) => void;
  renderItem: (
    item: T,
    handle: SortableHandleProps,
    state: { isDragging: boolean; index: number },
  ) => React.ReactNode;
  /** Defaults to "vertical". "grid" wraps items and sorts by position. */
  orientation?: "vertical" | "horizontal" | "grid";
  disabled?: boolean;
  /** Element of the list wrapper. Defaults to "div" (use "ul" with `itemAs="li"`). */
  as?: "div" | "ul" | "ol";
  itemAs?: "div" | "li";
  className?: string;
  itemClassName?: string;
  /** Accessible name of the list. */
  "aria-label"?: string;
  labels?: Partial<SortableLabels>;
}

/** Pointer (4px threshold, so clicks still work) + keyboard sensors. */
export function useSortableSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
}

/** Localized screen-reader announcements for a flat list of ids. */
export function useSortableAnnouncements(
  ids: UniqueIdentifier[],
  t: SortableLabels,
): { announcements: Announcements; screenReaderInstructions: { draggable: string } } {
  const pos = (id: UniqueIdentifier | undefined) => (id == null ? 0 : ids.indexOf(id) + 1);
  return {
    screenReaderInstructions: { draggable: t.instructions },
    announcements: {
      onDragStart: ({ active }) => t.picked(pos(active.id), ids.length),
      onDragOver: ({ over }) => (over ? t.moved(pos(over.id), ids.length) : undefined),
      onDragEnd: ({ over }) => (over ? t.dropped(pos(over.id), ids.length) : t.cancelled),
      onDragCancel: () => t.cancelled,
    },
  };
}

const strategies = {
  vertical: verticalListSortingStrategy,
  horizontal: horizontalListSortingStrategy,
  grid: rectSortingStrategy,
};

const layout = {
  vertical: "flex flex-col",
  horizontal: "flex flex-row",
  grid: "flex flex-wrap",
};

/**
 * Drag-to-reorder list on @dnd-kit: mouse, touch and keyboard (Space to pick
 * up, arrows to move, Space to drop, Escape to cancel), with localized screen
 * reader announcements. Render a `DragHandle` with the `handle` props inside
 * each item, or spread them on the whole item.
 */
export function SortableList<T>({
  items,
  getId,
  onReorder,
  renderItem,
  orientation = "vertical",
  disabled = false,
  as: Root = "div",
  itemAs = "div",
  className,
  itemClassName,
  "aria-label": ariaLabel,
  labels,
}: SortableListProps<T>) {
  const t = useMessages(sortableMessages, labels);
  const ids = items.map(getId);
  const sensors = useSortableSensors();
  const accessibility = useSortableAnnouncements(ids, t);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={accessibility}
    >
      <SortableContext items={ids} strategy={strategies[orientation]} disabled={disabled}>
        <Root
          data-slot="sortable-list"
          data-orientation={orientation}
          aria-label={ariaLabel}
          className={cn(layout[orientation], "gap-1.5", className)}
        >
          {items.map((item, index) => (
            <SortableItem
              key={ids[index]}
              id={ids[index]!}
              index={index}
              as={itemAs}
              className={itemClassName}
              roleDescription={t.roleDescription}
              render={(handle, isDragging) => renderItem(item, handle, { isDragging, index })}
            />
          ))}
        </Root>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  id,
  index,
  as: Item,
  className,
  roleDescription,
  render,
}: {
  id: string;
  index: number;
  as: "div" | "li";
  className?: string;
  roleDescription: string;
  render: (handle: SortableHandleProps, isDragging: boolean) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const handle: SortableHandleProps = {
    ...attributes,
    "aria-roledescription": roleDescription,
    ...(listeners as React.HTMLAttributes<HTMLElement>),
    ref: setActivatorNodeRef,
  };
  return (
    <Item
      ref={setNodeRef as React.Ref<never>}
      data-slot="sortable-item"
      data-index={index}
      data-dragging={isDragging || undefined}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={cn(
        "relative",
        isDragging && "z-(--tj-z-sticky) opacity-80",
        className,
      )}
    >
      {render(handle, isDragging)}
    </Item>
  );
}

export type DragHandleProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  labels?: Partial<SortableLabels>;
};

/** Grip icon button that starts a drag. Spread a `SortableHandleProps` on it. */
export const DragHandle = React.forwardRef<HTMLButtonElement, DragHandleProps>(
  ({ className, labels, children, ...props }, ref) => {
    const t = useMessages(sortableMessages, labels);
    return (
      <button
        ref={ref}
        type="button"
        data-slot="drag-handle"
        aria-label={t.dragHandle}
        className={cn(
          "inline-flex size-6 shrink-0 cursor-grab touch-none items-center justify-center !rounded-md text-ink-3 transition-colors hover:bg-ui-surface-2 hover:text-ink-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-60 [[data-density=touch]_&]:size-11",
          focusRing,
          className,
        )}
        {...props}
      >
        {children ?? <GripVertical className="size-4" aria-hidden />}
      </button>
    );
  },
);
DragHandle.displayName = "DragHandle";
