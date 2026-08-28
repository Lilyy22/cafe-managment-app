import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { Button } from "../components/ui/button";
import { BillForm } from "@/components/bill/billForm";
import { BillList } from "@/components/bill/billList";

export const Route = createFileRoute("/bill")({
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
  component: BillPage,
});

function BillPage() {
  const [open, setOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const handleEdit = (item: any) => {
    setEditingItem(item) // Pass the specific item's data
    setOpen(true)
  }
  const handleNew = () => {
    setOpen(true)
    setEditingItem(null)
  }

  return (
    <AppShell
      title="Bills & reminders"
      description="Rent, salary and the light bill. Enter what you actually paid each month and the next amount is predicted from your history."
      actions={
        <Button onClick={handleNew} size="sm">
          <Plus className="size-4 sm:mr-1" />
          <span className="hidden sm:inline">New entry</span>
        </Button>
      }
   >
      <BillForm 
        open={open} 
        setOpen={setOpen}
        initialData={editingItem} 
      />
      <BillList onEdit={handleEdit}/>
      
    </AppShell>
  );
}
