// src/services/salesService.ts
import { supabase } from '../lib/supabase'
import type { Sale } from '../types/database'

export const salesService = {
  create: async (sale: {
    date: string
    product_id: string
    quantity: number
    total_amount: number
    note?: string
  }) => {
    const { data, error } = await supabase
      .from('sales')
      .insert({
        ...sale,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
      
    // 🔥 THIS LOG WILL TELL US IF THE SERVICE IS BEING CALLED TWICE
    console.log('🔥🔥🔥 SALES SERVICE CREATE EXECUTING FOR:', sale.product_id, 'QTY:', sale.quantity)

    await supabase
      .rpc('record_sale_and_deduct_stock', {
        p_date: sale.date,
        p_product_id: sale.product_id,
        p_quantity: sale.quantity,
        p_total_amount: sale.total_amount,
        p_note: sale.note || null
      })

    if (error) throw new Error(error.message)
    return data as Sale
  },

  getDailySales: async (date: string) => {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        product:products (
          id,
          item,
          selling_price
        )
      `)
      .eq('date', date)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as (Sale & { product: any })[]
  },

  getSalesByDateRange: async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        product:products (
          id,
          item,
          selling_price
        )
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) throw new Error(error.message)
    return data as any[]
  },

  deleteByDate: async (date: string) => {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('date', date)

    if (error) throw new Error(error.message)
}
}

