// src/components/sales/salesForm.tsx
import { useEffect, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { Link } from "@tanstack/react-router"
import { useCreateSale, useUpdateSale, useDeleteSale } from "@/hooks/useSales"
import { useProducts } from "@/hooks/useProducts"
import { useInventories } from "@/hooks/useInventories"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { ProductRecord } from "@/components/product/productForm"
import { SalesSummary } from "./salesSummary"
import {
  salesFormSchema,
  type SalesFormData,
  type SalesFormInput,
} from "@/lib/validations/sales"

// Helper to format ETB currency
function formatETB(amount: number): string {
  return `${amount.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`
}

// Shape of a persisted sale record. NOT independently confirmed against
// your actual useSales.ts — adjust field names if they differ.
export interface SaleRecord {
  id: string
  date: string
  product_id: string
  quantity: number
  total_amount: number
  note?: string | null
}

// What you pass in to edit an existing day's batch of sales.
export interface SalesDayBatch {
  date: string
  note?: string | null
  sales: SaleRecord[]
}

interface SalesFormProps {
  initialData?: SalesDayBatch
  open: boolean
  setOpen: (open: boolean) => void
}

const FORM_ID = "SALES_FORM_ID"

function todayIso(): string {
  return new Date().toISOString().split("T")[0]
}

// Builds the form's default values from either an existing day's batch
// (edit mode) or a blank day (create mode), always producing exactly one
// row per current product so the row order/set matches what's on screen.
function getDefaultValues(
  products: ProductRecord[] | undefined,
  initialData: SalesDayBatch | undefined
): SalesFormInput {
  const salesByProduct = new Map((initialData?.sales ?? []).map((s) => [s.product_id, s]))

  return {
    date: initialData?.date ?? todayIso(),
    note: initialData?.note ?? "",
    items: (products ?? []).map((p) => {
      const existing = salesByProduct.get(p.id)
      return {
        product_id: p.id,
        quantity: existing ? String(existing.quantity) : "",
      }
    }),
  }
}

export function SalesForm({ initialData, open, setOpen }: SalesFormProps) {
  const isEditing = !!initialData
  const { data: products, isLoading: productsLoading } = useProducts()
  const { data: inventories } = useInventories()

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SalesFormInput, unknown, SalesFormData>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: { date: todayIso(), note: "", items: [] },
  })

  const { fields, replace } = useFieldArray({ control, name: "items" })

  const createSale = useCreateSale()
  const updateSale = useUpdateSale()
  const deleteSale = useDeleteSale()

  // (Re)populate rows once products load, and whenever the sheet opens for
  // a given date/edit target. Field array rows are keyed by product, so
  // this needs to run whenever the product list itself changes too.
  useEffect(() => {
    if (!open || !products) return
    replace(getDefaultValues(products, initialData).items)
    reset(getDefaultValues(products, initialData), { keepValues: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, products, initialData])

  const items = watch("items")

  const previewSales = useMemo(() => {
    if (!products) return 0
    return items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0
      const product = products.find((p) => p.id === item.product_id)
      return sum + qty * (product?.selling_price ?? 0)
    }, 0)
  }, [items, products])

  // Material cost + per-ingredient stock impact, derived from live
  // quantities. Cost basis for an ingredient is price/quantity (average
  // cost per unit purchased — same calc used in ProductManagementList).
  // "Leaves" uses the ingredient's CURRENT remaining stock from
  // useInventories, not the possibly-stale snapshot nested on the product.
  const { materialCost, stockImpact } = useMemo(() => {
    if (!products || !inventories) return { materialCost: 0, stockImpact: [] as Array<{
      id: string
      name: string
      unit: string
      deduction: number
      remaining: number
      projectedRemaining: number
    }> }

    let cost = 0
    const byIngredient = new Map<string, { name: string; unit: string; deduction: number; remaining: number }>()

    for (const item of items) {
      const qty = Number(item.quantity) || 0
      if (qty <= 0) continue

      const product = products.find((p) => p.id === item.product_id)
      if (!product?.ingredient) continue

      const inv = inventories.find((i) => i.id === product.ingredient!.id)
      if (!inv) continue

      const unitCost = inv.price / (inv.quantity || 1)
      const deduction = qty * (product.usage_per_unit ?? 0)
      cost += deduction * unitCost

      const existing = byIngredient.get(inv.id)
      if (existing) {
        existing.deduction += deduction
      } else {
        byIngredient.set(inv.id, {
          name: inv.item,
          unit: inv.unit_of_measurement?.name ?? "",
          deduction,
          remaining: inv.remaining,
        })
      }
    }

    const stockImpact = Array.from(byIngredient.entries()).map(([id, v]) => ({
      id,
      ...v,
      projectedRemaining: v.remaining - v.deduction,
    }))

    return { materialCost: cost, stockImpact }
  }, [items, products, inventories])

  const isBusy =
    isSubmitting || createSale.isPending || updateSale.isPending || deleteSale.isPending

  const onSubmit = async (data: SalesFormData) => {
    const existingByProduct = new Map((initialData?.sales ?? []).map((s) => [s.product_id, s]))

    const creates: Array<{
      date: string
      product_id: string
      quantity: number
      total_amount: number
      note?: string
    }> = []
    const updates: Array<{ id: string; updates: Partial<Pick<SaleRecord, "quantity" | "total_amount" | "note">> }> = []
    const deletes: string[] = []

    for (const item of data.items) {
      const qty = item.quantity ?? 0
      const existing = existingByProduct.get(item.product_id)
      const product = products?.find((p) => p.id === item.product_id)
      const totalAmount = qty * (product?.selling_price ?? 0)

      if (qty > 0) {
        if (existing) {
          if (existing.quantity !== qty) {
            updates.push({
              id: existing.id,
              updates: { quantity: qty, total_amount: totalAmount, note: data.note || undefined },
            })
          }
        } else {
          creates.push({
            date: data.date,
            product_id: item.product_id,
            quantity: qty,
            total_amount: totalAmount,
            note: data.note || undefined,
          })
        }
      } else if (existing) {
        // Quantity was cleared to 0/blank on a row that previously had a
        // recorded sale — treat that as "we didn't actually sell this."
        deletes.push(existing.id)
      }
    }

    if (creates.length === 0 && updates.length === 0 && deletes.length === 0) {
      toast.info("No changes to save.")
      return
    }

    try {
      await Promise.all([
        ...creates.map((c) => createSale.mutateAsync(c)),
        ...updates.map((u) => updateSale.mutateAsync(u)),
        ...deletes.map((id) => deleteSale.mutateAsync(id)),
      ])
      toast.success(isEditing ? "Sales updated!" : "Sales recorded!")
      setOpen(false)
    } catch (error) {
      console.error("Failed to save sales:", error)
      toast.error("Failed to save sales. Check console for details.")
    }
  }

  if (productsLoading) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !isBusy && setOpen(next)}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit day's sales" : "Record sales"}</SheetTitle>
          <SheetDescription>How many of each you sold</SheetDescription>
        </SheetHeader>

        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4 pb-8" noValidate>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              disabled={isBusy || isEditing} // changing the date on an edit would orphan the batch's identity
              aria-invalid={!!errors.date}
              {...register("date")}
            />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => {
              const product = products?.find((p) => p.id === field.product_id)
              if (!product) return null
              const unit = "unit" // see note above: products have no dedicated selling-unit field yet

              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={`items.${index}.quantity`}>
                    {product.item} ({unit}){" "}
                    <span className="text-xs text-muted-foreground">
                      @ {formatETB(product.selling_price)}
                    </span>
                  </Label>
                  <Input
                    id={`items.${index}.quantity`}
                    type="number"
                    min={0}
                    placeholder="0"
                    disabled={isBusy}
                    aria-invalid={!!errors.items?.[index]?.quantity}
                    {...register(`items.${index}.quantity` as const)}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-xs text-destructive">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          {errors.items?.root && (
            <p className="text-xs text-destructive">{errors.items.root.message}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              disabled={isBusy}
              placeholder="Anything unusual today?"
              className="resize-none"
              {...register("note")}
            />
          </div>

          <SalesSummary sales={previewSales} materialCost={materialCost} stockImpact={stockImpact} />
        </form>

        <SheetFooter>
          <Button form={FORM_ID} type="submit" className="w-full" disabled={isBusy}>
            {isBusy ? "Saving..." : isEditing ? "Update sales" : "Record sales"}
          </Button>
          <Button
            variant="outline"
            type="button"
            className="w-full"
            disabled={isBusy}
            onClick={() => {
              if (!products) return
              const defaults = getDefaultValues(products, initialData)
              replace(defaults.items)
              reset(defaults)
            }}
          >
            Reset form
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Prices or units wrong?{" "}
            <Link to="/products" className="underline text-primary">
              Edit products
            </Link>
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}