import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button, Input, Select, Textarea } from "../../src";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../src/form";

const meta: Meta = {
  title: "Components/Inputs/Form",
  parameters: {
    docs: {
      description: {
        component:
          "react-hook-form primitives wired to Tijorat+ inputs and error tokens. Import from `tajerp_ui/form` — `react-hook-form` is an *optional* peer dependency, so only apps that use forms need it installed. Compose `FormField` → `FormItem` → `FormLabel` / `FormControl` / `FormDescription` / `FormMessage`; `FormControl` forwards `id` + `aria-*` to whatever input you nest inside it.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

type ContactValues = {
  name: string;
  email: string;
  industry: string;
  message: string;
};

/** A validated contact form with description text and inline error messages. */
export const Playground: Story = {
  render: () => {
    const form = useForm<ContactValues>({
      defaultValues: { name: "", email: "", industry: "", message: "" },
    });
    const [submitted, setSubmitted] = React.useState<ContactValues | null>(null);

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(setSubmitted)}
          noValidate
          style={{ maxWidth: 440 }}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Введите имя" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя</FormLabel>
                <FormControl>
                  <Input placeholder="Ваше имя" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            rules={{
              required: "Введите email",
              pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Некорректный email" },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@company.tj" {...field} />
                </FormControl>
                <FormDescription>
                  Мы свяжемся с вами в течение 24 часов.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="industry"
            rules={{ required: "Выберите отрасль" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Отрасль</FormLabel>
                <FormControl>
                  <Select
                    placeholder="Выберите отрасль"
                    options={[
                      { label: "Розница", value: "retail" },
                      { label: "Ресторан", value: "restaurant" },
                      { label: "Аптека", value: "pharmacy" },
                      { label: "Производство", value: "manufacturing" },
                    ]}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Сообщение</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder="Расскажите о вашем бизнесе" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Отправить</Button>

          {submitted ? (
            <pre className="rounded-lg bg-ui-surface-2 p-3 text-[12px] text-ink-2">
              {JSON.stringify(submitted, null, 2)}
            </pre>
          ) : null}
        </form>
      </Form>
    );
  },
};
