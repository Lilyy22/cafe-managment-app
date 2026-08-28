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
  },

  update: async (id: string, updates: Partial<Pick<Sale, 'quantity' | 'total_amount' | 'note'>>) => {
    // 1. Fetch the existing sale to calculate inventory differences
    const { error: fetchError } = await supabase
      .from('sales')
      .select('product_id, quantity')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    // 2. Update the sale record in the database
    const { data, error } = await supabase
      .from('sales')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    // 3. ⚠️ INVENTORY SYNC: If quantity changed, adjust stock accordingly
    // if (updates.quantity !== undefined && updates.quantity !== currentSale.quantity) {
      // const quantityDifference = updates.quantity - currentSale.quantity 
      // Positive difference = we need to ADD stock back (e.g., changed from 5 to 3, diff is -2, wait no: 3 - 5 = -2. We need to ADD 2 back.)
      // Actually: if old was 5, new is 3. We deducted 5 originally. We should have only deducted 3. So we ADD 2 back.
      // quantityDifference = 3 - 5 = -2. We need to ADD 2. So we multiply by -1.
      // const stockToAdjust = -quantityDifference 

      // 👉 UNCOMMENT AND USE YOUR RPC HERE (You will need to create this in Supabase SQL editor)
      /*
      await supabase.rpc('adjust_stock_on_sale_update', {
        p_product_id: currentSale.product_id,
        p_quantity_to_add: stockToAdjust // Positive number adds to stock, negative deducts
      })
      */
    // }

    return data as Sale
  },

  delete: async (id: string) => {
    // 1. Fetch the sale details before deleting so we know what to restore to inventory
    const { error: fetchError } = await supabase
      .from('sales')
      .select('product_id, quantity')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    // 2. Delete the sale record
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)

    // 3. ⚠️ INVENTORY SYNC: Restore the stock that was deducted when this sale was created
    // 👉 UNCOMMENT AND USE YOUR RPC HERE (You will need to create this in Supabase SQL editor)
    /*
    await supabase.rpc('restore_stock_on_sale_delete', {
      p_product_id: currentSale.product_id,
      p_quantity_to_restore: currentSale.quantity
    })
    */

    return { success: true, id }
  }
}

