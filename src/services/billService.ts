import { supabase } from '../lib/supabase'
import type { Bill } from '../types/database'

// Type for creating a new bill (excludes auto-generated or relational fields)
export type BillInsert = Omit<Bill, 'id' | 'created_at' | 'updated_at' | 'paid_at' | 'expense_id'>

export const billService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('due_date', { ascending: true })
    
    if (error) throw new Error(error.message)
    return data as Bill[]
  },

  create: async (bill: BillInsert) => {
    const { data, error } = await supabase
      .from('bills')
      .insert({
        ...bill,
        status: 'unpaid', // Ensure new bills always start as unpaid
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Bill
  },

  update: async (
    id: string,
    updates: Partial<Pick<Bill, 'vendor_name' | 'description' | 'amount' | 'due_date' | 'category' | 'status' | 'paid_at' | 'expense_id'>>
  ) => {
    const { data, error } = await supabase
      .from('bills')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  
    if (error) throw new Error(error.message)
    return data as Bill
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  // 👇 Helper specifically for the "Mark as Paid" workflow
  markAsPaid: async (id: string, expenseId: string) => {
    const { data, error } = await supabase
      .from('bills')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        expense_id: expenseId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Bill
  }
}