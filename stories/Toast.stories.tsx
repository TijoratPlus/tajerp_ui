import type { Meta, StoryObj } from "@storybook/react";
import { Button, Toaster, toast } from "../src";

const meta: Meta = {
  title: "Feedback/Toast",
  parameters: {
    docs: {
      description: {
        component:
          "Imperative `toast.{success,error,warning,info}()` + a `<Toaster/>` mounted once near the app root.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const Playground: Story = {
  render: () => (
    <div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => toast.success("Сохранено", { description: "Накладная №НК-2041 проведена." })}>
          Success
        </Button>
        <Button variant="danger" onClick={() => toast.error("Ошибка", { description: "Не удалось синхронизировать." })}>
          Error
        </Button>
        <Button variant="outline" onClick={() => toast.warning("Внимание", { description: "Низкий остаток на складе." })}>
          Warning
        </Button>
        <Button variant="subtle" onClick={() => toast.info("Подсказка", { description: "Смена откроется автоматически." })}>
          Info
        </Button>
      </div>
      <Toaster />
    </div>
  ),
};
