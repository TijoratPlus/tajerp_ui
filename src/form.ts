// ─── tajerp_ui/form ─────────────────────────────────────────────────
// react-hook-form powered form primitives, isolated in their own entry so
// react-hook-form stays an *optional* peer dependency — only apps that import
// from "tajerp_ui/form" need it installed.
//
//   import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage }
//     from "tajerp_ui/form";

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "./components/Form";
