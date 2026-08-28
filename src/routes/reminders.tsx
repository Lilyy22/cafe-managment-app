import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BellRing, Trash2, Zap } from "lucide-react";
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
import { addMonths, formatETB, isoDate, useShop } from "../lib/shop-store";

export const Route = createFileRoute("/reminders")({
  head: () => ({
    meta: [
      { title: "Bills & Reminders — Ozzy Coffee Management" },
      {
        name: "description",
        content:
          "Track house rent, waitress salary and the monthly light bill, with predicted amounts from past payments.",
      },
      { property: "og:title", content: "Bills & Reminders — Ozzy Coffee Management" },
      {
        property: "og:description",
        content: "Never miss rent, salary or the light bill at Ozzy Coffee.",
      },
    ],
  }),
  component: RemindersPage,
});

function RemindersPage() {
  const { reminders, updateReminder, payReminder, addReminder, deleteReminder } = useShop();
  const today = isoDate(new Date());

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(addMonths(today, 1));
  const [recurring, setRecurring] = useState<"monthly" | "once">("monthly");
  const [payAmount, setPayAmount] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const a = Number(amount);
    if (!title.trim()) { toast.error("Give the bill a name."); return; }
    if (!a || a <= 0) { toast.error("Enter the amount."); return; }
    addReminder({ title: title.trim(), amount: a, dueDate, recurring, paid: false, history: [] });
    toast.success(`${title} reminder added`);
    setTitle("");
    setAmount("");
  }

  return (
    <AppShell
      title="Bills & reminders"
      description="Rent, salary and the light bill. Enter what you actually paid each month and the next amount is predicted from your history."
    >
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="size-5 text-primary" />
              Add a bill
            </CardTitle>
            <CardDescription>Monthly or one-off</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Name</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Water bill"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Expected amount (ETB)</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due">Due date</Label>
                <Input
                  id="due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Repeats</Label>
                <Select value={recurring} onValueChange={(v) => setRecurring(v as typeof recurring)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Every month</SelectItem>
                    <SelectItem value="once">One time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Add reminder
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {reminders.map((r) => {
            const history = r.history ?? [];
            const predicted = history.length
              ? history.reduce((s, h) => s + h.amount, 0) / history.length
              : r.amount;
            const overdue = !r.paid && r.dueDate < today;
            return (
              <Card key={r.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        {r.title.toLowerCase().includes("light") ? (
                          <Zap className="size-4 text-caramel-foreground" />
                        ) : null}
                        {r.title}
                      </CardTitle>
                      <CardDescription>
                        Due {r.dueDate} · {r.recurring === "monthly" ? "monthly" : "one time"}
                      </CardDescription>
                    </div>
                    <Badge variant={overdue ? "destructive" : r.paid ? "secondary" : "outline"}>
                      {overdue ? "Overdue" : r.paid ? "Paid" : "Upcoming"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor={`amt-${r.id}`} className="text-xs">
                      Expected amount (ETB)
                    </Label>
                    <Input
                      id={`amt-${r.id}`}
                      type="number"
                      min={0}
                      value={r.amount}
                      onChange={(e) =>
                        updateReminder(r.id, { amount: Number(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <p className="rounded-lg bg-secondary/60 p-2 text-xs text-muted-foreground">
                    Predicted next bill:{" "}
                    <span className="font-semibold text-foreground">{formatETB(predicted)}</span>
                    {history.length ? ` (average of ${history.length} payments)` : " (no history yet)"}
                    <br />
                    That is about {formatETB(predicted / 30)} per day of running cost.
                  </p>

                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <Label htmlFor={`pay-${r.id}`} className="text-xs">
                        Record payment (ETB)
                      </Label>
                      <Input
                        id={`pay-${r.id}`}
                        type="number"
                        min={0}
                        placeholder={String(r.amount)}
                        value={payAmount[r.id] ?? ""}
                        onChange={(e) => setPayAmount((p) => ({ ...p, [r.id]: e.target.value }))}
                      />
                    </div>
                    <Button
                      onClick={() => {
                        const v = Number(payAmount[r.id] || r.amount);
                        if (!v) { toast.error("Enter the amount paid."); return; }
                        payReminder(r.id, v, today);
                        setPayAmount((p) => ({ ...p, [r.id]: "" }));
                        toast.success(`${r.title}: ${formatETB(v)} recorded`);
                      }}
                    >
                      Mark paid
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        deleteReminder(r.id);
                        toast.success("Reminder removed");
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>

                  {history.length ? (
                    <div className="text-xs text-muted-foreground">
                      History:{" "}
                      {history
                        .slice(-4)
                        .map((h) => `${h.date} — ${formatETB(h.amount)}`)
                        .join(" · ")}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
