import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { PackagePlus } from "lucide-react"
import { useCreateInventory, useMeasurementUnits, useUpdateInventory } from "@/hooks/useInventories"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { inventorySchema, type InventoryFormData } from "@/lib/validations/inventory"

interface InventoryFormProps {
  initialData?: InventoryFormData & { id?: string | number }
  open: boolean
  setOpen: (open: boolean) => void
}

const EMPTY_DEFAULTS: InventoryFormData = {
  item: "",
  quantity: "" as unknown as number,
  remaining: "" as unknown as number,
  price: "" as unknown as number,
  unit_of_measurement: "",
}

export function InventoryForm({ initialData, open, setOpen }: InventoryFormProps) {
  const isEditing = !!initialData
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: EMPTY_DEFAULTS,
  })

  const createInventory = useCreateInventory()
  const updateInventory = useUpdateInventory()
  const { data: units, isLoading: unitsLoading } = useMeasurementUnits()

  const quantity = watch("quantity")
  const price = watch("price")
  const unit_of_measurement = watch("unit_of_measurement")
  const selectedUnit = units?.find((u) => u.name === unit_of_measurement)

  // Populate the form when opening in edit mode, reset to blank for "create"
  useEffect(() => {
    if (open) {
      if (isEditing && initialData) {
        reset({
          item: initialData.item,
          quantity: String(initialData.quantity),
          remaining: String(initialData.remaining),
          price: String(initialData.price),
          unit_of_measurement: initialData.unit_of_measurement?.name ?? "",
        })
      } else {
        reset(EMPTY_DEFAULTS)
      }
    }
  }, [open, isEditing, initialData, reset])

  // Auto-fill "remaining" with "quantity" only for a brand-new purchase, and only while the user hasn't touched "remaining" yet.
  useEffect(() => {
    if (!isEditing && quantity !== undefined && quantity !== ("" as unknown as number)) {
      setValue("remaining", quantity, { shouldValidate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, isEditing])

  const onSubmit = (data: InventoryFormData) => {
    const fields = {
      item: data.item.trim(),
      quantity: Number(data.quantity),
      remaining: Number(data.remaining),
      price: Number(data.price),
      unit_of_measurement: data.unit_of_measurement,
    }

    const mutationOptions = {
      onSuccess: () => {
        reset(EMPTY_DEFAULTS)
        setOpen(false)
      },
      onError: (error: unknown) => {
        console.error("Failed to save inventory item:", error)
      },
    }
 
    // create and update take genuinely different argument shapes
    // (useUpdateInventory expects { id, updates }), so branch explicitly
    // rather than forcing both through one call with a type-unsafe cast.
    if (isEditing && initialData?.id) {
      console.log({ id: initialData?.id, updates: fields })
      updateInventory.mutate({ id: initialData.id, updates: fields }, mutationOptions)
    } else {
      createInventory.mutate(fields, mutationOptions)
    }
  }

  const isBusy = isSubmitting || createInventory.isPending || updateInventory.isPending

  return (
    <Sheet open={open} onOpenChange={(next) => !isBusy && setOpen(next)}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:min-w-lg ">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <PackagePlus className="size-5 text-primary" />
            {isEditing ? "Edit stock item" : "Add stock purchase"}
          </SheetTitle>
          <SheetDescription>
            e.g. 50,000 g coffee beans for 50,000 ETB
          </SheetDescription>
        </SheetHeader>

        <form id="INVENTORY_FORM_ID" onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4" noValidate>
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="item">Item Name</Label>
            <Input
              id="item"
              type="text"
              placeholder="e.g., Arabica Coffee Beans"
              disabled={isBusy}
              aria-invalid={!!errors.item}
              {...register("item")}
            />
            {errors.item && (
              <p className="text-xs text-destructive">{errors.item.message}</p>
            )}
          </div>

          {/* Quantity & unit of measurement*/}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity {selectedUnit ? `(${selectedUnit.name})` : ""}
              </Label>
              <Input
                id="quantity"
                type="number"
                min={0}
                step="0.01"
                placeholder="50000"
                disabled={isBusy}
                aria-invalid={!!errors.quantity}
                {...register("quantity", { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            {/* Unit of Measurement */}
            <div className="space-y-2 w-full">
              <Label htmlFor="unit_of_measurement">Unit of Measurement</Label>
              {unitsLoading ? (
                <div className="text-sm text-muted-foreground">Loading units...</div>
              ) : (
                <Controller
                  name="unit_of_measurement"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isBusy}
                    >
                      <SelectTrigger id="unit_of_measurement" className="w-full" aria-invalid={!!errors.unit_of_measurement}>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units?.map((m) => (
                          <SelectItem key={m.name} value={m.name}>
                            {m.name} {m.description ? `(${m.description})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
              {errors.unit_of_measurement && (
                <p className="text-xs text-destructive">{errors.unit_of_measurement.message}</p>
              )}
            </div>
          </div>

          {/* Remaining */}
          <div className="space-y-2">
            <Label htmlFor="remaining">
              Remaining Stock {selectedUnit ? `(${selectedUnit.name})` : ""}
            </Label>
            <Input
              id="remaining"
              type="number"
              min={0}
              step="0.01"
              placeholder="50000"
              disabled={isBusy}
              aria-invalid={!!errors.remaining}
              {...register("remaining", { valueAsNumber: true })}
            />
            {errors.remaining && (
              <p className="text-xs text-destructive">{errors.remaining.message}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Total price paid (ETB)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              placeholder="50000"
              disabled={isBusy}
              aria-invalid={!!errors.price}
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            )}
          </div>

          {/* Dynamic Cost Calculation */}
          {Number(quantity) > 0 && Number(price) > 0 && (
            <p className="rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
              Cost per {selectedUnit?.name || "unit"}:{" "}
              <span className="font-semibold text-foreground">
                {(Number(price) / Number(quantity)).toFixed(3)} ETB
              </span>
            </p>
          )}
        </form>
        {/* Submit Button */}
        <SheetFooter>
          <Button form="INVENTORY_FORM_ID" type="submit" disabled={isBusy}>
            {isBusy ? "Saving..." : isEditing ? "Update Item" : "Add to warehouse"}
          </Button>
          <Button variant="outline" form="INVENTORY_FORM_ID" type="reset" disabled={isBusy}>
            Reset form
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}