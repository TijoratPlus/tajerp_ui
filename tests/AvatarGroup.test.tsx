import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it } from "vitest";

import { AvatarGroup } from "../src";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const PEOPLE = [
  { name: "Зарина Каримова" },
  { name: "Фаррух Раҳимов", src: null },
  { name: "Шаҳноза Ғафорова" },
  { name: "Ҷамшед Қодиров" },
  { name: "Мунира Юсупова" },
];

describe("AvatarGroup", () => {
  it("shows `max` avatars plus a counter and names everyone", async () => {
    renderWithUI(<AvatarGroup avatars={PEOPLE} />);
    const group = screen.getByRole("img", {
      name: "Зарина Каримова, Фаррух Раҳимов, Шаҳноза Ғафорова и ещё 2",
    });
    expect(group).toHaveTextContent("ЗК");
    expect(group).toHaveTextContent("+2");
    await expectNoA11yViolations();
  });

  it("shows the full list in a tooltip on focus", async () => {
    renderWithUI(<AvatarGroup avatars={PEOPLE} max={2} />);
    await userEvent.tab();
    const tips = await screen.findAllByText("Мунира Юсупова");
    expect(tips.length).toBeGreaterThan(0);
  });

  it("renders all avatars when under the limit, without a counter (Tajik)", () => {
    renderWithUI(<AvatarGroup avatars={PEOPLE.slice(0, 2)} tooltip={false} />, {
      provider: { locale: "tg" },
    });
    const group = screen.getByRole("img", { name: "Зарина Каримова, Фаррух Раҳимов" });
    expect(group).not.toHaveTextContent("+");
    expect(group).not.toHaveAttribute("tabindex");
  });

  it("uses the Tajik counter text", () => {
    renderWithUI(<AvatarGroup avatars={PEOPLE} max={1} />, { provider: { locale: "tg" } });
    expect(screen.getByRole("img", { name: "Зарина Каримова ва боз 4" })).toBeInTheDocument();
  });
});
