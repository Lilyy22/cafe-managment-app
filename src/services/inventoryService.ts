import type { InventoryRecord } from '@/components/inventory/inventoryForm';
import { supabase } from '../lib/supabase';
import { type Inventory, type MeasurementUnit } from '../types/database';

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
    unit_of_measurement: MeasurementUnit 
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
      Pick<InventoryRecord, 'item' | 'quantity' | 'remaining' | 'price' | 'unit_of_measurement'>
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

  restock: async ({
    inventoryId,
    quantityAdded,
    totalCost,
    note
  }: {
    inventoryId: string
    quantityAdded: number
    totalCost: number
    note?: string
  }) => {
    const { data, error } = await supabase.rpc('record_inventory_restock', {
      p_inventory_id: inventoryId,
      p_quantity_added: quantityAdded,
      p_total_cost: totalCost,
      p_note: note || null,
    })

    if (error) throw new Error(error.message)
    return data
  },
  
  delete: async (id: string) => {
    const { error } = await supabase.from('inventories').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }
};