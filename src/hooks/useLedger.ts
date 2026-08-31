// src/hooks/useLedger.ts
import { useQuery } from '@tanstack/react-query'
import { ledgerService } from '../services/ledgerService'

export function useDailyLedger(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['daily-ledger', startDate, endDate],
    queryFn: () => ledgerService.getDailyLedger(startDate, endDate),
    // This is an aggregate report, not live-editing state — no need to
    // refetch aggressively. It'll still refetch on window refocus etc.
    // per react-query defaults, just won't be treated as instantly stale.
    staleTime: 60_000,
  })
}