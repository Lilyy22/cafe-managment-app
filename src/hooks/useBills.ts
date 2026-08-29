import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { billService } from '../services/billService'
import { toast } from 'sonner'
import type { Bill } from '@/types/database'
import { expenseService } from '@/services/expenseService'

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
      toast.success('Bill added successfully!')
    },
    onError: (error: Error) => {
      console.error('Failed to add bill:', error)
      toast.error('Failed to add bill. Check console for details.')
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
      toast.success('Bill updated successfully!')
    },
    onError: (error: Error) => {
      console.error('Failed to update bill:', error)
      toast.error('Failed to update bill. Check console for details.')
    },
  })
}

export function useDeleteBill() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: billService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      toast.success('Bill deleted successfully!')
    },
    onError: (error: Error) => {
      console.error('Failed to delete bill:', error)
      toast.error(`Failed to delete bill: ${error.message}`)
    }
  })
}

// 👇 Special hook for the "Mark as Paid" button flow
export function useMarkBillAsPaid() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ bill, note }: { bill: Bill; note?: string }) => {
      // 1. Automatically create the expense record
      const newExpense = await expenseService.create({
        expense_category: 'bill',
        date: new Date().toISOString().split('T')[0], // Today's date
        amount: bill.amount,
        duration: 'other',
        note: note || `Paid bill to ${bill.vendor_name}`
      })
       // 2. Update the bill to link it to the new expense and mark as paid
       return await billService.markAsPaid(bill.id, newExpense.id)
    },
    onSuccess: () => {
      // Invalidate both bills and expenses since they are now linked
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Bill marked as paid!')
    },
    onError: (error: Error) => {
      console.error('Failed to mark bill as paid:', error)
      toast.error(`Failed to mark as paid: ${error.message}`)
    }
  })
}