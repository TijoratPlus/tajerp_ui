import type { Meta, StoryObj } from "@storybook/react";
import { Input, Label } from "../../src";

const meta: Meta<typeof Label> = {
  title: "Components/Inputs/Label",
  component: Label,
  parameters: {
    docs: {
      description: {
        component:
          "Form field caption. Wrap or associate with a control via `htmlFor` for accessibility.",
      },
    },
  },
  args: { children: "Имя клиента" },
};
export default meta;

type Story = StoryObj<typeof Label>;

export const Playground: Story = {};

export const WithField: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 6, maxWidth: 320 }}>
      <Label htmlFor="phone">Телефон</Label>
      <Input id="phone" type="tel" placeholder="+992 …" />
    </div>
  ),
};
