import { supabase } from '../lib/supabase'
import type { MeasurementUnit } from '../types/database'

export const measurementUnitService = {
  getAll: async () => {
    const { data, error, status } = await supabase
      .from('measurement_units')
      .select('name')

    if (error) throw new Error(error.message)
   
    return { 
        data: data as MeasurementUnit[], 
        status 
    }
  }
}