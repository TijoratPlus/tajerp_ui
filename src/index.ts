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
  useDensity,
  useMessages,
  usePortalContainer,
} from "./components/TajUIProvider";
export type {
  Density,
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
  cardContentVariants,
  cardFooterVariants,
  cardHeaderVariants,
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

export { Skeleton, skeletonVariants } from "./components/Skeleton";
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
  DialogBody,
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

export {
  Avatar,
  AvatarFallback,
  AvatarImage,
  initialsOf,
} from "./components/Avatar";
export type { AvatarProps } from "./components/Avatar";

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
export type { SelectOption, SelectProps } from "./components/Select";

export { Switch } from "./components/Switch";
export type { SwitchProps } from "./components/Switch";

export { SegmentedControl } from "./components/SegmentedControl";
export type {
  SegmentedControlProps,
  SegmentedOption,
} from "./components/SegmentedControl";

export { StatusDot } from "./components/StatusDot";
export type { StatusDotProps } from "./components/StatusDot";

export { StateView } from "./components/StateView";
export type { StateViewProps } from "./components/StateView";

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
export type {
  TableCellProps,
  TableHeadProps,
  TableProps,
  TableRowProps,
} from "./components/Table";

export { DataTable, dataTableToCSV } from "./components/DataTable";
export type {
  DataTableAutoPagination,
  DataTableColumn,
  DataTableGroup,
  DataTableSelectAllMatching,
  DataTableLabels,
  DataTablePagination,
  DataTableProps,
  SortDir,
  SortState,
} from "./components/DataTable";

export { Pagination, getPageNumbers } from "./components/Pagination";
export type {
  PaginationLabels,
  PaginationProps,
} from "./components/Pagination";

export { Tabs } from "./components/Tabs";
export type { TabsProps, TabItem } from "./components/Tabs";

export { Toaster, toast } from "./components/Toast";
export type {
  ToastAction,
  ToastItem,
  ToastOptions,
  ToasterProps,
  ToastTone,
} from "./components/Toast";

export { Link, linkVariants } from "./components/Link";
export type { LinkProps } from "./components/Link";

export { Breadcrumb } from "./components/Breadcrumb";
export type {
  BreadcrumbItem,
  BreadcrumbLinkProps,
  BreadcrumbProps,
} from "./components/Breadcrumb";

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
export type {
  SidebarItem,
  SidebarLabels,
  SidebarLinkProps,
  SidebarProps,
} from "./components/Sidebar";

// ── Menus & overlays ────────────────────────────────────────────────
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./components/DropdownMenu";
export type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuRadioItemProps,
  DropdownMenuSubContentProps,
  DropdownMenuSubTriggerProps,
} from "./components/DropdownMenu";
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
  ConfirmHost,
  confirm,
} from "./components/AlertDialog";
export type {
  AlertDialogActionProps,
  AlertDialogContentProps,
  AlertDialogTone,
  ConfirmHostProps,
  ConfirmOptions,
} from "./components/AlertDialog";
export {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./components/HoverCard";
export type { HoverCardContentProps } from "./components/HoverCard";

// ── Inputs (additional) ─────────────────────────────────────────────
export { RadioGroup, RadioGroupItem } from "./components/RadioGroup";
export type {
  RadioGroupItemProps,
  RadioGroupProps,
} from "./components/RadioGroup";
export { Toggle, toggleVariants } from "./components/Toggle";
export type { ToggleProps } from "./components/Toggle";
export { ToggleGroup, ToggleGroupItem } from "./components/ToggleGroup";
export type {
  ToggleGroupItemProps,
  ToggleGroupProps,
} from "./components/ToggleGroup";

// ── Layout & feedback (additional) ──────────────────────────────────
export { Progress } from "./components/Progress";
export type { ProgressProps, ProgressTone } from "./components/Progress";
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./components/Collapsible";
export { ScrollArea, ScrollBar } from "./components/ScrollArea";
export type { ScrollAreaProps, ScrollBarProps } from "./components/ScrollArea";

// ── TijoratAI & approvals ───────────────────────────────────────────
export { ApprovalCard, approvalCardMessages } from "./components/ApprovalCard";
export type {
  ApprovalCardProps,
  ApprovalCardMessages,
  ApprovalKind,
  ApprovalStatus,
  ApprovalRequester,
  ApprovalDetail,
  ApprovalItem,
  ApprovalStep,
} from "./components/ApprovalCard";
export { ChatBubble, chatBubbleMessages } from "./components/ChatBubble";
export type {
  ChatBubbleProps,
  ChatBubbleMessages,
  ChatRole,
  ChatMessageStatus,
  ChatChannel,
} from "./components/ChatBubble";
export {
  AIAssistantPanel,
  aiAssistantPanelMessages,
} from "./components/AIAssistantPanel";
export type {
  AIAssistantPanelProps,
  AIAssistantPanelMessages,
  AIMessage,
} from "./components/AIAssistantPanel";

// ── POS ─────────────────────────────────────────────────────────────
export { Money, currencySymbol, moneyMessages } from "./components/Money";
export type {
  MoneyProps,
  MoneyTone,
  MoneySize,
  MoneyLabels,
} from "./components/Money";
export { MoneyInput } from "./components/MoneyInput";
export type { MoneyInputProps } from "./components/MoneyInput";
export {
  PhoneInput,
  formatTjPhone,
  normalizeTjPhone,
  isValidTjPhone,
  tjNationalDigits,
  phoneInputMessages,
  TJ_COUNTRY_CODE,
  TJ_NATIONAL_LENGTH,
} from "./components/PhoneInput";
export type {
  PhoneInputProps,
  PhoneInputLabels,
} from "./components/PhoneInput";
export { Numpad, applyNumpadKey, numpadMessages } from "./components/Numpad";
export type { NumpadProps, NumpadKey, NumpadLabels } from "./components/Numpad";
export { BarcodeInput, barcodeInputMessages } from "./components/BarcodeInput";
export type {
  BarcodeInputProps,
  BarcodeInputLabels,
} from "./components/BarcodeInput";
export { useBarcodeScanner } from "./lib/useBarcodeScanner";
export type { UseBarcodeScannerOptions } from "./lib/useBarcodeScanner";
export { ProductTile, productTileMessages } from "./components/ProductTile";
export type {
  ProductTileProps,
  ProductTileLabels,
} from "./components/ProductTile";
export {
  CartLine,
  CartSummary,
  cartLineTotal,
  cartLineMessages,
  cartSummaryMessages,
} from "./components/CartLine";
export type {
  CartLineProps,
  CartLineLabels,
  CartLineDiscount,
  CartSummaryProps,
  CartSummaryLabels,
} from "./components/CartLine";
export {
  PaymentSplit,
  computePaymentTotals,
  paymentSplitMessages,
} from "./components/PaymentSplit";
export type {
  PaymentSplitProps,
  PaymentSplitLabels,
  PaymentMethod,
  PaymentEntry,
  PaymentSplitResult,
  PaymentTotals,
} from "./components/PaymentSplit";
export {
  ReceiptPreview,
  printReceipt,
  receiptPreviewMessages,
} from "./components/ReceiptPreview";
export type {
  ReceiptPreviewProps,
  ReceiptPreviewLabels,
  ReceiptStore,
  ReceiptMeta,
  ReceiptLine,
  ReceiptPayment,
  ReceiptTotals,
  ReceiptWidth,
} from "./components/ReceiptPreview";
export {
  SyncStatus,
  OfflineIndicator,
  syncStatusMessages,
} from "./components/OfflineIndicator";
export type {
  SyncStatusProps,
  SyncStatusLabels,
  SyncState,
  OfflineIndicatorProps,
} from "./components/OfflineIndicator";
export { useOnlineStatus } from "./lib/useOnlineStatus";

// ── Dates ───────────────────────────────────────────────────────────
export {
  addDays,
  addMonths,
  addYears,
  clampDate,
  daysInMonth,
  endOfMonth,
  endOfWeek,
  formatDateInput,
  getMonthGrid,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isValidDate,
  isWithin,
  normalizeRange,
  parseDateInput,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  toISODate,
  weekdayIndex,
} from "./lib/date";
export type { DateRange } from "./lib/date";
export { Calendar, calendarMessages } from "./components/Calendar";
export type {
  CalendarProps,
  CalendarSingleProps,
  CalendarRangeProps,
  CalendarLabels,
} from "./components/Calendar";
export { DatePicker, datePickerMessages } from "./components/DatePicker";
export type {
  DatePickerProps,
  DatePickerLabels,
} from "./components/DatePicker";
export {
  DateRangePicker,
  dateRangePickerMessages,
  useDateRangePresets,
  formatDateRange,
} from "./components/DateRangePicker";
export type {
  DateRangePickerProps,
  DateRangePickerLabels,
  DateRangePreset,
} from "./components/DateRangePicker";

// ── App shell & business navigation ─────────────────────────────────
export {
  AppShell,
  AppShellMenuButton,
  useAppShell,
  appShellMessages,
} from "./components/AppShell";
export type {
  AppShellProps,
  AppShellMenuButtonProps,
  AppShellContextValue,
  AppShellBreakpoint,
  AppShellLabels,
} from "./components/AppShell";
export { Topbar, TopbarTitle } from "./components/Topbar";
export type { TopbarProps, TopbarTitleProps } from "./components/Topbar";
export {
  BranchSwitcher,
  ALL_BRANCHES,
  branchSwitcherMessages,
} from "./components/BranchSwitcher";
export type {
  BranchSwitcherProps,
  Branch,
  BranchValue,
  BranchSwitcherLabels,
} from "./components/BranchSwitcher";
export {
  LanguageSwitcher,
  languageSwitcherMessages,
} from "./components/LanguageSwitcher";
export type {
  LanguageSwitcherProps,
  LanguageSwitcherLabels,
} from "./components/LanguageSwitcher";
export { FilterBar, filterBarMessages } from "./components/FilterBar";
export type {
  FilterBarProps,
  FilterChip,
  FilterBarLabels,
} from "./components/FilterBar";
export { ExportMenu, exportMenuMessages } from "./components/ExportMenu";
export type {
  ExportMenuProps,
  ExportFormat,
  ExportMenuLabels,
} from "./components/ExportMenu";
export { toCSV, downloadFile, escapeCSVField, CSV_BOM } from "./lib/csv";
export type { CSVColumn, CSVOptions, CSVCell } from "./lib/csv";

// ── Search & selection ──────────────────────────────────────────────
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
  CommandShortcut,
  commandFilter,
  commandMessages,
  normalizeSearchText,
} from "./components/Command";
export type {
  CommandDialogProps,
  CommandEmptyProps,
  CommandGroupProps,
  CommandInputProps,
  CommandItemProps,
  CommandLabels,
  CommandListProps,
  CommandLoadingProps,
  CommandProps,
  CommandSeparatorProps,
  CommandShortcutProps,
} from "./components/Command";
export { MultiSelect, multiSelectMessages } from "./components/MultiSelect";
export type {
  MultiSelectGroup,
  MultiSelectLabels,
  MultiSelectOption,
  MultiSelectProps,
} from "./components/MultiSelect";
export {
  formatHotkey,
  isApplePlatform,
  isEditableTarget,
  matchesHotkey,
  parseHotkey,
  toAriaKeyshortcuts,
  useHotkey,
} from "./lib/useHotkey";
export type { ParsedHotkey, UseHotkeyOptions } from "./lib/useHotkey";

