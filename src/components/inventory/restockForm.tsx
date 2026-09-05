import { useState, useEffect } from "react"
import { PackagePlus, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useRestockInventory } from "@/hooks/useInventories"
import type { InventoryRecord } from "./inventoryForm"

interface RestockFormProps {
  item: InventoryRecord | null
  open: boolean
  setOpenRestock: (open: boolean) => void
}

export function RestockForm({ item, open, setOpenRestock }: RestockFormProps) {
  const [quantityAdded, setQuantityAdded] = useState("")
  const [totalCost, setTotalCost] = useState("")
  const [note, setNote] = useState("")
  
  const restock = useRestockInventory()

  // Reset form when item changes or sheet closes
  useEffect(() => {
    if (!open || !item) {
      setQuantityAdded("")
      setTotalCost("")
      setNote("")
    }
  }, [open, item])

  const handleConfirm = () => {
    if (!item) return
    restock.mutate(
      {
        inventoryId: item.id,
        quantityAdded: parseFloat(quantityAdded),
        totalCost: parseFloat(totalCost),
        note: note.trim() || undefined,
      },
      { 
        // ✅ FIX 1: Must be a callback function, and should set to FALSE to close
        onSuccess: () => setOpenRestock(false) 
      }
    )
  }

  // Live preview calculations
  const qty = parseFloat(quantityAdded) || 0
  const cost = parseFloat(totalCost) || 0
  const newRemaining = item ? item.remaining + qty : 0
  const currentTotalValue = item ? item.remaining * item.price : 0
  const newTotalValue = currentTotalValue + cost
  const newAvgCost = newRemaining > 0 ? newTotalValue / newRemaining : 0

  return (
    // ✅ FIX 2: When isOpen is false (user clicked outside), set open to FALSE
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && setOpenRestock(false)}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:min-w-lg">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <PackagePlus className="size-5 text-primary" />
            Restock Item
          </SheetTitle>
          <SheetDescription>
            Add new stock and automatically record the expense.
          </SheetDescription>
        </SheetHeader>

        {item && (
          <div className="space-y-6 p-4">
            {/* Current State Card */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="font-semibold text-foreground">{item.item}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Current Remaining</p>
                  <p className="font-medium">
                    {item.remaining} {typeof item.unit_of_measurement === 'string' ? item.unit_of_measurement : item.unit_of_measurement?.name || 'units'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Avg Cost</p>
                  <p className="font-medium">{item.price.toFixed(2)} ETB / unit</p>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity to Add</Label>
                <Input
                  id="qty"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0"
                  value={quantityAdded}
                  onChange={(e) => setQuantityAdded(e.target.value)}
                  disabled={restock.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Total Cost Paid (ETB)</Label>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  disabled={restock.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Textarea
                  id="note"
                  placeholder="e.g., Bought from Supplier X, Invoice #123"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={restock.isPending}
                  className="resize-none"
                  rows={2}
                />
              </div>
            </div>

            {/* Live Preview */}
            {qty > 0 && cost > 0 && (
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 space-y-2">
                <p className="text-xs font-semibold text-primary flex items-center gap-1">
                  <TrendingUp className="size-3" /> After Restock:
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">New Remaining</p>
                    <p className="font-bold text-foreground">{newRemaining.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">New Avg Cost</p>
                    <p className="font-bold text-foreground">{newAvgCost.toFixed(2)} ETB</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <SheetFooter className="border-t p-4">
          <Button 
            onClick={handleConfirm} 
            disabled={restock.isPending || qty <= 0 || cost < 0} 
            className="w-full"
          >
            {restock.isPending ? "Processing..." : "Confirm Restock"}
          </Button>
          <Button
            variant="outline"
            // ✅ FIX 3: Cancel should set open to FALSE
            onClick={() => setOpenRestock(false)}
            disabled={restock.isPending}
            className="w-full"
          >
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}