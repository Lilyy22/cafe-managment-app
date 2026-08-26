// src/hooks/useInventories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryService } from '../services/inventoryService'
import { measurementUnitService } from '../services/measurementUnitService'
import { toast } from 'sonner'

export function useInventories() {
  return useQuery({
    queryKey: ['inventories'],
    queryFn: inventoryService.getAll,
  })
}

export function useMeasurementUnits() {
  return useQuery({
    queryKey: ['measurementUnits'],
    queryFn: measurementUnitService.getAll,
  })
}

export function useCreateInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inventoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
      toast('Inventory item added successfully!')
    },
    onError: (error) => {
      console.error('Failed to add inventory:', error)
      toast('Failed to add inventory. Check console for details.')
    }
  })
}

export function useUpdateInventory() {
  const queryClient = useQueryClient()
 
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<
        Pick<Inventory, 'item' | 'quantity' | 'remaining' | 'price' | 'unit_of_measurement'>
      >
    }) => inventoryService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
    },
    onError: (error) => {
      console.error('Failed to update inventory:', error)
      toast('Failed to update inventory. Check console for details.')
    },
  })
}

export function useDeleteInventory() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: inventoryService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['inventories'] })
        toast('Inventory item deleted!')
      },
      onError: (error) => toast(`Failed to delete: ${error.message}`)
    })
  }