import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ChipInput, Label, TajUIProvider } from "../../src";

const CONTACTS = [
  { value: "zarina@somon.tj", label: "Зарина Каримова", description: "zarina@somon.tj" },
  { value: "farrukh@somon.tj", label: "Фаррух Раҳимов", description: "farrukh@somon.tj" },
  { value: "info@pamirfoods.tj", label: "Pamir Foods", description: "info@pamirfoods.tj" },
];
const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

const meta: Meta<typeof ChipInput> = {
  title: "Components/Inputs/ChipInput",
  component: ChipInput,
  parameters: {
    docs: {
      description: {
        component:
          "Tag / recipient field. Enter, comma or paste (comma, semicolon or newline separated) turn text into chips; Backspace on an empty field removes the last one. Optional async `search` shows suggestions (arrows + Enter), `validate` rejects bad values, `allowCustom={false}` accepts suggestions only.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ChipInput>;

export const EmailRecipients: Story = {
  render: () => {
    const [to, setTo] = React.useState<string[]>(["zarina@somon.tj"]);
    return (
      <div className="flex max-w-lg flex-col gap-1.5">
        <Label htmlFor="mail-to">Кому</Label>
        <ChipInput
          id="mail-to"
          value={to}
          onValueChange={setTo}
          validate={isEmail}
          placeholder="Введите e-mail или имя"
          search={async (q) => {
            await new Promise((r) => setTimeout(r, 300));
            const s = q.toLowerCase();
            return CONTACTS.filter((c) => c.label.toLowerCase().includes(s) || c.value.includes(s));
          }}
        />
      </div>
    );
  },
};

export const Tags: Story = {
  render: () => (
    <div className="max-w-lg">
      <ChipInput aria-label="Теги" defaultValue={["VIP", "Опт"]} placeholder="Добавьте тег" />
    </div>
  ),
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <div className="max-w-lg">
        <ChipInput aria-label="Барчаспҳо" defaultValue={["Муштарии доимӣ", "Хуҷанд"]} />
      </div>
    </TajUIProvider>
  ),
};