// ── Feedback & data display (additional) ────────────────────────────
export {
  Alert,
  Banner,
  alertVariants,
  bannerVariants,
  alertMessages,
} from "./components/Alert";
export type {
  AlertProps,
  BannerProps,
  AlertTone,
  AlertMessages,
} from "./components/Alert";
export { Kbd, KbdGroup } from "./components/Kbd";
export type { KbdProps, KbdGroupProps } from "./components/Kbd";
export { Stepper, getStepStatus, stepperMessages } from "./components/Stepper";
export type {
  StepperProps,
  StepperStep,
  StepStatus,
  StepperMessages,
} from "./components/Stepper";
export {
  DescriptionList,
  DescriptionItem,
  DescriptionTerm,
  DescriptionDetails,
  descriptionListMessages,
} from "./components/DescriptionList";
export type {
  DescriptionListProps,
  DescriptionListItemData,
  DescriptionListLayout,
  DescriptionItemProps,
  DescriptionTermProps,
  DescriptionDetailsProps,
  DescriptionListMessages,
} from "./components/DescriptionList";
export {
  StatCard,
  Delta,
  Sparkline,
  getDeltaDirection,
  statCardMessages,
} from "./components/StatCard";
export type {
  StatCardProps,
  StatFormat,
  DeltaProps,
  DeltaDirection,
  SparklineProps,
  SparklineTone,
  StatCardMessages,
} from "./components/StatCard";
export {
  ActivityTimeline,
  activityTimelineMessages,
} from "./components/ActivityTimeline";
export type {
  ActivityTimelineProps,
  ActivityItem,
  ActivityActor,
  ActivityActorKind,
  ActivityTone,
  ActivityTimelineMessages,
} from "./components/ActivityTimeline";
export {
  FileUpload,
  fileMatchesAccept,
  formatFileSize,
  fileUploadMessages,
} from "./components/FileUpload";
export type {
  FileUploadProps,
  FileRejection,
  FileRejectionCode,
  FileUploadMessages,
} from "./components/FileUpload";

