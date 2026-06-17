import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Checkbox } from "../src";

const meta: Meta<typeof Checkbox> = {
  title: "Primitives/Checkbox",
  component: Checkbox,
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <Checkbox defaultChecked={false} /> Не выбрано
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <Checkbox defaultChecked /> Выбрано
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <Checkbox indeterminate /> Частично
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-4">
        <Checkbox disabled /> Отключено
      </label>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [on, setOn] = React.useState(true);
    return (
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <Checkbox checked={on} onCheckedChange={setOn} />
        Получать уведомления
      </label>
    );
  },
};
