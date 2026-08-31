import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/app-shell";
import { ExpenseForm } from "@/components/expense/expenseForm";
import { ExpenseList } from "@/components/expense/expenseList";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/expense")({
  head: () => ({
    meta: [
      { title: "Expenses — Ozzy Coffee Management" },
      {
        name: "description",
        content:
          "Search and filter every expense",
      },
      { property: "og:title", content: "Expenses — Ozzy Coffee Management" },
      {
        property: "og:description",
        content: "Filterable ledger of Ozzy Coffee , expenses",
      },
    ],
  }),
  component: ExpensePage,
});

function ExpensePage() {
    const [open, setOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)
  
    // const handleEdit = (item: any) => {
    //   setEditingItem(item) // Pass the specific item's data
    //   setOpen(true)
    // }
    const handleNew = () => {
      setOpen(true)
      setEditingItem(null)
    }
  
    return (
    <AppShell
        title="Expense"
        description="Warehouse stock, cost per unit and when to buy next. Purchases are also recorded as expenses."
        actions={
          <Button onClick={handleNew} size="sm">
            <Plus className="size-4 sm:mr-1" />
            <span className="hidden sm:inline">New entry</span>
          </Button>
        }
      >
        <ExpenseForm 
          open={open} 
          setOpen={setOpen}
          initialData={editingItem} 
        />
        <ExpenseList />
    </AppShell>
  );
}