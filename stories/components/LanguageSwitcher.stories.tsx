import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { LanguageSwitcher, TajUIProvider, type Locale } from "../../src";

const meta: Meta<typeof LanguageSwitcher> = {
  title: "Components/Navigation/LanguageSwitcher",
  component: LanguageSwitcher,
  parameters: {
    docs: {
      description: {
        component:
          "RU / TJ / EN interface-language switcher. Use `segmented` in topbars and login screens, `select` in settings forms. It only reports the choice: pass it to `<TajUIProvider locale>` and persist it.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["segmented", "select"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
};
export default meta;

type Story = StoryObj<typeof LanguageSwitcher>;

export const Playground: Story = {
  render: (args) => {
    const [locale, setLocale] = React.useState<Locale>("ru");
    const greeting: Record<Locale, string> = {
      ru: "Добро пожаловать в Tijorat+",
      tg: "Хуш омадед ба Tijorat+",
      en: "Welcome to Tijorat+",
    };
    return (
      <TajUIProvider locale={locale}>
        <div className="flex flex-col items-start gap-3">
          <LanguageSwitcher
            {...args}
            value={locale}
            onValueChange={setLocale}
          />
          <p className="text-ui-body text-ink-2">{greeting[locale]}</p>
        </div>
      </TajUIProvider>
    );
  },
};

export const Select: Story = {
  args: { variant: "select", showLabel: true, defaultValue: "tg" },
};

export const Small: Story = {
  args: { size: "sm", defaultValue: "en" },
};
