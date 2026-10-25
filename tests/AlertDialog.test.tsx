import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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
  ConfirmHost,
  confirm,
} from "../src/components/AlertDialog";
import { expectNoA11yViolations, renderWithUI } from "./utils";

function VoidReceipt({ onVoid }: { onVoid: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Аннулировать чек</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Аннулировать чек № 58?</AlertDialogTitle>
          <AlertDialogDescription>Сумма 1 234,50 с вернётся покупателю.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction tone="danger" onClick={onVoid}>
            Аннулировать
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe("AlertDialog", () => {
  it("opens as an alertdialog, focuses Cancel and confirms", async () => {
    const user = userEvent.setup();
    const onVoid = vi.fn();
    renderWithUI(<VoidReceipt onVoid={onVoid} />);

    await user.click(screen.getByRole("button", { name: "Аннулировать чек" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Аннулировать чек № 58?" });
    expect(dialog).toHaveAccessibleDescription("Сумма 1 234,50 с вернётся покупателю.");
    expect(screen.getByRole("button", { name: "Отмена" })).toHaveFocus();
    await expectNoA11yViolations();

    await user.click(screen.getByRole("button", { name: "Аннулировать" }));
    expect(onVoid).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("cancels on Escape and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    const onVoid = vi.fn();
    renderWithUI(<VoidReceipt onVoid={onVoid} />);
    const trigger = screen.getByRole("button", { name: "Аннулировать чек" });
    trigger.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("alertdialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(onVoid).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });

  it("styles Action by tone", async () => {
    renderWithUI(
      <AlertDialog open>
        <AlertDialogContent aria-describedby={undefined}>
          <AlertDialogTitle>Одобрить заказ поставщику?</AlertDialogTitle>
          <AlertDialogAction>Одобрить</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByRole("button", { name: "Одобрить" })).toHaveAttribute(
      "data-tone",
      "brand",
    );
  });
});

describe("confirm()", () => {
  it("resolves true when confirmed, with locale default labels", async () => {
    const user = userEvent.setup();
    renderWithUI(<ConfirmHost />);

    let result: Promise<boolean> | undefined;
    act(() => {
      result = confirm({
        title: "Удалить счёт № 1042?",
        description: "Это действие нельзя отменить.",
        tone: "danger",
      });
    });

    const dialog = await screen.findByRole("alertdialog", { name: "Удалить счёт № 1042?" });
    expect(dialog).toHaveAccessibleDescription("Это действие нельзя отменить.");
    expect(screen.getByRole("button", { name: "Отмена" })).toHaveFocus();
    await expectNoA11yViolations();

    await user.click(screen.getByRole("button", { name: "Подтвердить" }));
    await expect(result).resolves.toBe(true);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("resolves false on cancel and on Escape; uses custom labels and locale", async () => {
    const user = userEvent.setup();
    renderWithUI(<ConfirmHost />, { provider: { locale: "tg" } });

    let first: Promise<boolean> | undefined;
    act(() => {
      first = confirm({ title: "Фиристодани SMS ба қарздорон?" });
    });
    await screen.findByRole("alertdialog");
    await user.click(screen.getByRole("button", { name: "Бекор кардан" }));
    await expect(first).resolves.toBe(false);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());

    let second: Promise<boolean> | undefined;
    act(() => {
      second = confirm({
        title: "Нест кардани мол?",
        confirmLabel: "Нест кардан",
        cancelLabel: "Не",
      });
    });
    await screen.findByRole("alertdialog", { name: "Нест кардани мол?" });
    expect(screen.getByRole("button", { name: "Нест кардан" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await expect(second).resolves.toBe(false);
  });

  it("queues concurrent requests", async () => {
    const user = userEvent.setup();
    renderWithUI(<ConfirmHost />);
    let a: Promise<boolean> | undefined;
    let b: Promise<boolean> | undefined;
    act(() => {
      a = confirm({ title: "Первый" });
      b = confirm({ title: "Второй" });
    });
    await screen.findByRole("alertdialog", { name: "Первый" });
    await user.click(screen.getByRole("button", { name: "Подтвердить" }));
    await expect(a).resolves.toBe(true);
    await screen.findByRole("alertdialog", { name: "Второй" });
    await user.click(screen.getByRole("button", { name: "Отмена" }));
    await expect(b).resolves.toBe(false);
  });
});
