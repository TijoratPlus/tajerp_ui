import type { Meta, StoryObj } from "@storybook/react";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "../src";

const meta: Meta = {
  title: "Data/Table (primitives)",
  parameters: {
    docs: {
      description: {
        component:
          "Low-level table primitives for bespoke tables. For toolbar + sorting + selection + pagination, use `DataTable`.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const rows = [
  { code: "НК-2041", party: "Ахмад Бакиев", status: "Оплачено", amount: "42 800 c." },
  { code: "НК-2039", party: "Нилуфар Мирзоева", status: "Ожидает", amount: "8 420 c." },
  { code: "НК-2038", party: "Гулрух Маркет", status: "Просрочено", amount: "96 400 c." },
];

const tone = (s: string) =>
  s === "Оплачено" ? "success" : s === "Ожидает" ? "warning" : "error";

export const Basic: Story = {
  render: () => (
    <TableContainer className="max-w-2xl">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>№</TableHead>
            <TableHead>Контрагент</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead align="right">Сумма</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.code}>
              <TableCell className="font-mono text-ink-2">{r.code}</TableCell>
              <TableCell className="font-bold text-ink-1">{r.party}</TableCell>
              <TableCell>
                <Badge tone={tone(r.status) as "success" | "warning" | "error"}>
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell align="right" className="font-bold text-ink-1">
                {r.amount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ),
};
