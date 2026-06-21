import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  NumberField,
  SegmentedControl,
  Select,
  Separator,
  Switch,
  Tabs,
  Toaster,
  toast,
} from "../../src";

const meta: Meta = {
  title: "Examples/Settings",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Settings panel organising controls with Tabs — Switch rows, SegmentedControl, Select, and NumberField, with a Save action that fires a Toast.",
      },
    },
  },
  tags: ["!autodocs"],
};
export default meta;

type Story = StoryObj;

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold text-ink-1">{title}</div>
        {desc ? <div className="mt-0.5 text-[13px] text-ink-3">{desc}</div> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function GeneralTab() {
  const [theme, setTheme] = React.useState("light");
  const [lang, setLang] = React.useState("RU");
  const [currency, setCurrency] = React.useState("TJS");
  return (
    <Card variant="elevated">
      <CardContent className="px-6 py-2">
        <Row title="Тема оформления" desc="Светлая, тёмная или системная">
          <SegmentedControl
            value={theme}
            onChange={setTheme}
            options={[
              { value: "light", label: "Светлая" },
              { value: "dark", label: "Тёмная" },
              { value: "auto", label: "Авто" },
            ]}
          />
        </Row>
        <Separator />
        <Row title="Язык интерфейса">
          <SegmentedControl
            value={lang}
            onChange={setLang}
            options={[
              { value: "RU", label: "RU" },
              { value: "TJ", label: "TJ" },
              { value: "EN", label: "EN" },
            ]}
          />
        </Row>
        <Separator />
        <Row title="Валюта" desc="Используется в чеках и отчётах">
          <div className="w-44">
            <Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[
                { label: "Сомони (TJS)", value: "TJS" },
                { label: "Доллар (USD)", value: "USD" },
                { label: "Рубль (RUB)", value: "RUB" },
              ]}
            />
          </div>
        </Row>
      </CardContent>
    </Card>
  );
}

function PosTab() {
  const [copies, setCopies] = React.useState(1);
  const [threshold, setThreshold] = React.useState(10);
  const [autoOpen, setAutoOpen] = React.useState(true);
  const [rounding, setRounding] = React.useState(false);
  return (
    <Card variant="elevated">
      <CardContent className="px-6 py-2">
        <Row title="Копий чека" desc="Сколько копий печатать при оплате">
          <div className="w-32">
            <NumberField value={copies} onValueChange={setCopies} min={0} max={5} />
          </div>
        </Row>
        <Separator />
        <Row title="Порог низкого остатка" desc="Предупреждать, когда товара меньше">
          <div className="w-36">
            <NumberField
              value={threshold}
              onValueChange={setThreshold}
              min={0}
              step={5}
              suffix="шт."
            />
          </div>
        </Row>
        <Separator />
        <Row title="Авто-открытие смены" desc="Открывать смену при первом входе">
          <Switch checked={autoOpen} onCheckedChange={setAutoOpen} />
        </Row>
        <Separator />
        <Row title="Округление итога" desc="Округлять сумму чека до сомони">
          <Switch checked={rounding} onCheckedChange={setRounding} />
        </Row>
      </CardContent>
    </Card>
  );
}

function NotificationsTab() {
  const [email, setEmail] = React.useState(true);
  const [push, setPush] = React.useState(true);
  const [sms, setSms] = React.useState(false);
  return (
    <Card variant="elevated">
      <CardContent className="px-6 py-2">
        <Row title="Email-уведомления" desc="Ежедневные сводки и отчёты">
          <Switch checked={email} onCheckedChange={setEmail} />
        </Row>
        <Separator />
        <Row title="Push-уведомления" desc="Низкий остаток, крупные продажи">
          <Switch checked={push} onCheckedChange={setPush} />
        </Row>
        <Separator />
        <Row title="SMS" desc="Только критические события">
          <Switch checked={sms} onCheckedChange={setSms} />
        </Row>
      </CardContent>
    </Card>
  );
}

export const Default: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-ink-1">Настройки</h1>
          <p className="mt-1 text-[14px] text-ink-3">Магазин «Гулрух» · Касса 2</p>
        </div>
        <Button onClick={() => toast.success("Настройки сохранены")}>Сохранить</Button>
      </div>

      <div className="mb-6 grid gap-1.5 rounded-lg border border-hairline bg-ui-surface p-4 sm:max-w-md">
        <Label htmlFor="shop">Название магазина</Label>
        <Input id="shop" defaultValue="Гулрух Маркет" />
      </div>

      <Tabs
        tabs={[
          { label: "Общие", content: <div className="pt-4"><GeneralTab /></div> },
          { label: "Касса", content: <div className="pt-4"><PosTab /></div> },
          { label: "Уведомления", content: <div className="pt-4"><NotificationsTab /></div> },
        ]}
      />

      <Toaster />
    </div>
  ),
};
