import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expenseService } from '../services/expenseService'

// 1. Hook to fetch all expenses (for the list/dashboard)
export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: expenseService.getAll,
  })
}

// 2. Hook to fetch dropdown data for the form (Categories & Durations)
export function useExpenseDropdowns() {
  const categoriesQuery = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: expenseService.getCategories,
  })

  const durationsQuery = useQuery({
    queryKey: ['durations'],
    queryFn: expenseService.getDurations,
  })

  return {
    categories: categoriesQuery.data,
    durations: durationsQuery.data,
    isLoading: categoriesQuery.isLoading || durationsQuery.isLoading,
  }
}

// 3. Hook to create a new expense
export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: expenseService.create,
    onSuccess: () => {
      // Refresh the expenses list automatically
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
    onError: (error) => {
      console.error('Failed to create expense:', error)
      toast(`Failed to record expense: ${error.message}`)
    }
  })
}

// 4. Hook to delete an expense
export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: expenseService.delete,
    onSuccess: () => {
      // Refresh the expenses list automatically
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
    onError: (error) => {
      console.error('Failed to delete expense:', error)
      toast(`Failed to delete expense: ${error.message}`)
    }
  })
}