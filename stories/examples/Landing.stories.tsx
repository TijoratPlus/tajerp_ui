import type { Meta, StoryObj } from "@storybook/react";
import {
  BarChart3,
  Boxes,
  Check,
  CreditCard,
  ShieldCheck,
  Smartphone,
  Users,
  Zap,
} from "lucide-react";
import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  Link,
  Pill,
  TajERPLogo,
} from "../../src";

const meta: Meta = {
  title: "Examples/Landing",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Marketing landing page: nav, hero with CTAs, feature cards, a pricing section, and an FAQ built from the Accordion.",
      },
    },
  },
  tags: ["!autodocs"],
};
export default meta;

type Story = StoryObj;

const features = [
  { icon: <Zap />, title: "Быстрые продажи", text: "Оформление чека за секунды — работает даже офлайн." },
  { icon: <Boxes />, title: "Умный склад", text: "Остатки в реальном времени, авто-заказ поставщикам." },
  { icon: <BarChart3 />, title: "Аналитика", text: "Выручка, маржа и прогнозы на одном дашборде." },
  { icon: <CreditCard />, title: "Любая оплата", text: "QR, карты, рассрочка и наличные из коробки." },
  { icon: <Users />, title: "Клиенты и лояльность", text: "База клиентов, бонусы и персональные скидки." },
  { icon: <Smartphone />, title: "Любое устройство", text: "Планшет, телефон или десктоп — единый интерфейс." },
];

const plans = [
  { name: "Старт", price: "0", note: "1 касса · базовый склад", cta: "Начать бесплатно", featured: false, perks: ["1 касса", "До 100 товаров", "Базовые отчёты"] },
  { name: "Бизнес", price: "290", note: "до 5 касс · аналитика", cta: "Выбрать Бизнес", featured: true, perks: ["До 5 касс", "Безлимит товаров", "Полная аналитика", "Лояльность"] },
  { name: "Сеть", price: "790", note: "филиалы · API", cta: "Связаться", featured: false, perks: ["Безлимит касс", "Мульти-филиал", "API и интеграции", "Менеджер 24/7"] },
];

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-ui-bg">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-hairline bg-ui-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3.5">
          <TajERPLogo className="text-[26px]" />
          <nav className="ml-4 hidden items-center gap-6 md:flex">
            <Link href="#" variant="subtle">Возможности</Link>
            <Link href="#" variant="subtle">Тарифы</Link>
            <Link href="#" variant="subtle">Клиенты</Link>
            <Link href="#" variant="subtle">Документация</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost">Войти</Button>
            <Button>Попробовать</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="mb-6 flex justify-center">
          <Pill>🚀 Новое: офлайн-режим касс</Pill>
        </div>
        <h1 className="mx-auto max-w-3xl text-[44px] font-extrabold leading-[1.05] tracking-tight text-ink-1">
          POS и учёт для современной торговли в Таджикистане
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-ink-2">
          Tijorat+ объединяет кассу, склад, финансы и аналитику в одном
          приложении. Запуск за 10 минут — без обучения.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg">Начать бесплатно</Button>
          <Button size="lg" variant="outline">Смотреть демо</Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-ink-3">
          <span className="inline-flex items-center gap-1.5"><Check className="size-4 text-tj-success" /> 14 дней бесплатно</span>
          <span className="inline-flex items-center gap-1.5"><Check className="size-4 text-tj-success" /> Без карты</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-tj-success" /> Данные в РТ</span>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            ["3 200+", "магазинов"],
            ["₸ 1.2 млрд", "оборот/мес"],
            ["99.9%", "аптайм"],
            ["4.9★", "рейтинг"],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="text-[26px] font-bold text-ink-1">{v}</div>
              <div className="text-[13px] text-ink-3">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <Badge tone="brand">Возможности</Badge>
          <h2 className="mt-3 text-[32px] font-bold text-ink-1">Всё для торговли в одном месте</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} variant="elevated">
              <CardContent className="p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-mist text-mist-ink [&>svg]:size-5">
                  {f.icon}
                </span>
                <h3 className="mt-4 text-[16px] font-bold text-ink-1">{f.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-3">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <Badge tone="brand">Тарифы</Badge>
          <h2 className="mt-3 text-[32px] font-bold text-ink-1">Простые цены без сюрпризов</h2>
          <p className="mt-2 text-[14px] text-ink-3">Сомони в месяц. Отмена в любой момент.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.name}
              variant={p.featured ? "strong" : "elevated"}
              className={p.featured ? "relative border-brand/40" : "relative"}
            >
              <CardContent className="p-6">
                {p.featured ? (
                  <Badge tone="solid" className="absolute right-5 top-5">
                    Популярный
                  </Badge>
                ) : null}
                <h3 className="text-[15px] font-bold text-ink-2">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[40px] font-extrabold leading-none text-ink-1">{p.price}</span>
                  <span className="text-[14px] text-ink-3">c./мес</span>
                </div>
                <p className="mt-1.5 text-[13px] text-ink-3">{p.note}</p>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-[13.5px] text-ink-2">
                      <Check className="size-4 shrink-0 text-tj-success" /> {perk}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={p.featured ? "solid" : "outline"}
                >
                  {p.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <h2 className="mb-6 text-center text-[32px] font-bold text-ink-1">Частые вопросы</h2>
        <Card variant="elevated">
          <CardContent className="px-6 py-1">
            <Accordion type="single" collapsible defaultValue="q1">
              <AccordionItem value="q1">
                <AccordionTrigger>Нужно ли специальное оборудование?</AccordionTrigger>
                <AccordionContent>
                  Нет. Tijorat+ работает на любом планшете, телефоне или компьютере.
                  Поддерживаются фискальные принтеры и сканеры по Bluetooth.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>Что будет при отключении интернета?</AccordionTrigger>
                <AccordionContent>
                  Касса продолжает принимать оплату офлайн и синхронизирует данные
                  автоматически при восстановлении связи.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>Можно ли перенести данные из другой системы?</AccordionTrigger>
                <AccordionContent>
                  Да, мы бесплатно импортируем товары, остатки и клиентов из Excel
                  или вашей текущей программы.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4">
                <AccordionTrigger>Есть ли пробный период?</AccordionTrigger>
                <AccordionContent>14 дней бесплатно, карта не требуется.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="overflow-hidden rounded-2xl bg-brand-deep px-8 py-14 text-center">
          <h2 className="text-[30px] font-bold text-white">Готовы продавать умнее?</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-white/70">
            Присоединяйтесь к тысячам магазинов на Tijorat+. Первая касса —
            бесплатно навсегда.
          </p>
          <div className="mt-7 flex justify-center">
            <Button size="lg">Создать аккаунт</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-8">
          <TajERPLogo className="text-[20px]" />
          <span className="text-[13px] text-ink-3">© 2026 Tijorat+. Все права защищены.</span>
          <div className="ml-auto flex gap-5">
            <Link href="#" variant="muted">Политика</Link>
            <Link href="#" variant="muted">Условия</Link>
            <Link href="https://www.tijorat.plus" variant="muted" external>tijorat.plus</Link>
          </div>
        </div>
      </footer>
    </div>
  ),
};
