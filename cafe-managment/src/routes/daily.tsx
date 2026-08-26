import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../components/app-shell";
import { Button } from "../components/ui/button";
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
import { Textarea } from "../components/ui/textarea";
import {
  type ProductId,
  cupsOf,
  formatETB,
  isoDate,
  materialCostOf,
  revenueOf,
  usageOf,
  useShop,
} from "../lib/shop-store";
import { SalesForm } from "@/components/sales/salesForm";
import { SalesList } from "@/components/sales/salesList";

export const Route = createFileRoute("/daily")({
  head: () => ({
    meta: [
      { title: "Daily Entry — Ozzy Coffee Management" },
      {
        name: "description",
        content: "Record cups sold, tea, chips, biscuits and water and auto-deduct raw materials.",
      },
      { property: "og:title", content: "Daily Entry — Ozzy Coffee Management" },
      {
        property: "og:description",
        content: "Record daily sales for Ozzy Coffee and keep stock levels up to date.",
      },
    ],
  }),
  component: DailyPage,
});

function DailyPage() {
  const { entries, products, addEntry, deleteEntry, materialStats } = useShop();
  const [date, setDate] = useState(isoDate(new Date()));
  const [sold, setSold] = useState<Partial<Record<ProductId, number>>>({});
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <AppShell
      title="Daily entry"
      description="One quick form per day. Stock is deducted automatically from the per-unit amounts you set on the Products page."
      actions={
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="size-4 sm:mr-1" />
          <span className="hidden sm:inline">New entry</span>
        </Button>
      }
    >
      <div>
        <SalesForm
         sold={sold} 
         setSold={setSold} 
         date={date} 
         setDate={setDate}
         note={note}
         setNote={setNote}
         open={open}
         setOpen={setOpen}
         />

        <div className="space-y-6">
          <SalesList />
        </div>
      </div>
    </AppShell>
  );
}