// ── CRM building blocks ─────────────────────────────────────────────
export {
  EmojiPicker,
  EmojiPickerPanel,
  IconPicker,
  emojiPickerMessages,
  searchEmoji,
} from "./components/EmojiPicker";
export type {
  EmojiPickerLabels,
  EmojiPickerPanelProps,
  EmojiPickerProps,
  IconPickerProps,
} from "./components/EmojiPicker";
export {
  SortableList,
  DragHandle,
  arrayMove,
  sortableMessages,
  useSortableSensors,
} from "./components/Sortable";
export type {
  DragHandleProps,
  SortableHandleProps,
  SortableLabels,
  SortableListProps,
} from "./components/Sortable";
export { KanbanBoard, kanbanBoardMessages } from "./components/KanbanBoard";
export type {
  KanbanBoardLabels,
  KanbanBoardProps,
  KanbanColumn,
  KanbanMove,
} from "./components/KanbanBoard";
export {
  FilterBuilder,
  FilterPopover,
  TIMESPAN_OPTIONS,
  countFilterRules,
  defaultFilterValue,
  defaultOperators,
  filterBuilderMessages,
  isFilterGroup,
  newFilterId,
} from "./components/FilterBuilder";
export type {
  FilterBuilderLabels,
  FilterBuilderProps,
  FilterField,
  FilterFieldType,
  FilterGroup,
  FilterOperator,
  FilterPopoverProps,
  FilterRule,
  FilterValueInputArgs,
  TimespanValue,
} from "./components/FilterBuilder";
export {
  SortBuilder,
  SortPopover,
  sortBuilderMessages,
} from "./components/SortBuilder";
export type {
  SortBuilderLabels,
  SortBuilderProps,
  SortPopoverProps,
  SortRule,
} from "./components/SortBuilder";
export { AvatarGroup, avatarGroupMessages } from "./components/AvatarGroup";
export type {
  AvatarGroupItem,
  AvatarGroupLabels,
  AvatarGroupProps,
} from "./components/AvatarGroup";
export {
  ResizablePanel,
  resizablePanelMessages,
} from "./components/ResizablePanel";
export type {
  ResizablePanelLabels,
  ResizablePanelProps,
} from "./components/ResizablePanel";
export {
  AudioPlayer,
  audioPlayerMessages,
  formatPlaybackTime,
} from "./components/AudioPlayer";
export type {
  AudioPlayerLabels,
  AudioPlayerProps,
} from "./components/AudioPlayer";
export { ChipInput, chipInputMessages } from "./components/ChipInput";
export type {
  ChipInputLabels,
  ChipInputProps,
  ChipSuggestion,
} from "./components/ChipInput";

// ── Scheduling: time, date-time, duration and the event calendar ────
export { TimePicker, timePickerMessages } from "./components/TimePicker";
export type { TimePickerLabels, TimePickerProps } from "./components/TimePicker";
export {
  DateTimePicker,
  dateTimePickerMessages,
  formatDateTimeInput,
  parseDateTimeInput,
} from "./components/DateTimePicker";
export type {
  DateTimePickerLabels,
  DateTimePickerProps,
} from "./components/DateTimePicker";
export { DurationInput, durationInputMessages } from "./components/DurationInput";
export type {
  DurationInputLabels,
  DurationInputProps,
} from "./components/DurationInput";
export { EventCalendar, eventCalendarMessages } from "./components/EventCalendar";
export type {
  CalendarEvent,
  CalendarEventRange,
  CalendarView,
  EventCalendarLabels,
  EventCalendarProps,
} from "./components/EventCalendar";
export { formatTimeOfDay, parseTimeInput } from "./lib/time";
