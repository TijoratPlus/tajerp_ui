import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from "../src/components/DescriptionList";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("DescriptionList", () => {
  it("renders items as dt/dd pairs", async () => {
    const { container } = renderWithUI(
      <DescriptionList
        items={[
          { term: "Клиент", description: "ООО «Сомон Савдо»" },
          {
            term: "Телефон",
            description: "+992 93 123 45 67",
            hint: "WhatsApp",
          },
        ]}
      />,
    );
    expect(container.querySelectorAll("dt")).toHaveLength(2);
    expect(container.querySelectorAll("dd")).toHaveLength(2);
    expect(screen.getByText("Клиент").tagName).toBe("DT");
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(container.querySelector("dl")).toHaveAttribute(
      "data-layout",
      "inline",
    );
    await expectNoA11yViolations();
  });

  it("copies the value and announces it", async () => {
    const user = userEvent.setup();
    renderWithUI(
      <DescriptionList
        layout="grid"
        columns={3}
        items={[
          { term: "ИНН", description: "020 123 456", copyable: "020123456" },
          { term: "Счёт", description: "TJ12 3456", copyable: true },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Копировать: ИНН" }));
    expect(await navigator.clipboard.readText()).toBe("020123456");
    const statuses = screen.getAllByRole("status");
    await waitFor(() => expect(statuses[0]).toHaveTextContent("Скопировано"));

    await user.click(screen.getByRole("button", { name: "Копировать: Счёт" }));
    expect(await navigator.clipboard.readText()).toBe("TJ12 3456");
    await expectNoA11yViolations();
  });

  it("supports composed parts, stacked layout and Tajik labels", async () => {
    const user = userEvent.setup();
    renderWithUI(
      <DescriptionList layout="stacked" dense>
        <DescriptionItem>
          <DescriptionTerm>Суроға</DescriptionTerm>
          <DescriptionDetails copyable>
            Душанбе, кӯчаи Рӯдакӣ 45
          </DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>,
      { provider: { locale: "tg" } },
    );
    await user.click(
      screen.getByRole("button", { name: "Нусха бардоштан: Суроға" }),
    );
    expect(await navigator.clipboard.readText()).toBe(
      "Душанбе, кӯчаи Рӯдакӣ 45",
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Нусха бардошта шуд",
      ),
    );
    await expectNoA11yViolations();
  });
});
