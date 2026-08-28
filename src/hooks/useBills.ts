import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { billService } from '../services/billService'
import { toast } from 'sonner'
import type { Bill } from '@/types/database'

export function useBills() {
  return useQuery({
    queryKey: ['bills'],
    queryFn: billService.getAll,
  })
}

export function useCreateBill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: billService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      toast('Bill added successfully!')
    },
    onError: (error: Error) => {
      console.error('Failed to add bill:', error)
      toast('Failed to add bill. Check console for details.')
    }
  })
}

export function useUpdateBill() {
  const queryClient = useQueryClient()
 
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Pick<Bill, 'vendor_name' | 'description' | 'amount' | 'due_date' | 'category' | 'status' | 'paid_at' | 'expense_id'>>
    }) => billService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      toast('Bill updated successfully!')
    },
    onError: (error: Error) => {
      console.error('Failed to update bill:', error)
      toast('Failed to update bill. Check console for details.')
    },
  })
}

export function useDeleteBill() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: billService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      toast('Bill deleted successfully!')
    },
    onError: (error: Error) => {
      console.error('Failed to delete bill:', error)
      toast(`Failed to delete bill: ${error.message}`)
    }
  })
}

// 👇 Special hook for the "Mark as Paid" button flow
export function useMarkBillAsPaid() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, expenseId }: { id: string; expenseId: string }) => 
      billService.markAsPaid(id, expenseId),
    onSuccess: () => {
      // Invalidate both bills and expenses since they are now linked
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast('Bill marked as paid!')
    },
    onError: (error: Error) => {
      console.error('Failed to mark bill as paid:', error)
      toast(`Failed to mark as paid: ${error.message}`)
    }
  })
}