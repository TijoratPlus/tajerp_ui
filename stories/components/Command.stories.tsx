import type { Meta, StoryObj } from "@storybook/react";
import {
  BarChart3,
  Boxes,
  PackagePlus,
  ShoppingCart,
  UserPlus,
  Users,
  UserSquare2,
  Warehouse,
  Wallet,
} from "lucide-react";
import * as React from "react";
import {
  Button,
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
  TajUIProvider,
  formatHotkey,
  useHotkey,
} from "../../src";

const meta: Meta<typeof Command> = {
  title: "Components/Navigation/Command",
  component: Command,
  parameters: {
    docs: {
      description: {
        component:
          "Command palette for jumping to sections and running actions from the keyboard. Use `CommandDialog` with `hotkey=\"mod+k\"` (⌘K on Mac, Ctrl+K elsewhere) as the app-wide launcher, or `Command` inline for searchable menus. Matching ignores case and ё/е, and accepts Tajik words typed without ҳ қ ғ ҷ ӣ ӯ. Set `shouldFilter={false}` when the server filters results.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Command>;

function log(action: string) {
  // Storybook's actions panel is not wired here; the console is enough for a demo.
  console.info("command:", action);
}

function TijoratItems({ onRun }: { onRun: (value: string) => void }) {
  return (
    <>
      <CommandEmpty />
      <CommandGroup heading="Действия">
        <CommandItem icon={<ShoppingCart />} shortcut="mod+shift+s" keywords={["чек", "касса", "sale"]} onSelect={onRun}>
          Новая продажа
        </CommandItem>
        <CommandItem icon={<PackagePlus />} keywords={["закупка", "поставка", "накладная"]} onSelect={onRun}>
          Приход товара
        </CommandItem>
        <CommandItem icon={<UserPlus />} keywords={["покупатель", "контрагент"]} onSelect={onRun}>
          Новый клиент
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Отчёты">
        <CommandItem icon={<BarChart3 />} keywords={["выручка", "z-отчёт"]} onSelect={onRun}>
          Продажи за день
        </CommandItem>
        <CommandItem icon={<Boxes />} keywords={["инвентаризация", "склад"]} onSelect={onRun}>
          Остатки
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Перейти">
        <CommandItem icon={<Wallet />} shortcut="mod+1" onSelect={onRun}>
          Касса
        </CommandItem>
        <CommandItem icon={<Warehouse />} shortcut="mod+2" onSelect={onRun}>
          Склад
        </CommandItem>
        <CommandItem icon={<Users />} shortcut="mod+3" keywords={["crm"]} onSelect={onRun}>
          Клиенты
        </CommandItem>
        <CommandItem icon={<UserSquare2 />} keywords={["hr", "кадры", "зарплата"]} disabled onSelect={onRun}>
          Сотрудники
        </CommandItem>
      </CommandGroup>
    </>
  );
}

export const Palette: Story = {
  name: "⌘K palette",
  render: () => {
    const [open, setOpen] = React.useState(false);
    const [last, setLast] = React.useState<string | null>(null);
    const run = (value: string) => {
      setLast(value);
      setOpen(false);
      log(value);
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <Button variant="subtle" onClick={() => setOpen(true)} iconRight={<CommandShortcut>{formatHotkey("mod+k")}</CommandShortcut>}>
          Поиск и команды
        </Button>
        <p style={{ color: "var(--ui-ink-3)", fontSize: 13 }}>
          Нажмите {formatHotkey("mod+k")} в любом месте страницы. Последняя команда: {last ?? "—"}
        </p>
        <CommandDialog hotkey="mod+k" open={open} onOpenChange={setOpen}>
          <CommandInput />
          <CommandList>
            <TijoratItems onRun={run} />
          </CommandList>
        </CommandDialog>
      </div>
    );
  },
};

export const Inline: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Command className="border border-hairline shadow-tj-md">
        <CommandInput />
        <CommandList>
          <TijoratItems onRun={log} />
        </CommandList>
      </Command>
    </div>
  ),
};

export const Tajik: Story = {
  name: "Тоҷикӣ",
  render: () => (
    <TajUIProvider locale="tg">
      <div style={{ maxWidth: 420 }}>
        <Command className="border border-hairline shadow-tj-md">
          <CommandInput />
          <CommandList>
            <CommandEmpty />
            <CommandGroup heading="Амалҳо">
              <CommandItem icon={<ShoppingCart />} shortcut="mod+shift+s" onSelect={log}>
                Фурӯши нав
              </CommandItem>
              <CommandItem icon={<PackagePlus />} keywords={["харид"]} onSelect={log}>
                Қабули мол
              </CommandItem>
              <CommandItem icon={<UserPlus />} onSelect={log}>
                Мизоҷи нав
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Ҳисоботҳо">
              <CommandItem icon={<BarChart3 />} onSelect={log}>
                Фурӯш барои рӯз
              </CommandItem>
              <CommandItem icon={<Boxes />} onSelect={log}>
                Бақияҳо
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Гузариш">
              <CommandItem icon={<Wallet />} onSelect={log}>
                Касса
              </CommandItem>
              <CommandItem icon={<Warehouse />} onSelect={log}>
                Анбор
              </CommandItem>
              <CommandItem icon={<Users />} onSelect={log}>
                Мизоҷон
              </CommandItem>
              <CommandItem icon={<UserSquare2 />} onSelect={log}>
                Кормандон
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        <p style={{ marginTop: 12, color: "var(--ui-ink-3)", fontSize: 13 }}>
          «қабул» ва «кабул» ҳарду «Қабули мол»-ро меёбанд.
        </p>
      </div>
    </TajUIProvider>
  ),
};

const customers = [
  "Алиев Фарҳод — магазин «Сомон»",
  "Каримова Нигина",
  "ООО «Душанбе Трейд»",
  "Рахимов Ёдгор",
  "Шарипов Бахтиёр — оптом",
  "ИП Назарова",
];

export const ServerSearch: Story = {
  name: "Server-side search",
  render: () => {
    const [search, setSearch] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [results, setResults] = React.useState<string[]>(customers);
    React.useEffect(() => {
      setLoading(true);
      const timer = setTimeout(() => {
        const q = search.toLowerCase().replace(/ё/g, "е");
        setResults(customers.filter((c) => c.toLowerCase().replace(/ё/g, "е").includes(q)));
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }, [search]);
    return (
      <div style={{ maxWidth: 420 }}>
        <Command shouldFilter={false} search={search} onSearchChange={setSearch} className="border border-hairline">
          <CommandInput placeholder="Найти клиента по имени или телефону…" loading={loading} />
          <CommandList>
            {loading && results.length === 0 ? <CommandLoading /> : null}
            <CommandEmpty>Клиент не найден</CommandEmpty>
            <CommandGroup heading="Клиенты">
              {results.map((c) => (
                <CommandItem key={c} icon={<Users />} onSelect={log}>
                  {c}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    );
  },
};

export const CustomHotkey: Story = {
  name: "useHotkey",
  render: () => {
    const [count, setCount] = React.useState(0);
    useHotkey("shift+?", () => setCount((n) => n + 1));
    return (
      <p style={{ color: "var(--ui-ink-2)", fontSize: 14 }}>
        Нажмите <CommandShortcut className="ml-0">?</CommandShortcut> (вне полей ввода): {count}
      </p>
    );
  },
};
