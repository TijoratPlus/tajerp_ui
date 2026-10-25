import type { Meta, StoryObj } from "@storybook/react";
import {
  CheckCircle2,
  FileText,
  MessageSquare,
  PackagePlus,
} from "lucide-react";
import { ActivityTimeline, type ActivityItem, TajUIProvider } from "../../src";

const meta: Meta<typeof ActivityTimeline> = {
  title: "Components/Data Display/ActivityTimeline",
  component: ActivityTimeline,
  parameters: {
    docs: {
      description: {
        component:
          'Audit / activity feed: who did what and when — people, the system and TijoratAI (marked with an "AI" badge). Times show relatively ("5 минут назад") with the full date in a `<time>` title. `groupByDay` splits the feed into Сегодня / Вчера / date sections. Use on document pages, customer cards and the dashboard.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ActivityTimeline>;

const now = Date.now();
const min = 60_000;
const hour = 60 * min;

const supplierOrder: ActivityItem[] = [
  {
    id: "5",
    actor: { name: "Фарида Рахимова", kind: "user" },
    action: "утвердила и отправила поставщику",
    target: "ЗП-00142",
    time: now - 4 * min,
    tone: "success",
    icon: <CheckCircle2 />,
    meta: "ООО «Душанбе Ордер» · 8 450,00 с",
  },
  {
    id: "4",
    actor: { name: "Фарида Рахимова", kind: "user" },
    action: "изменила количество «Масло подсолнечное 5 л» с 20 на 30 шт. в",
    target: "ЗП-00142",
    time: now - 12 * min,
  },
  {
    id: "3",
    actor: { name: "TijoratAI", kind: "ai" },
    action: "подготовил черновик заказа поставщику",
    target: "ЗП-00142",
    time: now - 45 * min,
    icon: <FileText />,
    tone: "brand",
    meta: "12 позиций по остаткам ниже минимума · ждёт утверждения менеджера",
  },
  {
    id: "2",
    actor: { name: "Система", kind: "system" },
    action: "обнаружила 12 товаров ниже минимального остатка на складе",
    target: "Центральный",
    time: now - 50 * min,
    tone: "warning",
    icon: <PackagePlus />,
  },
  {
    id: "1",
    actor: { name: "Система", kind: "system" },
    action: "закрыла смену",
    target: "Касса 2",
    time: now - 26 * hour,
  },
  {
    id: "0",
    actor: { name: "TijoratAI", kind: "ai" },
    action: "отправил SMS-напоминание о долге клиенту",
    target: "ИП Назаров",
    time: now - 30 * hour,
    icon: <MessageSquare />,
    tone: "info",
  },
];

export const SupplierOrderApproval: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <ActivityTimeline items={supplierOrder} />
    </div>
  ),
};

export const GroupedByDay: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <ActivityTimeline
        groupByDay
        items={[
          ...supplierOrder,
          {
            id: "old",
            actor: { name: "Алишер Каримов" },
            action: "добавил поставщика",
            target: "ООО «Душанбе Ордер»",
            time: now - 9 * 24 * hour,
          },
        ]}
      />
    </div>
  ),
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <div style={{ maxWidth: 560 }}>
        <ActivityTimeline
          groupByDay
          items={[
            {
              id: "b",
              actor: { name: "Фарида Раҳимова" },
              action: "фармоиши таъминкунандаро тасдиқ кард",
              target: "ЗП-00142",
              time: now - 8 * min,
              tone: "success",
              icon: <CheckCircle2 />,
            },
            {
              id: "a",
              actor: { name: "TijoratAI", kind: "ai" },
              action: "лоиҳаи фармоишро барои таъминкунанда омода кард",
              target: "ЗП-00142",
              time: now - 40 * min,
              meta: "12 мавқеъ · интизори тасдиқи менеҷер",
            },
            {
              id: "c",
              actor: { name: "Система", kind: "system" },
              action: "басти навбатро пӯшид",
              target: "Касса 2",
              time: now - 25 * hour,
            },
          ]}
        />
      </div>
    </TajUIProvider>
  ),
};

export const Empty: Story = {
  render: () => <ActivityTimeline items={[]} />,
};
