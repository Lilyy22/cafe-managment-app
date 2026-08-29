// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '../services/productService'
import { toast } from 'sonner'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully!')
    },
    onError: (error) => {
      console.error('Failed to create product:', error)
      toast.error('Failed to create product. Check console for details.')
    }
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<any> }) => 
      productService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated successfully!')
    },
    onError: (error) => {
      console.error('Failed to update product:', error)
      toast.error('Failed to update product. Check console for details.')
    }
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted!')
    },
    onError: (error) => toast.error(`Failed to delete: ${error.message}`)
  })
}