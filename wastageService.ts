import { supabase } from '../lib/supabase'

export const wastageService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('wastages')
      .select(`
        *,
        inventory:inventories (id, item, unit_of_measure:measurement_units(name, symbol))
      `)
      .order('date', { ascending: false })
    if (error) throw error
    return data as any[]
  },

  create: async (wastage: { inventory_id: string, quantity: number, reason: string, date: string, note?: string }) => {
    const { data, error } = await supabase.rpc('record_wastage_and_deduct_stock', {
      p_inventory_id: wastage.inventory_id,
      p_quantity: wastage.quantity,
      p_reason: wastage.reason,
      p_date: wastage.date,
      p_note: wastage.note || null
    })
    if (error) throw error
    return { id: data }
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('wastages').delete().eq('id', id)
    if (error) throw error
  }
}