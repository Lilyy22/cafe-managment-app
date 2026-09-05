// src/hooks/useInventories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryService } from '../services/inventoryService'
import { measurementUnitService } from '../services/measurementUnitService'
import { toast } from 'sonner'
import type { InventoryRecord } from '@/components/inventory/inventoryForm'

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
      toast.success('Inventory item added successfully!')
    },
    onError: (error) => {
      console.error('Failed to add inventory:', error)
      toast.error('Failed to add inventory. Check console for details.')
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
        Pick<InventoryRecord, 'item' | 'quantity' | 'remaining' | 'price' | 'unit_of_measurement'>
      >
    }) => inventoryService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
      toast.success(`Inventory Updated.`)
    },
    onError: (error) => {
      console.error('Failed to update inventory:', error)
      toast.error('Failed to update inventory. Check console for details.')
    },
  })
}

export function useDeleteInventory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
      toast.success('Inventory item deleted!')
    },
    onError: (error) => toast.error(`Failed to delete: ${error.message}`)
  })
}

export function useRestockInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inventoryService.restock, // Calls the service method directly
    onSuccess: () => {
      // Invalidate both because the RPC updates inventory AND creates an expense
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Stock updated and expense recorded!')
    },
    onError: (error: Error) => {
      console.error('Restock failed:', error)
      toast.error(`Failed to restock: ${error.message}`)
    }
  })
}