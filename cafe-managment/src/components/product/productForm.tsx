// src/components/ProductForm.tsx
import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Coffee } from "lucide-react"
import { useInventories } from "@/hooks/useInventories"
import { useCreateProduct } from "@/hooks/useProducts"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  productSchema,
  type ProductFormData,
  type ProductFormInput,
} from "@/lib/validations/product"

// Shape returned by the API/DB for an existing product. NOTE: I'm assuming
// the field is named `ingredient_id` to match what gets written on submit —
// the original code read `initialData?.ingredient` instead, which looks
// like a naming mismatch bug. Confirm this against your actual GET

interface ProductFormProps {
  initialData?: ProductFormData & { id?: string | number }
  open: boolean
  setOpen: (open: boolean) => void
}

const EMPTY_DEFAULTS: ProductFormInput = {
  item: "",
  selling_price: "",
  ingredient_id: "none",
  usage_per_unit: "",
}

export function ProductForm({ initialData, open, setOpen }: ProductFormProps) {
  console.log("inital data", initialData)
  const isEditing = !!initialData
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY_DEFAULTS,
  })

  const createProduct = useCreateProduct()
  // const updateProduct = useUpdateProduct() // wire up once the edit route exists
  const { data: inventories } = useInventories()
  const item = watch("item")
  const ingredientId = watch("ingredient_id")
  const hasIngredient = !!ingredientId && ingredientId !== "none"
  const selectedIngredient = inventories?.find((inv) => inv.id === ingredientId)
  const unitHint = selectedIngredient?.unit_of_measurement?.name || "units"

  // Populate the form when opening in edit mode, reset to blank for "create".
  useEffect(() => {
    if (!open) return

    if (isEditing && initialData) {
      reset({
        item: initialData.item,
        selling_price: String(initialData.selling_price),
        ingredient_id: initialData.ingredient_id ?? "none",
        usage_per_unit:
          initialData.usage_per_unit !== null && initialData.usage_per_unit !== undefined
            ? String(initialData.usage_per_unit)
            : "",
      })
    } else {
      reset(EMPTY_DEFAULTS)
    }
  }, [open, isEditing, initialData, reset])

  // `data` here is ProductFormData (the schema's OUTPUT type) — zod has
  // already coerced selling_price/usage_per_unit to real numbers, and
  // normalized "none"/"" ingredient_id to undefined.
  const onSubmit = (data: ProductFormData) => {
    const payload = {
      item: data.item.trim(),
      selling_price: data.selling_price,
      ingredient_id: data.ingredient_id,
      usage_per_unit: data.usage_per_unit,
    }

    const mutationOptions = {
      onSuccess: () => {
        reset(EMPTY_DEFAULTS)
        setOpen(false)
      },
      onError: (error: unknown) => {
        console.error("Failed to save product:", error)
      },
    }

    if (isEditing && initialData?.id) {
      // TODO: once useUpdateProduct exists, follow the same { id, updates }
      // shape as useUpdateInventory — see inventory-form.tsx for the pattern
      // (and why passing a flat object here will silently break the update).
      console.log("Update logic here", { id: initialData.id, updates: payload })
    } else {
      createProduct.mutate(payload, mutationOptions)
    }
  }

  const isBusy = isSubmitting || createProduct.isPending

  return (
    <Sheet open={open} onOpenChange={(next) => !isBusy && setOpen(next)}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <Coffee className="size-5 text-primary" />
            {isEditing ? "Edit Product" : "Add New Product"}
          </SheetTitle>
          <SheetDescription>
            Define a menu item and optionally link it to inventory for automatic stock deduction.
          </SheetDescription>
        </SheetHeader>

        <form id="PRODUCT_FORM_ID" onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4" noValidate>
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="item">Product Name</Label>
            <Input
              id="item"
              type="text"
              placeholder="e.g., Coffee, Tea"
              disabled={isBusy}
              aria-invalid={!!errors.item}
              {...register("item")}
            />
            {errors.item && (
              <p className="text-xs text-destructive">{errors.item.message}</p>
            )}
          </div>

          {/* Selling Price */}
          <div className="space-y-2">
            <Label htmlFor="selling_price">Selling Price (ETB)</Label>
            <Input
              id="selling_price"
              type="number"
              min={0}
              step="0.01"
              placeholder="e.g., 85.00"
              disabled={isBusy}
              aria-invalid={!!errors.selling_price}
              {...register("selling_price")}
            />
            {errors.selling_price && (
              <p className="text-xs text-destructive">{errors.selling_price.message}</p>
            )}
          </div>

          {/* Linked Inventory Item (Optional) */}
          <div className="space-y-2 w-full">
            <Label htmlFor="ingredient">Main Ingredient</Label>
            <Controller
              name="ingredient_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || "none"}
                  onValueChange={field.onChange}
                  disabled={isBusy}
                >
                  <SelectTrigger id="ingredient" className="w-full" aria-invalid={!!errors.ingredient_id}>
                    <SelectValue placeholder="Select an inventory item to track stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No linked ingredient</SelectItem>
                    {inventories?.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.item} ({inv.remaining} {inv.unit_of_measurement?.name} left)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.ingredient_id && (
              <p className="text-xs text-destructive">{errors.ingredient_id.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Linking an ingredient allows the system to deduct stock when this product is sold.
            </p>
          </div>

          {/* Usage Per Unit (Only shows if ingredient is selected) */}
          {hasIngredient && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="usage_per_unit">
                Usage per 1 sold ({unitHint})
              </Label>
              <Input
                id="usage_per_unit"
                type="number"
                min={0}
                step="0.01"
                placeholder="e.g., 0.25 (for 250ml or 250g)"
                disabled={isBusy}
                aria-invalid={!!errors.usage_per_unit}
                {...register("usage_per_unit")}
              />
              {errors.usage_per_unit && (
                <p className="text-xs text-destructive">{errors.usage_per_unit.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                How much of "{selectedIngredient?.item}" is used to make ONE "{item || "product"}"?
              </p>
            </div>
          )}
        </form>
          {/* Submit Button */}
        <SheetFooter>
          <Button form="PRODUCT_FORM_ID" type="submit" className="w-full" disabled={isBusy}>
            {isBusy ? "Saving..." : isEditing ? "Update Product" : "Add Product"}
          </Button>
          <Button variant="outline" form="PRODUCT_FORM_ID" type="reset" className="w-full" disabled={isBusy}>
            Reset form
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}