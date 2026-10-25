import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Label, TajUIProvider, TimePicker } from "../../src";

const meta: Meta<typeof TimePicker> = {
  title: "Components/Inputs/TimePicker",
  component: TimePicker,
  parameters: {
    docs: {
      description: {
        component:
          "Time-of-day field for call-backs, shift starts and opening hours. Type `930`, `9:30` or `09.30` (parsed on blur or Enter) or pick a slot from the list (↓/↑, Enter). `step` sets the slot interval, `min`/`max` limit the range, `withSeconds` emits `HH:mm:ss` for Frappe `Time` fields.",
      },
    },
  },
  args: { size: "md", step: 15, clearable: true, disabled: false },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    step: { control: "inline-radio", options: [5, 15, 30, 60] },
  },
};
export default meta;

type Story = StoryObj<typeof TimePicker>;

const field = { display: "grid", gap: 6, maxWidth: 200 } as const;
const caption = { margin: 0, color: "var(--ui-ink-3)", fontSize: 13 } as const;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("10:30");
    return (
      <div style={field}>
        <Label htmlFor="callback">Перезвонить в</Label>
        <TimePicker {...args} id="callback" value={value} onValueChange={setValue} />
        <p style={caption}>Значение: {value || "—"}</p>
      </div>
    );
  },
};

export const WorkingHours: Story = {
  name: "Рабочее время (08:00–18:00, шаг 30 мин)",
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <div style={field}>
        <Label htmlFor="open">Открытие</Label>
        <TimePicker id="open" step={30} min="08:00" max="18:00" defaultValue="09:00" />
      </div>
      <div style={field}>
        <Label htmlFor="close">Закрытие</Label>
        <TimePicker id="close" step={30} min="08:00" max="18:00" defaultValue="18:00" />
      </div>
    </div>
  ),
};

export const Tajik: Story = {
  name: "Тоҷикӣ",
  render: () => (
    <TajUIProvider locale="tg">
      <div style={field}>
        <Label htmlFor="meet">Вақти мулоқот</Label>
        <TimePicker id="meet" clearable />
      </div>
    </TajUIProvider>
  ),
};
