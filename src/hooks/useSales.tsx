// src/hooks/useSales.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { salesService } from '../services/salesService'
import { toast } from 'sonner'
import type { SaleRecord } from '@/components/sales/salesForm'

export function useCreateSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: salesService.create,
    onSuccess: () => {
      // Refresh any dashboards or lists that show sales
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['inventories'] }) //updates stock
      
      // NOTE: If you want to automatically deduct inventory when a sale is made, 
      // you would also invalidate the inventories query here, or handle it via a Supabase Database Function.
    },
    onError: (error) => {
      console.error('Failed to create sale:', error)
      throw error
    }
  })
}

export function useSalesByDateRange(startDate: string, endDate: string) {
    return useQuery({
      // Include dates in the key so it auto-refetches when they change!
      queryKey: ['sales', startDate, endDate], 
      queryFn: () => salesService.getSalesByDateRange(startDate, endDate),
    })
}
export function useUpdateSale() {
  const queryClient = useQueryClient()
 
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Pick<SaleRecord, 'quantity' | 'total_amount' | 'note'>>
    }) => salesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
    },
    onError: (error) => {
      console.error('Failed to update sale:', error)
      toast.error('Failed to update sale. Check console for details.')
    },
  })
}

export function useDeleteSalesByDate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (date: string) => salesService.deleteByDate(date),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
    onError: (error) => {
      console.error('Failed to delete sales for date:', error)
      toast.error('Failed to delete sales. Check console for details.')
    },
  })
}