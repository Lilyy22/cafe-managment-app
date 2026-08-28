// src/lib/validations/product.ts
import { z } from "zod"

// Coerces a string HTML-input value to a number, while still treating an
// empty string as "missing" (Number("") is 0, which would otherwise slip
// past a required check). Mirrors the same helper in inventory.ts.
const numberFromInput = (requiredMessage: string) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number({ error: requiredMessage })
  )

// "none" is the sentinel SelectItem value for "no ingredient linked" —
// Radix/shadcn's Select can't use an empty string as a real item value,
// so both "" and "none" are treated as "not selected" here.
const optionalIngredientId = z.preprocess(
  (val) => (val === "" || val === "none" || val === undefined || val === null ? undefined : val),
  z.string().optional()
)

const optionalUsagePerUnit = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce.number().positive("Usage per unit must be greater than 0").optional()
)

export const productSchema = z
  .object({
    item: z.string().min(1, "Product name is required"),
    selling_price: numberFromInput("Selling price is required").pipe(
      z.number().positive("Selling price must be greater than 0")
    ),
    ingredient_id: optionalIngredientId,
    usage_per_unit: optionalUsagePerUnit,
  })
  // Usage per unit only makes sense (and is only required) once an
  // ingredient is actually linked.
  .superRefine((data, ctx) => {
    if (data.ingredient_id && data.usage_per_unit === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["usage_per_unit"],
        message: "Usage per unit is required when an ingredient is linked",
      })
    }
  })

// OUTPUT type (post-coercion): selling_price/usage_per_unit are numbers,
// ready for the API. This is what onSubmit receives.
export type ProductFormData = z.infer<typeof productSchema>

// INPUT type (pre-coercion): what the form fields actually hold while
// typing — all strings. Use this for useForm's field-values generic and
// for defaultValues/reset.
export type ProductFormInput = z.input<typeof productSchema>