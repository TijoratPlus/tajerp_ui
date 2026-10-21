import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Plus } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Breadcrumb,
  BranchSwitcher,
  Button,
  LanguageSwitcher,
  SearchField,
  Topbar,
  TopbarTitle,
} from "../../src";

const meta: Meta<typeof Topbar> = {
  title: "Components/Navigation/Topbar",
  component: Topbar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Sticky application header with `start` (title / breadcrumbs), `center` (search) and `end` (actions, BranchSwitcher, LanguageSwitcher, user menu) slots. Use it as the `topbar` of an `<AppShell>`, where it adds the mobile menu button automatically.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Topbar>;

export const Default: Story = {
  render: () => (
    <Topbar
      start={
        <Breadcrumb
          items={[{ label: "Склад", href: "#" }, { label: "Поступления" }]}
        />
      }
      center={
        <div className="w-full max-w-md">
          <SearchField placeholder="Поиск по накладным…" aria-label="Поиск" />
        </div>
      }
      end={
        <>
          <Button variant="ghost" size="icon" aria-label="Уведомления">
            <Bell className="size-4.5" aria-hidden />
          </Button>
          <Button iconLeft={<Plus className="size-4" aria-hidden />}>
            Накладная
          </Button>
          <Avatar className="size-8">
            <AvatarFallback className="text-ui-caption">АН</AvatarFallback>
          </Avatar>
        </>
      }
    />
  ),
};

export const WithTitle: Story = {
  render: () => (
    <Topbar
      start={<TopbarTitle>Ҳисоботи фурӯш</TopbarTitle>}
      end={
        <>
          <BranchSwitcher
            variant="compact"
            allowAll
            defaultValue="all"
            branches={[
              { id: "dsh", name: "Душанбе", kind: "store" },
              { id: "khj", name: "Хуҷанд", kind: "store" },
            ]}
            labels={{ allBranches: "Ҳамаи филиалҳо" }}
            align="end"
          />
          <LanguageSwitcher size="sm" defaultValue="tg" />
        </>
      }
    />
  ),
};
