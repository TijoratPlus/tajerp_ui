import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { Input } from "../src";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../src/form";
import { expectNoA11yViolations, renderWithUI } from "./utils";

function PhoneForm({ withDescription }: { withDescription?: boolean }) {
  const form = useForm<{ phone: string }>({ defaultValues: { phone: "" } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="phone"
          rules={{ required: "Укажите телефон" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Телефон</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              {withDescription ? <FormDescription>Для SMS-чеков</FormDescription> : null}
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Сохранить</button>
      </form>
    </Form>
  );
}

describe("Form", () => {
  it("only references a description that exists", () => {
    renderWithUI(<PhoneForm />);
    expect(screen.getByLabelText(/Телефон/)).not.toHaveAttribute("aria-describedby");
  });

  it("links description and error message to the control", async () => {
    renderWithUI(<PhoneForm withDescription />);
    const input = screen.getByLabelText(/Телефон/);
    await userEvent.click(screen.getByText("Сохранить"));
    const message = await screen.findByText("Укажите телефон");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const ids = input.getAttribute("aria-describedby")!.split(" ");
    expect(ids).toContain(message.id);
    expect(ids).toContain(screen.getByText("Для SMS-чеков").id);
    await expectNoA11yViolations();
  });

  it("throws outside FormItem", () => {
    function Bad() {
      const form = useForm<{ a: string }>();
      return (
        <Form {...form}>
          <FormField control={form.control} name="a" render={() => <FormLabel>A</FormLabel>} />
        </Form>
      );
    }
    const spy = console.error;
    console.error = () => {};
    expect(() => renderWithUI(<Bad />)).toThrow(/FormItem/);
    console.error = spy;
  });
});
