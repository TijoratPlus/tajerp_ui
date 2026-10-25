import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Button, EmojiPicker, EmojiPickerPanel, IconPicker, Input, TajUIProvider } from "../../src";

const meta: Meta<typeof EmojiPicker> = {
  title: "Components/Inputs/EmojiPicker",
  component: EmojiPicker,
  parameters: {
    docs: {
      description: {
        component:
          "Emoji popover with search (English gemoji names and tags) and categories, for comments, notes and reactions. Arrow keys move through the grid. `EmojiPickerPanel` is the same grid without a popover (editor toolbars, custom menus). `IconPicker` shows the chosen emoji as its trigger — for view, board or pipeline icons.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof EmojiPicker>;

export const InComment: Story = {
  render: () => {
    const [text, setText] = React.useState("Отличная сделка ");
    return (
      <div className="flex max-w-md items-center gap-2">
        <Input aria-label="Комментарий" value={text} onChange={(e) => setText(e.target.value)} />
        <EmojiPicker onSelect={(e) => setText((t) => t + e)} />
      </div>
    );
  },
};

export const CustomTrigger: Story = {
  render: () => (
    <EmojiPicker
      onSelect={(e) => console.info(e)}
      trigger={
        <Button variant="subtle" size="sm">
          Реакция 👍
        </Button>
      }
    />
  ),
};

export const InlinePanel: Story = {
  render: () => (
    <div className="inline-block !rounded-lg border border-hairline bg-ui-surface p-2">
      <EmojiPickerPanel autoFocusSearch={false} onSelect={(e) => console.info(e)} />
    </div>
  ),
};

export const Icon: Story = {
  render: () => {
    const [icon, setIcon] = React.useState("🚀");
    return (
      <div className="flex items-center gap-2">
        <IconPicker value={icon} onValueChange={setIcon} />
        <span className="text-ui-body">Представление «Горячие лиды»</span>
      </div>
    );
  },
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <div className="flex items-center gap-2">
        <EmojiPicker onSelect={() => {}} />
        <IconPicker defaultValue="📞" />
        <span className="text-ui-body">Занги муштарӣ</span>
      </div>
    </TajUIProvider>
  ),
};
