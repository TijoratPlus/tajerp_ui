import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  Button,
  EventCalendar,
  TajUIProvider,
  type CalendarEvent,
  type CalendarEventRange,
} from "../../src";

const meta: Meta<typeof EventCalendar> = {
  title: "Components/Data Display/EventCalendar",
  component: EventCalendar,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Day / week / month calendar for CRM meetings, calls and tasks. Drag on empty time (or across days in the month grid and the all-day row) to create; drag an event to move it and its bottom edge to resize. A focused event moves with Alt+↑/↓ (one slot) and Alt+←/→ (one day) and resizes with Alt+Shift+↑/↓. All-day ranges end at 00:00 of the following day (exclusive).",
      },
    },
  },
  args: { slotMinutes: 30, hourHeight: 48, weekStartsOn: 1, editable: true },
  argTypes: {
    slotMinutes: { control: "inline-radio", options: [15, 30, 60] },
    weekStartsOn: { control: "inline-radio", options: [0, 1] },
  },
};
export default meta;

type Story = StoryObj<typeof EventCalendar>;

const at = (dayOffset: number, h: number, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  return d;
};
const day = (offset: number) => at(offset, 0);

const seed = (): CalendarEvent[] => [
  { id: "1", title: "Звонок: ООО «Сомон Трейд»", start: at(0, 10), end: at(0, 10, 30), color: "var(--ui-chart-2)" },
  { id: "2", title: "Демо Tijorat+ для «Душанбе Маркет»", start: at(0, 11), end: at(0, 12, 30) },
  { id: "3", title: "Планёрка отдела продаж", start: at(0, 11, 30), end: at(0, 12), color: "var(--ui-chart-5)" },
  { id: "4", title: "Встреча в Худжанде", start: at(1, 14), end: at(1, 16), color: "var(--ui-chart-3)" },
  { id: "5", title: "Выставка «Тоҷикистон-Экспо»", start: day(2), end: day(4), allDay: true, color: "var(--ui-chart-4)" },
  { id: "6", title: "Отчёт за квартал", start: day(-1), end: day(0), allDay: true },
];

function Interactive(args: Partial<React.ComponentProps<typeof EventCalendar>>) {
  const [events, setEvents] = React.useState(seed);
  const [log, setLog] = React.useState("—");
  const fmt = (r: CalendarEventRange) =>
    `${r.start.toLocaleString("ru-RU")} → ${r.end.toLocaleString("ru-RU")}${r.allDay ? " (весь день)" : ""}`;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <EventCalendar
        {...args}
        events={events}
        onCreate={(r) => {
          setEvents((list) => [...list, { id: String(Date.now()), title: "Новое событие", ...r }]);
          setLog(`Создано: ${fmt(r)}`);
        }}
        onEventChange={(e, next) => {
          setEvents((list) => list.map((x) => (x.id === e.id ? { ...x, ...next } : x)));
          setLog(`«${e.title}»: ${fmt(next)}`);
        }}
        onEventClick={(e) => setLog(`Открыто: «${e.title}»`)}
        toolbarExtra={
          <Button size="sm" variant="outline">
            Новое событие
          </Button>
        }
      />
      <p style={{ margin: 0, color: "var(--ui-ink-3)", fontSize: 13 }}>{log}</p>
    </div>
  );
}

export const Week: Story = { render: (args) => <Interactive {...args} defaultView="week" /> };

export const Month: Story = {
  render: (args) => <Interactive {...args} defaultView="month" />,
};

export const Day: Story = {
  render: (args) => <Interactive {...args} defaultView="day" slotMinutes={15} />,
};

export const ReadOnly: Story = {
  name: "Только просмотр",
  render: () => <EventCalendar events={seed()} editable={false} defaultView="week" bodyHeight={420} />,
};

export const Tajik: Story = {
  name: "Тоҷикӣ",
  render: () => (
    <TajUIProvider locale="tg">
      <EventCalendar
        defaultView="week"
        bodyHeight={420}
        events={[
          { id: "a", title: "Мулоқот бо мизоҷ", start: at(0, 9), end: at(0, 10) },
          { id: "b", title: "Ҷаласаи ҳафтаина", start: at(1, 15), end: at(1, 16), color: "var(--ui-chart-2)" },
          { id: "c", title: "Рӯзи истироҳат", start: day(3), end: day(4), allDay: true, color: "var(--ui-chart-3)" },
        ]}
      />
    </TajUIProvider>
  ),
};
