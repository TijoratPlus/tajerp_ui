import type { Meta, StoryObj } from "@storybook/react";
import {
  BarChart3,
  Bell,
  Boxes,
  ShoppingCart,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import * as React from "react";
import {
  AppShell,
  Avatar,
  AvatarFallback,
  Breadcrumb,
  BranchSwitcher,
  Button,
  Card,
  CardContent,
  LanguageSwitcher,
  SearchField,
  Sidebar,
  type Branch,
  type Locale,
  type SidebarItem,
  TajERPLogo,
  TajUIProvider,
  Topbar,
} from "../../src";

const meta: Meta<typeof AppShell> = {
  title: "Components/Layout/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'Page frame for every TajERP app. Use it once at the root of a back-office screen: the sidebar is a fixed column on desktop and moves into a slide-in sheet below `mobileBreakpoint` (default `lg`), opened by the hamburger that `<Topbar>` adds automatically. Includes a skip link, a focusable `<main id="main-content">`, 100dvh height and safe-area insets. Resize the canvas below 1024px to see the mobile navigation.',
      },
    },
  },
  tags: ["!autodocs"],
};
export default meta;

type Story = StoryObj<typeof AppShell>;

const navItems: SidebarItem[] = [
  { id: "pos", label: "Касса", icon: <ShoppingCart />, href: "#pos" },
  {
    id: "stock",
    label: "Склад",
    icon: <Boxes />,
    children: [
      { id: "stock.items", label: "Остатки", href: "#stock" },
      { id: "stock.incoming", label: "Поступления", href: "#incoming" },
    ],
  },
  { id: "money", label: "Деньги", icon: <Wallet />, href: "#money" },
  {
    id: "customers",
    label: "Клиенты",
    icon: <Users />,
    href: "#customers",
    badge: 3,
  },
  { id: "staff", label: "Сотрудники", icon: <UserCog />, href: "#staff" },
  { id: "reports", label: "Отчёты", icon: <BarChart3 />, href: "#reports" },
];

const branches: Branch[] = [
  {
    id: "dsh-1",
    name: "Душанбе, Рудакӣ",
    address: "пр. Рудаки 12",
    kind: "store",
  },
  { id: "dsh-2", name: "Душанбе, Сино", address: "ул. Айни 48", kind: "store" },
  { id: "khj", name: "Худжанд", address: "ул. Ленина 5", kind: "store" },
  {
    id: "wh",
    name: "Центральный склад",
    address: "Промзона, 3",
    kind: "warehouse",
  },
];

function ShellDemo({ initialLocale = "ru" as Locale }) {
  const [locale, setLocale] = React.useState<Locale>(initialLocale);
  const [branch, setBranch] = React.useState("all");
  const [active, setActive] = React.useState("pos");

  return (
    <TajUIProvider locale={locale}>
      <AppShell
        sidebar={
          <Sidebar
            items={navItems}
            activeId={active}
            onSelect={(id) => setActive(id)}
            header={
              <div className="flex items-center gap-2.5">
                <TajERPLogo variant="icon" className="text-2xl" />
                <strong className="text-rail-ink">Tijorat+</strong>
              </div>
            }
          />
        }
        topbar={
          <Topbar
            start={
              <Breadcrumb
                className="hidden sm:flex"
                items={[{ label: "Главная", href: "#" }, { label: "Касса" }]}
              />
            }
            center={
              <div className="hidden w-full max-w-md md:block">
                <SearchField
                  placeholder="Поиск по товарам и клиентам…"
                  aria-label="Поиск"
                />
              </div>
            }
            end={
              <>
                <BranchSwitcher
                  variant="compact"
                  branches={branches}
                  allowAll
                  value={branch}
                  onValueChange={setBranch}
                  align="end"
                />
                <LanguageSwitcher
                  size="sm"
                  value={locale}
                  onValueChange={setLocale}
                  className="hidden sm:inline-flex"
                />
                <Button variant="ghost" size="icon" aria-label="Уведомления">
                  <Bell className="size-4.5" aria-hidden />
                </Button>
                <Avatar className="size-8">
                  <AvatarFallback className="text-ui-caption">
                    АН
                  </AvatarFallback>
                </Avatar>
              </>
            }
          />
        }
      >
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <div>
            <h1 className="text-xl font-bold text-ink-1">Касса</h1>
            <p className="text-ui-body text-ink-3">
              Филиал:{" "}
              {branch === "all"
                ? "все филиалы"
                : branches.find((b) => b.id === branch)?.name}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} variant="elevated">
                <CardContent className="flex h-32 items-center justify-center p-5 text-ui-body text-ink-3">
                  Блок содержимого {i + 1}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppShell>
    </TajUIProvider>
  );
}

export const Default: Story = {
  render: () => <ShellDemo />,
};

/** Тоҷикӣ: the skip link, menu button and branch picker follow the locale. */
export const Tajik: Story = {
  render: () => <ShellDemo initialLocale="tg" />,
};

/** Phone viewport: the sidebar lives in a sheet opened from the topbar. */
export const Mobile: Story = {
  render: () => <ShellDemo />,
  parameters: { viewport: { defaultViewport: "mobile1" } },
  globals: { viewport: { value: "mobile1" } },
};
