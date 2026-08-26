import { supabase } from '../lib/supabase'
import type { MeasurementUnit } from '../types/database'

export const measurementUnitService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('measurement_units')
      .select('*')

    if (error) throw new Error(error.message)
    return data as MeasurementUnit[]
  }
}
