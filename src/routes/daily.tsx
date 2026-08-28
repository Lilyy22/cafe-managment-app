import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { Button } from "../components/ui/button";
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
        <SalesForm open={open} setOpen={setOpen} />

        <div className="space-y-6">
          <SalesList />
        </div>
      </div>
    </AppShell>
  );
}