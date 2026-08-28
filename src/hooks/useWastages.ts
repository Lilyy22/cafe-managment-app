// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { wastageService } from '../services/wastageService'

// export function useWastages() {
//   return useQuery({ queryKey: ['wastages'], queryFn: wastageService.getAll })
// }

// export function useCreateWastage() {
//   const queryClient = useQueryClient()
//   return useMutation({
//     mutationFn: wastageService.create,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['wastages'] })
//       queryClient.invalidateQueries({ queryKey: ['inventories'] })
//     }
//   })
// }

// export function useDeleteWastage() {
//   const queryClient = useQueryClient()
//   return useMutation({
//     mutationFn: wastageService.delete,
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wastages'] })
//   })
// }