// src/services/productService.ts
import { supabase } from '../lib/supabase'
import type { Product } from '../types/database'

export const productService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        ingredient:inventories (
          id,
          item,
          remaining,
          quantity,
          price,
          unit_of_measure:measurement_units (name)
        )
      `)
      .order('item', { ascending: true })

    if (error) throw new Error(error.message)
    return data as any[] // Cast to your refined Product type
  },

  create: async (product: {
    item: string
    selling_price: number
    ingredient_id?: string
    usage_per_unit?: number
  }) => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Product
  },

  update: async (id: string, updates: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Product
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }
}