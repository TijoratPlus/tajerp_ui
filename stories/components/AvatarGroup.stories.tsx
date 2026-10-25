import type { Meta, StoryObj } from "@storybook/react";
import { AvatarGroup, TajUIProvider } from "../../src";

const TEAM = [
  { name: "Зарина Каримова" },
  { name: "Фаррух Раҳимов" },
  { name: "Шаҳноза Ғафорова" },
  { name: "Ҷамшед Қодиров" },
  { name: "Мунира Юсупова" },
];

const meta: Meta<typeof AvatarGroup> = {
  title: "Components/Data Display/AvatarGroup",
  component: AvatarGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Overlapping avatars for assignees, participants or watchers, with «+N» after `max` (3). Every name is in the accessible name and in the tooltip (hover or focus).",
      },
    },
  },
  args: { avatars: TEAM, max: 3, size: "sm" },
};
export default meta;
type Story = StoryObj<typeof AvatarGroup>;

export const Playground: Story = {};
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <AvatarGroup avatars={TEAM} size="xs" />
      <AvatarGroup avatars={TEAM} size="sm" />
      <AvatarGroup avatars={TEAM} size="md" max={4} />
      <AvatarGroup avatars={TEAM.slice(0, 2)} size="lg" />
    </div>
  ),
};
export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <AvatarGroup avatars={TEAM} max={2} />
    </TajUIProvider>
  ),
};
