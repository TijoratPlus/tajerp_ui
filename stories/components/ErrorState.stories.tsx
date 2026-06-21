import type { Meta, StoryObj } from "@storybook/react";
import { ErrorState } from "../../src";

const meta: Meta<typeof ErrorState> = {
  title: "Components/Feedback/ErrorState",
  component: ErrorState,
  parameters: {
    docs: {
      description: {
        component: "Error placeholder with optional retry action. Use when a data fetch fails.",
      },
    },
  },
  args: {
    title: "Не удалось загрузить",
    description: "Проверьте подключение к интернету.",
    actionLabel: "Повторить",
  },
};
export default meta;

type Story = StoryObj<typeof ErrorState>;

export const Playground: Story = {
  args: { onAction: () => {} },
};
