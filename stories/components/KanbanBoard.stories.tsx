import type { Meta, StoryObj } from "@storybook/react";
import { MoreHorizontal } from "lucide-react";
import * as React from "react";
import {
  AvatarGroup,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  KanbanBoard,
  type KanbanColumn,
  type KanbanMove,
  Money,
  TajUIProvider,
} from "../../src";

interface Deal {
  id: string;
  org: string;
  amount: number;
  owners: { name: string }[];
}

const INITIAL: KanbanColumn<Deal>[] = [
  {
    id: "qualification",
    title: "Квалификация",
    color: "info",
    count: 14,
    hasMore: true,
    items: [
      { id: "D-101", org: "ООО «Сомон Трейд»", amount: 48000, owners: [{ name: "Зарина Каримова" }] },
      { id: "D-102", org: "Душанбе Плаза", amount: 125000, owners: [{ name: "Фаррух Раҳимов" }, { name: "Мунира Юсупова" }] },
    ],
  },
  {
    id: "demo",
    title: "Демонстрация",
    color: "warning",
    items: [{ id: "D-103", org: "Хуҷанд Савдо", amount: 32000, owners: [{ name: "Ҷамшед Қодиров" }] }],
  },
  {
    id: "negotiation",
    title: "Переговоры",
    color: "brand",
    items: [{ id: "D-104", org: "Pamir Foods", amount: 210000, owners: [{ name: "Шаҳноза Ғафорова" }] }],
  },
  { id: "won", title: "Выиграно", color: "success", items: [] },
  { id: "lost", title: "Проиграно", color: "danger", items: [], collapsed: true },
];

function applyMove(columns: KanbanColumn<Deal>[], m: KanbanMove) {
  const item = columns.flatMap((c) => c.items).find((d) => d.id === m.itemId)!;
  return columns.map((c) => {
    let items = c.items.filter((d) => d.id !== m.itemId);
    if (c.id === m.toColumn) items = [...items.slice(0, m.toIndex), item, ...items.slice(m.toIndex)];
    return { ...c, items };
  });
}

const meta: Meta<typeof KanbanBoard> = {
  title: "Components/Data Display/KanbanBoard",
  component: KanbanBoard,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Pipeline board for leads, deals and tasks. Cards drag within and between columns (mouse, touch, or keyboard: focus a card, Space, arrows, Space) and the board reports `onMove({ itemId, fromColumn, toColumn, toIndex })` — update `columns` yourself (optimistically). Optional: column reorder (`onColumnsReorder`, header grip), collapse to a narrow strip, «Загрузить ещё» per column, «+» to add a card, a header slot for a column menu, and a `footer` after the last column. Columns are ~280px and the board scrolls horizontally.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof KanbanBoard>;

export const DealsPipeline: Story = {
  render: () => {
    const [columns, setColumns] = React.useState(INITIAL);
    return (
      <div className="h-[560px] bg-ui-bg p-4">
        <KanbanBoard<Deal>
          columns={columns}
          getItemId={(d) => d.id}
          onMove={(m) => setColumns((c) => applyMove(c, m))}
          onColumnsReorder={(ids) =>
            setColumns((c) => ids.map((id) => c.find((col) => col.id === id)!))
          }
          onToggleCollapse={(id) =>
            setColumns((c) => c.map((col) => (col.id === id ? { ...col, collapsed: !col.collapsed } : col)))
          }
          onLoadMore={(id) => console.info("load more", id)}
          onAddItem={(id) => console.info("add to", id)}
          onCardClick={(d) => console.info("open", d.id)}
          columnHeaderExtra={() => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Действия с колонкой">
                  <MoreHorizontal className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Переименовать</DropdownMenuItem>
                <DropdownMenuItem>Скрыть колонку</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          renderCard={(d) => (
            <div className="flex flex-col gap-1.5">
              <span className="text-ui-caption text-ink-3">{d.id}</span>
              <span className="font-semibold">{d.org}</span>
              <div className="flex items-center justify-between">
                <Money value={d.amount} />
                <AvatarGroup avatars={d.owners} size="xs" />
              </div>
            </div>
          )}
          footer={
            <Button variant="ghost" size="sm">
              + Добавить колонку
            </Button>
          }
        />
      </div>
    );
  },
};

export const Loading: Story = {
  render: () => (
    <div className="h-[400px] p-4">
      <KanbanBoard<Deal> loading columns={[]} getItemId={(d) => d.id} renderCard={() => null} />
    </div>
  ),
};

export const Tajik: Story = {
  render: () => {
    const [columns, setColumns] = React.useState<KanbanColumn<Deal>[]>([
      { id: "new", title: "Нав", color: "info", items: [{ id: "T-1", org: "Ширкати «Ҳисор»", amount: 15000, owners: [{ name: "Қаҳҳор Ғаниев" }] }] },
      { id: "work", title: "Дар ҷараён", color: "warning", items: [] },
      { id: "done", title: "Анҷом ёфт", color: "success", items: [] },
    ]);
    return (
      <TajUIProvider locale="tg">
        <div className="h-[420px] p-4">
          <KanbanBoard<Deal>
            columns={columns}
            getItemId={(d) => d.id}
            onMove={(m) => setColumns((c) => applyMove(c, m))}
            onAddItem={() => {}}
            renderCard={(d) => <span className="font-semibold">{d.org}</span>}
          />
        </div>
      </TajUIProvider>
    );
  },
};
