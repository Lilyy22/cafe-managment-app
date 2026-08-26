// src/lib/validations/sales.ts
import { z } from "zod"

const optionalQuantity = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce.number().nonnegative("Quantity can't be negative").optional()
)

const saleLineSchema = z.object({
  product_id: z.string().min(1),
  quantity: optionalQuantity,
})

export const salesFormSchema = z
  .object({
    date: z.string().min(1, "Date is required"),
    note: z.string().optional(),
    items: z.array(saleLineSchema),
  })
  .superRefine((data, ctx) => {
    const hasAny = data.items.some((i) => (i.quantity ?? 0) > 0)
    if (!hasAny) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: "Enter at least one product sold",
      })
    }
  })

// OUTPUT type (post-coercion): quantity is a real number|undefined per line.
export type SalesFormData = z.infer<typeof salesFormSchema>

// INPUT type (pre-coercion): quantity is a string while typing.
export type SalesFormInput = z.input<typeof salesFormSchema>