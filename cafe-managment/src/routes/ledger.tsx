import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../components/app-shell";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  EXPENSE_CATEGORIES,
  addDays,
  cupsOf,
  formatETB,
  isoDate,
  materialCostOf,
  revenueOf,
  useShop,
  type ExpenseCategory,
} from "../lib/shop-store";
import { ExpenseForm } from "@/components/expense/expenseForm";
import { ExpenseList } from "@/components/expense/expenseList";

export const Route = createFileRoute("/ledger")({
  head: () => ({
    meta: [
      { title: "Sales & Expenses — Ozzy Coffee Management" },
      {
        name: "description",
        content:
          "Search and filter every sale and expense, with daily, weekly and monthly profit totals.",
      },
      { property: "og:title", content: "Sales & Expenses — Ozzy Coffee Management" },
      {
        property: "og:description",
        content: "Filterable ledger of Ozzy Coffee sales, expenses and profit.",
      },
    ],
  }),
  component: LedgerPage,
});

function LedgerPage() {
  const { entries, expenses, products, materialStats, addExpense, deleteExpense } = useShop();
  const [range, setRange] = useState<"7" | "30" | "90">("30");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | ExpenseCategory>("all");

  const [eDate, setEDate] = useState(isoDate(new Date()));
  const [eCat, setECat] = useState<ExpenseCategory>("other");
  const [eDesc, setEDesc] = useState("");
  const [eAmount, setEAmount] = useState("");

  const start = from || addDays(new Date(), -Number(range) + 1);
  const end = to || isoDate(new Date());

  const daysInRange = useMemo(() => {
    return entries
      .filter((e) => e.date >= start && e.date <= end)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map((e) => {
        const sales = revenueOf(e, products);
        const matCost = materialCostOf(e, materialStats, products);
        const other = expenses
          .filter((x) => x.date === e.date)
          .reduce((s, x) => s + x.amount, 0);
        return { entry: e, sales, matCost, other, profit: sales - matCost - other };
      });
  }, [entries, expenses, products, materialStats, start, end]);

  const totals = daysInRange.reduce(
    (acc, d) => ({
      sales: acc.sales + d.sales,
      cost: acc.cost + d.matCost + d.other,
      profit: acc.profit + d.profit,
      cups: acc.cups + cupsOf(d.entry),
    }),
    { sales: 0, cost: 0, profit: 0, cups: 0 },
  );

  const visibleExpenses = expenses.filter((x) => {
    if (x.date < start || x.date > end) return false;
    if (category !== "all" && x.category !== category) return false;
    if (search && !`${x.description} ${x.category}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  function submitExpense(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(eAmount);
    if (!amount || amount <= 0) { toast.error("Enter the amount."); return; }
    addExpense({ date: eDate, category: eCat, description: eDesc || eCat, amount });
    toast.success(`Expense of ${formatETB(amount)} recorded`);
    setEDesc("");
    setEAmount("");
  }

  return (
    <AppShell
      title="Sales & expenses"
      description="Filter any period and see exactly what came in and what went out."
    >
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end">
          <div className="space-y-1">
            <Label className="text-xs">Quick range</Label>
            <Tabs
              value={range}
              onValueChange={(v) => {
                setRange(v as typeof range);
                setFrom("");
                setTo("");
              }}
            >
              <TabsList>
                <TabsTrigger value="7">7 days</TabsTrigger>
                <TabsTrigger value="30">30 days</TabsTrigger>
                <TabsTrigger value="90">90 days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="space-y-1">
            <Label htmlFor="from" className="text-xs">
              From
            </Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="to" className="text-xs">
              To
            </Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex-1 space-y-1">
            <Label htmlFor="search" className="text-xs">
              Search expenses
            </Label>
            <Input
              id="search"
              placeholder="coffee, rent, light…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Cups & plates sold", value: totals.cups.toLocaleString() },
          { label: "Sales", value: formatETB(totals.sales) },
          { label: "Total cost", value: formatETB(totals.cost) },
          { label: "Profit", value: formatETB(totals.profit) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily sales</CardTitle>
            <CardDescription>
              {start} → {end}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[520px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daysInRange.map((d) => (
                  <TableRow key={d.entry.id}>
                    <TableCell className="font-medium">{d.entry.date}</TableCell>
                    <TableCell className="text-right">{cupsOf(d.entry)}</TableCell>
                    <TableCell className="text-right">{formatETB(d.sales)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatETB(d.matCost + d.other)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${d.profit >= 0 ? "text-success" : "text-destructive"}`}
                    >
                      {formatETB(d.profit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <ExpenseForm />
          <ExpenseList />
        </div>
      </div>
    </AppShell>
  );
}
