import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  ConfirmHost,
  TajUIProvider,
  confirm,
} from "../../src";

const meta: Meta<typeof AlertDialog> = {
  title: "Components/Overlays/AlertDialog",
  component: AlertDialog,
  parameters: {
    docs: {
      description: {
        component:
          "Interrupting confirmation that needs an explicit answer: voiding a receipt, deleting an invoice, approving a TijoratAI draft. No close button and no outside-click dismissal; Escape cancels and focus starts on Cancel. For one-off questions from event handlers, mount `<ConfirmHost />` once (next to `<Toaster />`) and `await confirm({ … })`.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof AlertDialog>;

export const VoidReceipt: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="danger">Аннулировать чек</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Аннулировать чек № 58?</AlertDialogTitle>
          <AlertDialogDescription>
            Сумма 1 234,50 с вернётся покупателю, товар — на склад. Чек останется в
            журнале смены с пометкой «аннулирован».
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction tone="danger">Аннулировать</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const ApproveAIDraft: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Отправить заказ поставщику</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Отправить заказ, подготовленный TijoratAI?</AlertDialogTitle>
          <AlertDialogDescription>
            12 позиций на 18 450,00 с для ООО «Душанбе Агро». После отправки изменить заказ
            можно только через поставщика.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Проверить ещё раз</AlertDialogCancel>
          <AlertDialogAction>Отправить</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

function ConfirmDemo({ tajik }: { tajik?: boolean }) {
  const [log, setLog] = React.useState<string>("—");
  return (
    <div className="flex flex-col items-start gap-3">
      <ConfirmHost />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="danger"
          onClick={async () => {
            const ok = await confirm(
              tajik
                ? {
                    title: "Ҳисобномаи № 1042 нест карда шавад?",
                    description: "Ин амалро бекор кардан ғайриимкон аст.",
                    confirmLabel: "Нест кардан",
                    tone: "danger",
                  }
                : {
                    title: "Удалить счёт № 1042?",
                    description: "Это действие нельзя отменить.",
                    confirmLabel: "Удалить",
                    tone: "danger",
                  },
            );
            setLog(ok ? "confirmed" : "cancelled");
          }}
        >
          {tajik ? "Нест кардан" : "Удалить счёт"}
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const ok = await confirm({
              title: tajik
                ? "Ба 14 қарздор SMS фиристода шавад?"
                : "Отправить SMS 14 должникам?",
            });
            setLog(ok ? "confirmed" : "cancelled");
          }}
        >
          {tajik ? "SMS ба қарздорон" : "SMS должникам"}
        </Button>
      </div>
      <p className="text-ui-label text-ink-3">confirm() → {log}</p>
    </div>
  );
}

export const ImperativeConfirm: Story = {
  name: "confirm() API",
  render: () => <ConfirmDemo />,
};

export const Tajik: Story = {
  name: "Tajik (Тоҷикӣ)",
  render: () => (
    <TajUIProvider locale="tg">
      <ConfirmDemo tajik />
    </TajUIProvider>
  ),
};
