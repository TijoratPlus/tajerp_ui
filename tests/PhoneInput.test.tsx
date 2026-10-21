import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  PhoneInput,
  formatTjPhone,
  isValidTjPhone,
  normalizeTjPhone,
} from "../src/components/PhoneInput";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("Tajik phone helpers", () => {
  it.each([
    ["+992 93 123 45 67", "+992931234567"],
    ["00992931234567", "+992931234567"],
    ["992931234567", "+992931234567"],
    ["0931234567", "+992931234567"],
    ["93-123-45-67", "+992931234567"],
    ["992345678", "+992992345678"],
    ["93", "+99293"],
    ["", ""],
  ])("normalizeTjPhone(%s) → %s", (input, out) => {
    expect(normalizeTjPhone(input)).toBe(out);
  });

  it("formats", () => {
    expect(formatTjPhone("+992931234567")).toBe("93 123 45 67");
    expect(formatTjPhone("93123")).toBe("93 123");
    expect(formatTjPhone("931234567", { international: true })).toBe("+992 93 123 45 67");
    expect(isValidTjPhone("+992931234567")).toBe(true);
    expect(isValidTjPhone("9312")).toBe(false);
  });
});

describe("PhoneInput", () => {
  it("formats while typing, reports E.164 and is accessible", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <>
        <label htmlFor="tel">Телефон</label>
        <PhoneInput id="tel" name="phone" onValueChange={onValueChange} />
      </>,
    );
    const input = screen.getByLabelText("Телефон") as HTMLInputElement;
    expect(input).toHaveAttribute("type", "tel");
    expect(input).toHaveAttribute("name", "phone");
    expect(screen.getByText("+992")).toBeInTheDocument();
    await userEvent.type(input, "9312345678999");
    expect(input.value).toBe("93 123 45 67");
    expect(onValueChange).toHaveBeenLastCalledWith("+992931234567");
    await expectNoA11yViolations();
  });

  it("normalises pasted numbers", async () => {
    const onValueChange = vi.fn();
    renderWithUI(<PhoneInput aria-label="Телефон" onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Телефон") as HTMLInputElement;
    await userEvent.click(input);
    await userEvent.paste("+992 90 555 12 34");
    expect(input.value).toBe("90 555 12 34");
    expect(onValueChange).toHaveBeenLastCalledWith("+992905551234");
    await userEvent.clear(input);
    expect(onValueChange).toHaveBeenLastCalledWith("");
    await userEvent.paste("0931234567");
    expect(input.value).toBe("93 123 45 67");
  });

  it("accepts E.164 or national defaultValue", () => {
    renderWithUI(
      <>
        <PhoneInput aria-label="Телефон" defaultValue="+992931234567" />
        <PhoneInput aria-label="Телефон2" defaultValue="901112233" />
      </>,
    );
    expect(screen.getByLabelText("Телефон")).toHaveValue("93 123 45 67");
    expect(screen.getByLabelText("Телефон2")).toHaveValue("90 111 22 33");
  });

  it("marks an incomplete number invalid on blur", async () => {
    renderWithUI(<PhoneInput aria-label="Телефон" />);
    const input = screen.getByLabelText("Телефон") as HTMLInputElement;
    await userEvent.type(input, "9312");
    expect(input).not.toHaveAttribute("aria-invalid");
    fireEvent.blur(input);
    expect(input).toHaveAttribute("aria-invalid", "true");
    await userEvent.type(input, "34567");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("does not validate when validateOnBlur is false", () => {
    renderWithUI(<PhoneInput aria-label="Телефон" defaultValue="93" validateOnBlur={false} />);
    const input = screen.getByLabelText("Телефон");
    fireEvent.blur(input);
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("backspace over a group space removes the previous digit", async () => {
    renderWithUI(<PhoneInput aria-label="Телефон" defaultValue="93123" />);
    const input = screen.getByLabelText("Телефон") as HTMLInputElement;
    input.focus();
    input.setSelectionRange(3, 3); // after "93 "
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(input.value).toBe("91 23");
  });

  it("is controlled", async () => {
    function Controlled() {
      const [v, setV] = React.useState("+992931234567");
      return (
        <>
          <PhoneInput aria-label="Телефон" value={v} onValueChange={setV} />
          <output>{v || "empty"}</output>
        </>
      );
    }
    renderWithUI(<Controlled />);
    const input = screen.getByLabelText("Телефон");
    expect(input).toHaveValue("93 123 45 67");
    await userEvent.clear(input);
    expect(screen.getByRole("status")).toHaveTextContent("empty");
  });
});
