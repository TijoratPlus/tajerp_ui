import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "../../src";

const meta: Meta<typeof Spinner> = {
  title: "Components/Feedback/Spinner",
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component: "Indeterminate loading indicator. Use inside buttons (`Button loading`) or standalone.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Spinner>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <Spinner className="size-4" />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
    </div>
  ),
};
