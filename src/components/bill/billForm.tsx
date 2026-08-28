import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText } from "lucide-react"
import { useCreateBill, useUpdateBill } from "@/hooks/useBills" // Adjust path if needed
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea" // Assuming you have this, otherwise use Input
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  billFormSchema,
  billSubmissionSchema,
  type BillFormInput,
  type BillSubmissionData,
} from "@/lib/validations/bill"
import type { Bill } from "@/types/database" // Adjust path to your Bill type

interface BillFormProps {
  initialData?: Bill
  open: boolean
  setOpen: (open: boolean) => void
}

const EMPTY_DEFAULTS: BillFormInput = {
  vendor_name: "",
  category: "",
  amount: "",
  due_date: "",
  description: "",
}

const BILL_CATEGORIES = [
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities (Electric/Water)" },
  { value: "supplier", label: "Supplier Invoice" },
  { value: "salary", label: "Salary / Wages" },
  { value: "maintenance", label: "Maintenance / Repair" },
  { value: "other", label: "Other" },
]

function getDefaultValues(isEditing: boolean, initialData: Bill | undefined): BillFormInput {
  if (isEditing && initialData) {
    // Format date to YYYY-MM-DD for the HTML date input
    const formattedDate = initialData.due_date 
      ? new Date(initialData.due_date).toISOString().split("T")[0] 
      : ""

    return {
      vendor_name: initialData.vendor_name,
      category: initialData.category || "",
      amount: String(initialData.amount),
      due_date: formattedDate,
      description: initialData.description || "",
    }
  }
  return EMPTY_DEFAULTS
}

export function BillForm({ initialData, open, setOpen }: BillFormProps) {
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BillFormInput>({
    resolver: zodResolver(billFormSchema),
    defaultValues: EMPTY_DEFAULTS,
  })

  const createBill = useCreateBill()
  const updateBill = useUpdateBill()

  // Populate the form when opening in edit mode, reset to blank for "create"
  useEffect(() => {
    if (!open) return
    reset(getDefaultValues(isEditing, initialData))
  }, [open, isEditing, initialData, reset])

  const onSubmit = (raw: BillFormInput) => {
    // Transform strings to proper types using our submission schema
    const data: BillSubmissionData = billSubmissionSchema.parse(raw)

    const mutationOptions = {
      onSuccess: () => {
        reset(EMPTY_DEFAULTS)
        setOpen(false)
      },
      onError: (error: unknown) => {
        console.error("Failed to save bill:", error)
      },
    }

    if (isEditing && initialData?.id) {
      // When updating, we don't want to accidentally reset the status to 'unpaid'
      // So we only send the fields that can be edited.
      updateBill.mutate(
        { 
          id: initialData.id, 
          updates: {
            vendor_name: data.vendor_name,
            category: data.category,
            amount: data.amount,
            due_date: data.due_date,
            description: data.description,
          } 
        }, 
        mutationOptions
      )
    } else {
      createBill.mutate(data, mutationOptions)
    }
  }

  const isBusy = isSubmitting || createBill.isPending || updateBill.isPending

  return (
    <Sheet open={open} onOpenChange={(next) => !isBusy && setOpen(next)}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:min-w-lg">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            {isEditing ? "Edit Bill" : "Add New Bill"}
          </SheetTitle>
          <SheetDescription>
            {isEditing 
              ? "Update the details of this outstanding bill." 
              : "Record a bill you need to pay in the future (e.g., rent, utilities)."}
          </SheetDescription>
        </SheetHeader>

        <form id="BILL_FORM_ID" onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 py-4" noValidate>
          
          {/* Vendor Name */}
          <div className="space-y-2">
            <Label htmlFor="vendor_name">Vendor / Payee Name</Label>
            <Input
              id="vendor_name"
              type="text"
              placeholder="e.g., Ethiopian Electric, Landlord"
              disabled={isBusy}
              aria-invalid={!!errors.vendor_name}
              {...register("vendor_name")}
            />
            {errors.vendor_name && (
              <p className="text-xs text-destructive">{errors.vendor_name.message}</p>
            )}
          </div>

          {/* Category & Due Date (Side by Side) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isBusy}
                  >
                    <SelectTrigger id="category" className="w-full" aria-invalid={!!errors.category}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {BILL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                disabled={isBusy}
                aria-invalid={!!errors.due_date}
                {...register("due_date")}
              />
              {errors.due_date && (
                <p className="text-xs text-destructive">{errors.due_date.message}</p>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount Owed (ETB)</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              disabled={isBusy}
              aria-invalid={!!errors.amount}
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., August 2026 electricity bill, Invoice #1234"
              disabled={isBusy}
              aria-invalid={!!errors.description}
              {...register("description")}
              className="resize-none"
              rows={3}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

        </form>

        {/* Submit Button */}
        <SheetFooter className="border-t px-4 py-4">
          <Button form="BILL_FORM_ID" type="submit" disabled={isBusy} className="w-full sm:w-auto">
            {isBusy ? "Saving..." : isEditing ? "Update Bill" : "Add Bill"}
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={isBusy}
            onClick={() => reset(getDefaultValues(isEditing, initialData))}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}