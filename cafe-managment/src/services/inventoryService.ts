import { supabase } from '../lib/supabase';
import { type Inventory } from '../types/database';

export const inventoryService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('inventories')
      .select(`
        *,
        unit_of_measurement:measurement_units(
          name
        )
      `)
      .order('item', { ascending: true });
    
    if (error) throw error;
    return data as (Inventory & { measurement_unit: any })[];
  },

  updateStock: async (id: string, quantity: number) => {
    const { data, error } = await supabase
      .from('inventories')
      .update({ 
        remaining: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Inventory;
  },

  create: async (inventory: { 
    item: string; 
    quantity: number; 
    price: number; 
    remaining: number; 
    unit_of_measurement: string 
  }) => {
    const { data, error } = await supabase
      .from('inventories')
      .insert({
        ...inventory,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Inventory
  },

  update: async (
    id: string,
    updates: Partial<
      Pick<Inventory, 'item' | 'quantity' | 'remaining' | 'price' | 'unit_of_measurement'>
    >
  ) => {
    const { data, error } = await supabase
      .from('inventories')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  
    if (error) throw new Error(error.message)
    return data as Inventory
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('inventories').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }
};