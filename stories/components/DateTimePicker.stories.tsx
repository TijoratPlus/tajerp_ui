import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { DateTimePicker, Label, TajUIProvider } from "../../src";

const meta: Meta<typeof DateTimePicker> = {
  title: "Components/Inputs/DateTimePicker",
  component: DateTimePicker,
  parameters: {
    docs: {
      description: {
        component:
          "Date + time field for meetings, task deadlines and call-backs. Type `21.10.2026 14:30` (also `21.10.2026 1430`, ISO `2026-10-21T14:30`) — parsed on blur or Enter — or pick a day and a time slot in the popover. Use `DatePicker` when the time does not matter.",
      },
    },
  },
  args: { size: "md", clearable: true, disabled: false, step: 15 },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    step: { control: "inline-radio", options: [15, 30, 60] },
  },
};
export default meta;

type Story = StoryObj<typeof DateTimePicker>;

const field = { display: "grid", gap: 6, maxWidth: 260 } as const;
const caption = { margin: 0, color: "var(--ui-ink-3)", fontSize: 13 } as const;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(new Date());
    return (
      <div style={field}>
        <Label htmlFor="meeting">Встреча с клиентом</Label>
        <DateTimePicker {...args} id="meeting" value={value} onValueChange={setValue} />
        <p style={caption}>Значение: {value ? value.toLocaleString("ru-RU") : "—"}</p>
      </div>
    );
  },
};

export const FutureOnly: Story = {
  name: "Срок задачи (не раньше сейчас)",
  render: () => (
    <div style={field}>
      <Label htmlFor="due">Срок задачи</Label>
      <DateTimePicker id="due" min={new Date()} step={30} clearable />
    </div>
  ),
};

export const Tajik: Story = {
  name: "Тоҷикӣ",
  render: () => (
    <TajUIProvider locale="tg">
      <div style={field}>
        <Label htmlFor="call">Занги такрорӣ</Label>
        <DateTimePicker id="call" clearable />
      </div>
    </TajUIProvider>
  ),
};
