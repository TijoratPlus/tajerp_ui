import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApprovalCard } from "../src/components/ApprovalCard";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const NOW = new Date("2026-10-21T10:00:00Z").getTime();

const items = [
  { name: "Мука 1 сорт, 50 кг", qty: 10, unit: "меш." },
  { name: "Сахар, 50 кг", qty: 6, unit: "меш." },
  { name: "Масло подсолнечное 5 л", qty: 24, unit: "шт" },
  { name: "Рис девзира", qty: 40, unit: "кг" },
  { name: "Чай зелёный №95", qty: 30, unit: "уп" },
];

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe("ApprovalCard", () => {
  it("renders an AI-drafted order with localized title, money, steps and escalation", async () => {
    renderWithUI(
      <ApprovalCard
        kind="purchase_order"
        amount={4850}
        requestedBy={{ name: "TijoratAI", kind: "ai" }}
        requestedAt={NOW - 5 * 60_000}
        now={NOW}
        items={items}
        details={[{ label: "Поставщик", value: "ООО «Сомон Трейд»" }]}
        steps={[
          { approver: "Фарход Каримов", status: "approved" },
          { approver: "Владелец", status: "pending" },
        ]}
        escalatesAt={NOW + 3 * 3_600_000}
        onApprove={() => {}}
        onReject={() => {}}
      />,
    );
    expect(screen.getByRole("article", { name: "Заказ поставщику" })).toBeInTheDocument();
    expect(screen.getByText("4 850,00 с")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
    expect(screen.getByText("Шаг 2 из 2")).toBeInTheDocument();
    expect(screen.getByText("Эскалация через 3 ч")).toBeInTheDocument();
    expect(screen.getByText("Ожидает решения")).toBeInTheDocument();
    expect(screen.getByText("Поставщик")).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("collapses items after 3 and expands with «ещё N»", async () => {
    renderWithUI(<ApprovalCard kind="purchase_order" items={items} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    const more = screen.getByRole("button", { name: "ещё 2" });
    expect(more).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(more);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Свернуть" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("shows loading on approve while its promise is pending and disables the others", async () => {
    const d = deferred();
    const onApprove = vi.fn(() => d.promise);
    renderWithUI(
      <ApprovalCard kind="sms" onApprove={onApprove} onEdit={() => {}} onReject={() => {}} />,
    );
    const approve = screen.getByRole("button", { name: "Одобрить" });
    await userEvent.click(approve);
    expect(onApprove).toHaveBeenCalledOnce();
    expect(approve).toHaveAttribute("aria-busy", "true");
    expect(approve).toBeDisabled();
    expect(screen.getByRole("button", { name: "Изменить" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Отклонить" })).toBeDisabled();

    await act(async () => {
      d.resolve();
      await d.promise;
    });
    expect(approve).not.toBeDisabled();
    expect(approve).not.toHaveAttribute("aria-busy");
    expect(screen.getByRole("button", { name: "Изменить" })).toBeEnabled();
  });

  it("requires a reject reason when requireRejectReason", async () => {
    const onReject = vi.fn();
    renderWithUI(<ApprovalCard kind="price_change" requireRejectReason onReject={onReject} />);
    await userEvent.click(screen.getByRole("button", { name: "Отклонить" }));
    const reason = screen.getByRole("textbox", { name: "Причина отказа" });
    expect(reason).toHaveFocus();

    await userEvent.click(screen.getByRole("button", { name: "Отклонить" }));
    expect(onReject).not.toHaveBeenCalled();
    expect(reason).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Укажите причину отказа")).toBeInTheDocument();
    await expectNoA11yViolations();

    await userEvent.type(reason, "  Цена выше рыночной ");
    await userEvent.click(screen.getByRole("button", { name: "Отклонить" }));
    expect(onReject).toHaveBeenCalledWith("Цена выше рыночной");
  });

  it("cancels the reject prompt with Escape", async () => {
    renderWithUI(<ApprovalCard kind="transfer" requireRejectReason onReject={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Отклонить" }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("rejects directly without a reason prompt by default", async () => {
    const onReject = vi.fn();
    renderWithUI(<ApprovalCard kind="invoice" onReject={onReject} />);
    await userEvent.click(screen.getByRole("button", { name: "Отклонить" }));
    expect(onReject).toHaveBeenCalledWith();
  });

  it("hides actions and shows the status for decided cards", async () => {
    renderWithUI(
      <ApprovalCard
        kind="sms"
        status="rejected"
        statusNote="Причина: клиенты уже оплатили"
        onApprove={() => {}}
      />,
    );
    expect(screen.getByText("Отклонено")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Одобрить" })).not.toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("uses Tajik strings and a custom kind", () => {
    renderWithUI(
      <ApprovalCard
        kind="write_off"
        title="Ҳисобдории мол"
        onApprove={() => {}}
        steps={[
          { approver: "Нигина", status: "pending" },
          { approver: "Соҳиб", status: "pending" },
        ]}
      />,
      { provider: { locale: "tg" } },
    );
    expect(screen.getByRole("button", { name: "Тасдиқ кардан" })).toBeInTheDocument();
    expect(screen.getByText("Қадами 1 аз 2")).toBeInTheDocument();
  });
});
