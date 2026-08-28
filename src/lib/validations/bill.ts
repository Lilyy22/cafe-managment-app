import { z } from "zod"

// 1. Schema for the form inputs (everything is a string for the UI)
export const billFormSchema = z.object({
  vendor_name: z.string().min(1, "Vendor name is required"),
  category: z.string().min(1, "Category is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid number"),
  due_date: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
})

export type BillFormInput = z.infer<typeof billFormSchema>

// 2. Schema for the actual data sent to the database (transforms strings to numbers)
export const billSubmissionSchema = billFormSchema.transform((data) => ({
  vendor_name: data.vendor_name.trim(),
  category: data.category,
  amount: parseFloat(data.amount),
  due_date: data.due_date, // Keep as YYYY-MM-DD string, Supabase handles it
  description: data.description?.trim() || null,
}))

export type BillSubmissionData = z.infer<typeof billSubmissionSchema>