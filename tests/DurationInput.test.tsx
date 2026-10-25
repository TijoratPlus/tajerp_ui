import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { DurationInput } from "../src/components/DurationInput";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("DurationInput", () => {
  it("splits seconds into parts and emits the total", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <DurationInput
        aria-label="Длительность звонка"
        defaultValue={90061}
        showDays
        showSeconds
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole("group", { name: "Длительность звонка" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Дни" })).toHaveValue("1");
    expect(screen.getByRole("textbox", { name: "Часы" })).toHaveValue("1");
    expect(screen.getByRole("textbox", { name: "Минуты" })).toHaveValue("1");
    expect(screen.getByRole("textbox", { name: "Секунды" })).toHaveValue("1");
    await expectNoA11yViolations();

    fireEvent.change(screen.getByRole("textbox", { name: "Минуты" }), { target: { value: "30" } });
    expect(onValueChange).toHaveBeenLastCalledWith(86400 + 3600 + 30 * 60 + 1);
  });

  it("steps with arrow keys and works controlled", async () => {
    function Harness() {
      const [value, setValue] = React.useState(3600);
      return (
        <>
          <DurationInput aria-label="Время" value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      );
    }
    renderWithUI(<Harness />);
    const minutes = screen.getByRole("textbox", { name: "Минуты" });
    minutes.focus();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(screen.getByRole("status")).toHaveTextContent("3720");
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("status")).toHaveTextContent("3660");
    // 90 minutes normalise to 1 h 30 min (no days part: hours keep growing).
    fireEvent.change(minutes, { target: { value: "90" } });
    expect(screen.getByRole("status")).toHaveTextContent(String(3600 + 90 * 60));
    expect(screen.getByRole("textbox", { name: "Часы" })).toHaveValue("2");
    expect(minutes).toHaveValue("30");
  });

  it("uses Tajik labels", () => {
    renderWithUI(<DurationInput aria-label="Давомнокӣ" />, { provider: { locale: "tg" } });
    expect(screen.getByRole("textbox", { name: "Соатҳо" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Дақиқаҳо" })).toBeInTheDocument();
  });
});
