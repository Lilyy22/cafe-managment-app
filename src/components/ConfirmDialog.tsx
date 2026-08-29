import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
  import { cn } from "@/lib/utils"
  import type { ReactNode } from "react"
  
  interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string | ReactNode
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    isPending?: boolean
    // 'destructive' for delete, 'success' for pay, 'default' for standard
    variant?: "default" | "destructive" | "success" 
  }
  
  export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    isPending = false,
    variant = "default",
  }: ConfirmDialogProps) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{cancelText}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault() // Prevent default form submission if inside a form
                onConfirm()
              }}
              disabled={isPending}
              className={cn(
                // Default styles are inherited from shadcn
                variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                variant === "success" && "bg-green-600 text-white hover:bg-green-700 focus:ring-green-600"
              )}
            >
              {isPending ? "Processing..." : confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }