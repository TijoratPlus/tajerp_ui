import type { Meta, StoryObj } from "@storybook/react";
import { PackageX } from "lucide-react";
import { EmptyState } from "../../src";

const meta: Meta<typeof EmptyState> = {
  title: "Components/Feedback/EmptyState",
  component: EmptyState,
  parameters: {
    docs: {
      description: {
        component: "Empty collection placeholder with icon, copy, and optional CTA.",
      },
    },
  },
  args: {
    title: "Нет товаров",
    description: "Добавьте первый товар в каталог.",
    actionLabel: "Добавить товар",
  },
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Playground: Story = {
  render: (args) => (
    <EmptyState {...args} icon={<PackageX size={24} />} onAction={() => {}} />
  ),
};
