import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/app-shell";
import { InventoryForm, type InventoryRecord } from "@/components/inventory/inventoryForm";
import { InventoryList } from "@/components/inventory/inventoryList";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestockForm } from "@/components/inventory/restockForm";

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
  const [open, setOpen] = useState(false);
  const [openRestock, setOpenRestock] = useState(false);
  
  // ✅ Use proper types instead of 'any'
  const [editingItem, setEditingItem] = useState<InventoryRecord | undefined>(undefined);
  const [restockingItem, setRestockingItem] = useState<InventoryRecord | null>(null);

  const handleEdit = (item: InventoryRecord) => {
    setEditingItem(item);
    setOpen(true);
  };

  const handleNew = () => {
    setEditingItem(undefined);
    setOpen(true);
  };

  // ✅ Update to accept the specific item being restocked
  const handleRestock = (item: InventoryRecord) => {
    setRestockingItem(item);
    setOpenRestock(true);
  };

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
      
      {/* ✅ Pass the onRestock handler down to the list */}
      <InventoryList 
        onEdit={handleEdit}
        onRestock={handleRestock}
      />
      
      {/* ✅ Fix prop name: setOpenRestock instead of setOpen */}
      <RestockForm 
        open={openRestock} 
        setOpenRestock={setOpenRestock} 
        item={restockingItem} 
      />
    </AppShell>
  );
}