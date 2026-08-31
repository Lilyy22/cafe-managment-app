// src/services/ledgerService.ts
import { supabase } from '../lib/supabase'

export interface DailyLedgerRow {
  date: string
  units: number
  sales: number
  material_cost: number
  other_cost: number
  profit: number
}

export const ledgerService = {
  getDailyLedger: async (startDate: string, endDate: string) => {
    const { data, error } = await supabase.rpc('get_daily_ledger', {
      start_date: startDate,
      end_date: endDate,
    })

    if (error) throw new Error(error.message)
    return data as DailyLedgerRow[]
  },
}