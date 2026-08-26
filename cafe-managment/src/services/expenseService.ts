// src/services/expenseService.ts
import { supabase } from '../lib/supabase'
import type { Expense, ExpenseCategory, Duration } from '../types/database'

export const expenseService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category_details:expense_categories ( name, description ),
        duration_details:duration ( name, days )
      `)
      .order('date', { ascending: false })

    if (error) throw new Error(error.message)
    return data as (Expense & { category_details: ExpenseCategory; duration_details: Duration })[]
  },

  create: async (expense: {
    amount: number
    date: string
    expense_category: string      // Pass the string directly!
    duration: string      // Pass the string directly!
    note?: string
  }) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expense,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Expense
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },

  getCategories: async () => {
    const { data, error } = await supabase.from('expense_categories').select('*').order('name')
    if (error) throw new Error(error.message)
    return data as ExpenseCategory[]
  },

  getDurations: async () => {
    const { data, error } = await supabase.from('durations').select('*').order('name')
    if (error) throw new Error(error.message)
    return data as Duration[]
  }
}