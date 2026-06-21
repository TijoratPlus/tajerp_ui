import type { Meta, StoryObj } from "@storybook/react";
import { LoadingState } from "../../src";

const meta: Meta<typeof LoadingState> = {
  title: "Components/Feedback/LoadingState",
  component: LoadingState,
  parameters: {
    docs: {
      description: {
        component: "Full-block loading placeholder with title, description, and spinner.",
      },
    },
  },
  args: { title: "Загрузка каталога", description: "Подождите…" },
};
export default meta;

type Story = StoryObj<typeof LoadingState>;

export const Playground: Story = {};
