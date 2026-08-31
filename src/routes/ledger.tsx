import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AlertTriangle } from "lucide-react";
import { addDays, formatETB, isoDate } from "../lib/shop-store";
import { useDailyLedger } from "@/hooks/useLedger";
import { SkeletonTable } from "@/components/SkeletonLoader";

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
  const [range, setRange] = useState<"7" | "30" | "90">("30");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const start = from || addDays(new Date(), -Number(range) + 1);
  const end = to || isoDate(new Date());

  // One row per day, computed in the database (get_daily_ledger), instead
  // of fetching every raw sale/expense row and reducing over them here.
  const { data: daysInRange = [], isLoading } = useDailyLedger(start, end);

  const totals = daysInRange.reduce(
    (acc, d) => ({
      sales: acc.sales + d.sales,
      cost: acc.cost + d.material_cost + d.other_cost,
      profit: acc.profit + d.profit,
      cups: acc.cups + d.units,
    }),
    { sales: 0, cost: 0, profit: 0, cups: 0 },
  );

  return (
    <AppShell
      title="Sales & expenses"
      description="Filter any period and see exactly what came in and what went out."
    >

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Cups & plates sold", value: totals.cups.toLocaleString() },
          { label: "Sales", value: formatETB(totals.sales) },
          { label: "Total cost", value: formatETB(totals.cost) },
          { label: "Profit", value: formatETB(totals.profit) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily sales table — InventoryList-style: plain bordered div + Table,
          no extra Card nesting around the table itself, explicit empty state. */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="mb-1">Daily sales</CardTitle>
          <CardDescription className="mb-4">
            {start} → {end}
          </CardDescription>
          <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-end">
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
          </div>
        </CardHeader>
        {isLoading ? (
          <SkeletonTable />
        ) : daysInRange.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <AlertTriangle className="mx-auto h-12 w-12 mb-2 opacity-20" />
            <p>No sales found for this date range.</p>
          </div>
        ) : (
          <div className="rounded-md border">
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
                  <TableRow key={d.date}>
                    <TableCell className="font-medium">{d.date}</TableCell>
                    <TableCell className="text-right">{d.units}</TableCell>
                    <TableCell className="text-right">{formatETB(d.sales)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatETB(d.material_cost + d.other_cost)}
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
          </div>
        )}
      </Card>
    </AppShell>
  );
}