import type { Meta, StoryObj } from "@storybook/react";
import { WifiOff } from "lucide-react";
import * as React from "react";
import { Alert, Banner, Button, TajUIProvider } from "../../src";

const meta: Meta<typeof Alert> = {
  title: "Components/Feedback/Alert",
  component: Alert,
  parameters: {
    docs: {
      description: {
        component:
          'Inline `Alert` for notices tied to a page, form or card (failed sync, low stock, import result), and full-width `Banner` for app-level notices (offline mode, trial ending). Set `live` when the notice appears after the page loads: `danger`/`warning` become `role="alert"`, other tones `role="status"`. For short-lived confirmations use `toast`.',
      },
    },
  },
  args: {
    tone: "info",
    title: "Обновление цен",
    description: "Новые цены поставщика вступят в силу с понедельника.",
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["brand", "neutral", "success", "warning", "danger", "info"],
    },
    live: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <Alert {...args} />
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <Alert
        tone="brand"
        title="TijoratAI подготовил черновик"
        description="Заказ поставщику ЗП-00142 ждёт вашего утверждения."
      />
      <Alert
        tone="neutral"
        title="Смена открыта"
        description="Касса 2 · с 09:00"
      />
      <Alert
        tone="success"
        title="Импорт завершён"
        description="Загружено 1 248 товаров из 1С."
      />
      <Alert
        tone="warning"
        title="Мало товара"
        description="«Сахар 1 кг» — осталось 3 шт., минимальный остаток 20 шт."
      />
      <Alert
        tone="danger"
        title="Не удалось провести оплату"
        description="Терминал Alif Pay не ответил. Попробуйте снова или выберите наличные."
      />
      <Alert
        tone="info"
        title="Новая версия"
        description="Обновление установится при следующем закрытии смены."
      />
    </div>
  ),
};

export const WithActionsAndDismiss: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <div style={{ maxWidth: 560 }}>
        {open ? (
          <Alert
            tone="warning"
            title="Долг клиента превышает лимит"
            description="ООО «Сомон Савдо» должно 18 450,00 с при лимите 15 000,00 с."
            action={
              <>
                <Button size="sm">Отправить SMS</Button>
                <Button size="sm" variant="ghost">
                  Открыть карточку
                </Button>
              </>
            }
            onDismiss={() => setOpen(false)}
          />
        ) : (
          <Button variant="outline" onClick={() => setOpen(true)}>
            Показать снова
          </Button>
        )}
      </div>
    );
  },
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <div className="flex max-w-xl flex-col gap-3">
        <Alert
          tone="success"
          title="Ҳисобнома пардохт шуд"
          description="Мизоҷ 2 450,00 с тавассути Эсхата пардохт кард."
          onDismiss={() => {}}
        />
        <Banner tone="warning" icon={<WifiOff />}>
          Пайваст нест — фурӯш дар дастгоҳ нигоҳ дошта мешавад
        </Banner>
      </div>
    </TajUIProvider>
  ),
};

export const Banners: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="flex flex-col">
      <Banner tone="warning" live icon={<WifiOff />} title="Нет соединения">
        — продажи сохраняются на устройстве и отправятся, когда сеть вернётся.
      </Banner>
      <Banner
        tone="brand"
        action={
          <Button size="sm" variant="subtle">
            Выбрать тариф
          </Button>
        }
        onDismiss={() => {}}
      >
        Пробный период «Бизнес» заканчивается через 3 дня.
      </Banner>
      <Banner tone="info">Плановые работы 25 октября с 02:00 до 03:00.</Banner>
      <Banner tone="danger" title="Лимит тарифа">
        Достигнут предел 3 касс. Новая касса не будет подключена.
      </Banner>
    </div>
  ),
};

export const StickyBanner: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div style={{ height: 320, overflow: "auto" }}>
      <Banner tone="warning" sticky icon={<WifiOff />}>
        Нет соединения — продажи сохраняются на устройстве
      </Banner>
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} className="text-ui-body text-ink-2">
            Чек №{1040 + i} · {(i + 1) * 37},00 с
          </p>
        ))}
      </div>
    </div>
  ),
};
