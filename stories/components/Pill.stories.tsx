import type { Meta, StoryObj } from "@storybook/react";
import { Pill } from "../../src";

const meta: Meta<typeof Pill> = {
  title: "Components/Data Display/Pill",
  component: Pill,
  parameters: {
    docs: {
      description: {
        component: "Soft rounded label for tags and filters. Pass `dark` when placed on dark rail backgrounds.",
      },
    },
  },
  args: { children: "Tijorat+" },
  argTypes: { dark: { control: "boolean" } },
};
export default meta;

type Story = StoryObj<typeof Pill>;

export const Playground: Story = {};

export const OnDark: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Pill>На светлом</Pill>
      <div
        className="dark"
        style={{ background: "var(--ui-rail-bg)", padding: 16, borderRadius: 12 }}
      >
        <Pill dark>На тёмном</Pill>
      </div>
    </div>
  ),
};
