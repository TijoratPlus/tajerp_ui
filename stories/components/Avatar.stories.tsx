import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, Separator } from "../../src";

const meta: Meta<typeof Avatar> = {
  title: "Components/Data Display/Avatar",
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          "User or entity avatar. Compose with `AvatarImage` and `AvatarFallback` (initials). Built on Radix Avatar.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>АН</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar className="size-8">
        <AvatarFallback className="text-xs">АН</AvatarFallback>
      </Avatar>
      <Separator orientation="vertical" style={{ height: 32 }} />
      <Avatar className="size-12">
        <AvatarFallback>ТП</AvatarFallback>
      </Avatar>
    </div>
  ),
};
