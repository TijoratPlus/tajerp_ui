import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Input, Label, SegmentedControl, Select, Switch, Textarea } from "../src";

const meta: Meta = { title: "Primitives/Form" };
export default meta;

type Story = StoryObj;

export const TextFields: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <Label htmlFor="name">Имя клиента</Label>
        <Input id="name" placeholder="Введите имя" />
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <Label htmlFor="cat">Категория</Label>
        <Select id="cat" defaultValue="">
          <option value="" disabled>
            Выберите…
          </option>
          <option>Напитки</option>
          <option>Выпечка</option>
        </Select>
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <Label htmlFor="note">Примечание</Label>
        <Textarea id="note" placeholder="Комментарий к заказу" />
      </div>
    </div>
  ),
};

export const Toggles: Story = {
  render: () => {
    const [lang, setLang] = React.useState("RU");
    const [on, setOn] = React.useState(true);
    return (
      <div style={{ display: "grid", gap: 20 }}>
        <SegmentedControl
          value={lang}
          onChange={setLang}
          options={[
            { value: "RU", label: "RU" },
            { value: "TJ", label: "TJ" },
            { value: "EN", label: "EN" },
          ]}
        />
        <div style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
          <Switch checked={on} onCheckedChange={setOn} />
          <span style={{ color: "var(--ui-ink-2)" }}>Тёмная тема</span>
        </div>
      </div>
    );
  },
};
