import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/app-shell";
import { InventoryForm } from "@/components/inventory/inventoryForm";
import { InventoryList } from "@/components/inventory/inventoryList";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Ozzy Coffee Management" },
      {
        name: "description",
        content:
          "Add coffee bean sacks and other stock, see what is left, and know when to buy again.",
      },
      { property: "og:title", content: "Inventory — Ozzy Coffee Management" },
      {
        property: "og:description",
        content: "Stock levels, cost per gram and restock forecasts for Ozzy Coffee.",
      },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
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
      title="Inventory"
      description="Warehouse stock, cost per unit and when to buy next. Purchases are also recorded as expenses."
      actions={
        <Button onClick={handleNew} size="sm">
          <Plus className="size-4 sm:mr-1" />
          <span className="hidden sm:inline">New entry</span>
        </Button>
      }
    >
       <InventoryForm 
        open={open} 
        setOpen={setOpen}
        initialData={editingItem} 
      />
      <InventoryList 
        onEdit={handleEdit}
      />
    </AppShell>
  );
}
