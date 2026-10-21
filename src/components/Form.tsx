import * as React from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";

import { cn } from "../lib/cn";
import { Label } from "./Label";
import { Slot } from "../lib/Slot";

/**
 * react-hook-form powered form primitives, themed with Tijorat+ tokens.
 *
 * `react-hook-form` is an optional peer dependency — install it in the app and
 * import these from `tajerp_ui/form`:
 *
 *   const form = useForm<Values>();
 *   <Form {...form}>
 *     <FormField control={form.control} name="email" render={({ field }) => (
 *       <FormItem>
 *         <FormLabel>Email</FormLabel>
 *         <FormControl><Input {...field} /></FormControl>
 *         <FormMessage />
 *       </FormItem>
 *     )} />
 *   </Form>
 */

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null,
);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

type FormItemContextValue = {
  id: string;
  /** FormDescription registers itself so controls reference it only when present. */
  hasDescription: boolean;
  setHasDescription: (has: boolean) => void;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id, hasDescription, setHasDescription } = itemContext;

  return {
    id,
    hasDescription,
    setHasDescription,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();
  const [hasDescription, setHasDescription] = React.useState(false);
  const value = React.useMemo(
    () => ({ id, hasDescription, setHasDescription }),
    [id, hasDescription],
  );
  return (
    <FormItemContext.Provider value={value}>
      <div
        ref={ref}
        data-slot="form-item"
        className={cn("flex flex-col gap-1", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

export type FormLabelProps = React.ComponentPropsWithoutRef<typeof Label> & {
  /** Append a required marker (an asterisk, hidden from screen readers). */
  required?: boolean;
};

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, required, children, ...props }, ref) => {
    const { error, formItemId } = useFormField();
    return (
      <Label
        ref={ref}
        data-slot="form-label"
        data-error={!!error}
        className={cn(error && "text-tj-error-ink", className)}
        htmlFor={formItemId}
        {...props}
      >
        {children}
        {required ? (
          <span aria-hidden className="ml-0.5 text-tj-error-ink">
            *
          </span>
        ) : null}
      </Label>
    );
  },
);
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>((props, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId, hasDescription } =
    useFormField();
  const describedBy =
    [hasDescription && formDescriptionId, error && formMessageId]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={describedBy}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId, setHasDescription } = useFormField();
  React.useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);
  return (
    <p
      ref={ref}
      id={formDescriptionId}
      data-slot="form-description"
      className={cn("text-ui-helper text-ink-3", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;
  if (!body) return null;
  return (
    <p
      ref={ref}
      id={formMessageId}
      data-slot="form-message"
      aria-live="polite"
      className={cn("text-ui-helper font-medium text-tj-error-ink", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
