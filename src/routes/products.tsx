import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../components/app-shell";
import { ProductForm } from "@/components/product/productForm";
import { ProductList } from "@/components/product/productList";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products & Prices — Ozzy Coffee Management" },
      {
        name: "description",
        content:
          "Set the selling price of every cup and how many grams of coffee, peanut butter or chips each one uses.",
      },
      { property: "og:title", content: "Products & Prices — Ozzy Coffee Management" },
      {
        property: "og:description",
        content: "Set selling prices and per-cup material usage to get exact profit per product.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const [open, setOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const handleEdit = (item: any) => {
    setEditingItem(item) // Pass the specific item's data
    setOpen(true)
  }
   
  const handleNew = () => {
    setEditingItem(null)
    setOpen(true)
  }

  return (
    <AppShell
      title="Products & prices"
      description="Set what you charge and how much material each unit uses. Everything else — cost, profit and stock forecasts — is calculated from here."
      actions={
        <Button onClick={handleNew} size="sm">
          <Plus className="size-4 sm:mr-1" />
          <span className="hidden sm:inline">New entry</span>
        </Button>
      }
    >
      <ProductForm open={open} setOpen={setOpen} initialData={editingItem}/>
      <div>
        <ProductList onEdit={handleEdit}/>
      </div>
    </AppShell>
  );
}
