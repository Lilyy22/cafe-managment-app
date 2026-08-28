import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Coffee, Wallet, TrendingDown, TrendingUp, AlertTriangle, BellRing } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { StatCard } from "../components/stat-card";
import { Badge } from "../components/ui/badge";
import { buttonVariants } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { cupsOf, formatETB, isoDate, materialCostOf, revenueOf, useShop } from "../lib/shop-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ozzy Coffee Management" },
      {
        name: "description",
        content:
          "Daily cups sold, sales, expenses, profit and stock alerts for Ozzy Coffee at a glance.",
      },
      { property: "og:title", content: "Dashboard — Ozzy Coffee Management" },
      {
        property: "og:description",
        content: "Daily cups sold, sales, expenses, profit and stock alerts for Ozzy Coffee.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { entries, expenses, products, materialStats } = useShop();
  const today = isoDate(new Date());

  const todayEntry = entries.find((e) => e.date === today) ?? entries[0];
  const todayExpenses = expenses
    .filter((e) => e.date === (todayEntry?.date ?? today))
    .reduce((s, e) => s + e.amount, 0);

  const sales = todayEntry ? revenueOf(todayEntry, products) : 0;
  const cost = todayEntry ? materialCostOf(todayEntry, materialStats, products) : 0;
  const profit = sales - cost - todayExpenses;

  const trend = useMemo(() => {
    return [...entries]
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(-30)
      .map((e) => ({
        date: e.date.slice(5),
        sales: revenueOf(e, products),
        expenses:
          expenses.filter((x) => x.date === e.date).reduce((s, x) => s + x.amount, 0) +
          materialCostOf(e, materialStats, products),
      }));
  }, [entries, expenses, materialStats, products]);

  const mix = useMemo(() => {
    const last7 = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 7);
    return products.map((p) => ({
      name: p.name,
      units: last7.reduce((s, e) => s + (e.sold[p.id] ?? 0), 0),
    }));
  }, [entries, products]);

  const lowStock = materialStats.filter((m) => m.low);
 
  return (
    <AppShell
      title="Dashboard"
      description={`Overview for ${todayEntry?.date ?? today} — Ozzy Coffee`}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Units sold today"
          value={String(todayEntry ? cupsOf(todayEntry) : 0)}
          hint={`${todayEntry?.sold.coffee ?? 0} coffee cups`}
          icon={Coffee}
        />
        <StatCard label="Sales today" value={formatETB(sales)} icon={Wallet} tone="caramel" />
        <StatCard
          label="Expenses today"
          value={formatETB(cost + todayExpenses)}
          hint={`${formatETB(cost)} materials + ${formatETB(todayExpenses)} other`}
          icon={TrendingDown}
          tone="destructive"
        />
        <StatCard
          label="Net profit today"
          value={formatETB(profit)}
          hint={sales ? `${Math.round((profit / sales) * 100)}% margin` : undefined}
          icon={TrendingUp}
          tone={profit >= 0 ? "success" : "destructive"}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales vs expenses</CardTitle>
            <CardDescription>Last 30 days, ETB</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ left: -12, right: 8 }}>
                <defs>
                  <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                <YAxis tick={{ fontSize: 11 }} width={60} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                  formatter={(v) => formatETB(Number(v ?? 0))}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-chart-1)"
                  fill="url(#gSales)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="var(--color-chart-2)"
                  fill="url(#gExp)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product mix</CardTitle>
            <CardDescription>Units sold, last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mix} margin={{ left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} dy={10} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="units" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-caramel-foreground" />
                Stock to watch
              </CardTitle>
              <CardDescription>Estimated restock dates</CardDescription>
            </div>
            <Link
              to="/inventory"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Inventory
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {(lowStock.length ? lowStock : materialStats.slice(0, 4)).map((m) => (
              <div key={m.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{m.name}</span>
                  <span className="text-muted-foreground">
                    {Math.round(m.remaining).toLocaleString()} {m.unit} left
                  </span>
                </div>
                <Progress
                  value={Math.min(100, (m.remaining / Math.max(m.purchaseQty, 1)) * 100)}
                  className="mt-2"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {m.daysRemaining !== null
                    ? `~${Math.floor(m.daysRemaining)} days left · buy around ${m.restockDate}`
                    : "Manual item — no automatic usage"}
                  {m.low ? (
                    <Badge variant="destructive" className="ml-2">
                      Low
                    </Badge>
                  ) : null}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="size-4 text-primary" />
                Upcoming payments
              </CardTitle>
              <CardDescription>Rent, salary and light bill</CardDescription>
            </div>
            <Link
              to="/bills"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              All bills
            </Link>
          </CardHeader>
         
        </Card>
      </div>
    </AppShell>
  );
}
