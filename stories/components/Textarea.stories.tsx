import type { Meta, StoryObj } from "@storybook/react";
import { Label, Textarea } from "../../src";

const meta: Meta<typeof Textarea> = {
  title: "Components/Inputs/Textarea",
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component:
          "Multi-line text field styled to match `Input`. Wraps the native `<textarea>`.",
      },
    },
  },
  args: { placeholder: "Комментарий к заказу" },
  argTypes: { disabled: { control: "boolean" }, rows: { control: "number" } },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 6, maxWidth: 360 }}>
      <Label htmlFor="note">Примечание</Label>
      <Textarea id="note" placeholder="Комментарий к заказу" rows={4} />
    </div>
  ),
};
