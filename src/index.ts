// ─── tajerp_ui — Tijorat+ design system ─────────────────────────────
// Import the theme once in your app's CSS entry (after tailwindcss):
//   @import "tajerp_ui/styles/index.css";

export { cn } from "./lib/cn";
export { Slot } from "./lib/Slot";
export type { ControlSize } from "./lib/control";

// ── Configuration, i18n and formatting ──────────────────────────────
export {
  TajUIProvider,
  useCommonMessages,
  useFormat,
  useLocale,
  useMessages,
  usePortalContainer,
} from "./components/TajUIProvider";
export type {
  MessageOverrides,
  TajUIProviderProps,
} from "./components/TajUIProvider";
export {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_NAMES,
  LOCALE_SHORT,
} from "./i18n/locale";
export type { Locale } from "./i18n/locale";
export { commonMessages, defineMessages } from "./i18n/messages";
export type { MessageDict, MessageNamespace } from "./i18n/messages";
export {
  SOMONI_SYMBOL,
  decimalSeparator,
  formatDate,
  formatMoney,
  formatNumber,
  formatRelative,
  parseNumber,
} from "./i18n/format";
export type {
  DateFormatOptions,
  MoneyFormatOptions,
  NumberFormatOptions,
} from "./i18n/format";

export {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "./components/InputGroup";
export type {
  InputGroupAddonProps,
  InputGroupInputProps,
  InputGroupProps,
} from "./components/InputGroup";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  useCarousel,
} from "./components/Carousel";
export type { CarouselProps, CarouselApi } from "./components/Carousel";

export { Button, buttonVariants } from "./components/Button";
export type { ButtonProps } from "./components/Button";

export {
  Card,
  cardVariants,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/Card";
export type {
  CardContentProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
} from "./components/Card";

export { Input } from "./components/Input";
export type { InputProps } from "./components/Input";

export { Badge, badgeVariants, Pill } from "./components/Badge";
export type { BadgeProps, PillProps } from "./components/Badge";

export { Skeleton } from "./components/Skeleton";
export type { SkeletonProps } from "./components/Skeleton";

export { Spinner } from "./components/Spinner";
export type { SpinnerProps } from "./components/Spinner";

export { LoadingState } from "./components/LoadingState";
export type { LoadingStateProps } from "./components/LoadingState";

export { ErrorState } from "./components/ErrorState";
export type { ErrorStateProps } from "./components/ErrorState";

export type { SheetContentProps } from "./components/Sheet";
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "./components/Sheet";

export type { DialogContentProps } from "./components/Dialog";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./components/Dialog";

export { TajERPLogo } from "./components/Logo";
export type { TajERPLogoProps } from "./components/Logo";

export { Avatar, AvatarFallback, AvatarImage } from "./components/Avatar";

export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/Tooltip";
export type { TooltipContentProps } from "./components/Tooltip";

export {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./components/Popover";
export type { PopoverContentProps } from "./components/Popover";

export { Separator } from "./components/Separator";
export type { SeparatorProps } from "./components/Separator";

export { Label } from "./components/Label";
export type { LabelProps } from "./components/Label";

export { Textarea } from "./components/Textarea";
export type { TextareaProps } from "./components/Textarea";

export { Select } from "./components/Select";
export type { SelectProps } from "./components/Select";

export { Switch } from "./components/Switch";
export type { SwitchProps } from "./components/Switch";

export { SegmentedControl } from "./components/SegmentedControl";
export type {
  SegmentedControlProps,
  SegmentedOption,
} from "./components/SegmentedControl";

export { StatusDot } from "./components/StatusDot";
export type { StatusDotProps } from "./components/StatusDot";

export { EmptyState } from "./components/EmptyState";
export type { EmptyStateProps } from "./components/EmptyState";

export { Checkbox } from "./components/Checkbox";
export type { CheckboxProps } from "./components/Checkbox";

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/Table";

export { DataTable } from "./components/DataTable";
export type {
  DataTableAutoPagination,
  DataTableColumn,
  DataTablePagination,
  DataTableProps,
  SortDir,
} from "./components/DataTable";

export { Tabs } from "./components/Tabs";
export type { TabsProps, TabItem } from "./components/Tabs";

export { Toaster, toast } from "./components/Toast";
export type { ToastItem, ToastOptions, ToastTone } from "./components/Toast";

export type { SelectOption } from "./components/Select";

export { Link, linkVariants } from "./components/Link";
export type { LinkProps } from "./components/Link";

export { Breadcrumb } from "./components/Breadcrumb";
export type { BreadcrumbItem, BreadcrumbProps } from "./components/Breadcrumb";

export { SearchField } from "./components/SearchField";
export type { SearchFieldProps } from "./components/SearchField";

export { NumberField } from "./components/NumberField";
export type { NumberFieldProps } from "./components/NumberField";

export { Autocomplete } from "./components/Autocomplete";
export type { AutocompleteProps } from "./components/Autocomplete";

export { Slider } from "./components/Slider";
export type { SliderProps } from "./components/Slider";

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/Accordion";

export { Sidebar } from "./components/Sidebar";
export type { SidebarItem, SidebarProps } from "./components/Sidebar";
