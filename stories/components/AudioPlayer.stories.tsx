import type { Meta, StoryObj } from "@storybook/react";
import { AudioPlayer, TajUIProvider } from "../../src";

// Short public-domain sample served by MDN.
const SAMPLE = "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

const meta: Meta<typeof AudioPlayer> = {
  title: "Components/Data Display/AudioPlayer",
  component: AudioPlayer,
  parameters: {
    docs: {
      description: {
        component:
          "Compact player for call recordings and voice notes in the activity feed: play/pause, seek slider (arrow keys work), current/total time and a speed menu (0.5–2×). A recording that fails to load shows an error instead of controls.",
      },
    },
  },
  args: { src: SAMPLE },
};
export default meta;
type Story = StoryObj<typeof AudioPlayer>;

export const CallRecording: Story = {
  render: (args) => (
    <div className="flex max-w-md flex-col gap-1">
      <span className="text-ui-label text-ink-2">Исходящий звонок · Зарина Каримова · 12 мая</span>
      <AudioPlayer {...args} />
    </div>
  ),
};

export const Broken: Story = { args: { src: "/missing-recording.mp3" } };

export const Tajik: Story = {
  render: (args) => (
    <TajUIProvider locale="tg">
      <div className="max-w-md">
        <AudioPlayer {...args} />
      </div>
    </TajUIProvider>
  ),
};
