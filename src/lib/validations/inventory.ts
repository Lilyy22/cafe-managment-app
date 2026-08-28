// src/lib/validations/inventory.ts
import { z } from "zod"

// Coerces a string HTML-input value to a number, while still treating an
// empty string as "missing" (Number("") is 0, which would otherwise slip
// past a required check).
const numberFromInput = (requiredMessage: string) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number({ error: requiredMessage })
  )

// 1. Define the Schema
export const inventorySchema = z.object({
  item: z.string().min(1, "Item name is required"),
  quantity: numberFromInput("Quantity is required").pipe(
    z.number().positive("Quantity must be greater than 0")
  ),
  remaining: numberFromInput("Remaining stock is required").pipe(
    z.number().nonnegative("Remaining cannot be negative")
  ),
  price: numberFromInput("Price is required").pipe(
    z.number().positive("Price must be greater than 0")
  ),
  unit_of_measurement: z.string().min(1, "Please select a unit of measurement"),
})

// 2. Export the TypeScript type inferred from the schema
// Note: this is the OUTPUT type (post-coercion) — item/quantity/remaining/
// price/unit_of_measurement are numbers where appropriate, ready for the API/DB.
export type InventoryFormData = z.infer<typeof inventorySchema>

// Input type (pre-coercion) — what react-hook-form's <input> fields
// actually produce before validation runs. Use this for defaultValues.
export type InventoryFormInput = z.input<typeof inventorySchema>