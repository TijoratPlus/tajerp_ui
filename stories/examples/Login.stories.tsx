import type { Meta, StoryObj } from "@storybook/react";
import { Check } from "lucide-react";
import * as React from "react";
import {
  Button,
  Checkbox,
  Input,
  Label,
  Link,
  SegmentedControl,
  TajERPLogo,
} from "../../src";

const meta: Meta = {
  title: "Examples/Login",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Split-screen sign-in: a dark brand panel beside a form built from Label, Input, Checkbox, Button, and Link.",
      },
    },
  },
  tags: ["!autodocs"],
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const [lang, setLang] = React.useState("RU");
    const [remember, setRemember] = React.useState(true);

    return (
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-deep p-12 lg:flex">
          <TajERPLogo className="text-[30px]" />
          <div>
            <h2 className="max-w-sm text-[30px] font-bold leading-tight text-white">
              Управляйте магазином из любой точки
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/70">
              Касса, склад и аналитика Tijorat+ — в одном аккаунте. Войдите,
              чтобы открыть смену.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {["Офлайн-режим касс", "Аналитика в реальном времени", "Данные хранятся в РТ"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2.5 text-[14px] text-white/85">
                    <span className="grid size-5 place-items-center rounded-full bg-white/15">
                      <Check className="size-3" />
                    </span>
                    {t}
                  </li>
                ),
              )}
            </ul>
          </div>
          <p className="text-[12px] text-white/40">© 2026 Tijorat+</p>
        </div>

        {/* Form */}
        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <TajERPLogo className="text-[26px]" />
            </div>

            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-[24px] font-bold text-ink-1">Вход в систему</h1>
                <p className="mt-1 text-[14px] text-ink-3">Рады видеть вас снова 👋</p>
              </div>
              <SegmentedControl
                size="sm"
                value={lang}
                onChange={setLang}
                options={[
                  { value: "RU", label: "RU" },
                  { value: "TJ", label: "TJ" },
                  { value: "EN", label: "EN" },
                ]}
              />
            </div>

            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid gap-1.5">
                <Label htmlFor="email">Эл. почта или телефон</Label>
                <Input id="email" type="email" placeholder="you@magazin.tj" />
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pass">Пароль</Label>
                  <Link href="#" variant="default" className="text-[12.5px]">
                    Забыли пароль?
                  </Link>
                </div>
                <Input id="pass" type="password" placeholder="••••••••" />
              </div>

              <label className="flex items-center gap-2 text-[13.5px] text-ink-2">
                <Checkbox checked={remember} onCheckedChange={setRemember} />
                Запомнить меня на этом устройстве
              </label>

              <Button type="submit" size="lg" className="mt-1 w-full">
                Войти
              </Button>
            </form>

            <p className="mt-6 text-center text-[13.5px] text-ink-3">
              Нет аккаунта?{" "}
              <Link href="#" variant="default">
                Создать магазин
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  },
};
