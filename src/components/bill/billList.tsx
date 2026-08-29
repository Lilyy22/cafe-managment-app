import { useState } from "react"
import { FileText, Pencil, CheckCircle2, Trash2, AlertCircle, EllipsisVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useBills, useDeleteBill, useMarkBillAsPaid } from "@/hooks/useBills"
import { BillForm } from "./billForm"
import type { Bill } from "@/types/database"
import { ConfirmDialog } from "../ConfirmDialog"

interface BillListProps {
  onBillPaid?: (bill: Bill, expenseId: string) => void
}

export function BillList({ onBillPaid }: BillListProps) {
  const [editingBill, setEditingBill] = useState<Bill | undefined>(undefined)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "unpaid" | "overdue" | "paid">("all")

  const { data: bills, isLoading } = useBills()
  const deleteBill = useDeleteBill()
  const markAsPaid = useMarkBillAsPaid()
  const [payingBill, setPayingBill] = useState<Bill | null>(null)

  const handleConfirmPayment = () => {
    if (!payingBill) return
    markAsPaid.mutate(
      { bill: payingBill, note: `Paid bill to ${payingBill.vendor_name}` },
      { onSuccess: () => setPayingBill(null) }
    )
  }

  
  // Calculate if a bill is overdue
  const isOverdue = (bill: Bill) => {
    if (bill.status === "paid") return false
    const today = new Date()
    const dueDate = new Date(bill.due_date)
    return dueDate < today
  }

  // Filter bills based on selected filter
  const filteredBills = bills?.filter((bill) => {
    if (filter === "all") return true
    if (filter === "overdue") return isOverdue(bill)
    return bill.status === filter
  })

  // Get status badge variant
  const getStatusBadge = (bill: Bill) => {
    const overdue = isOverdue(bill)
    
    if (bill.status === "paid") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="size-3 mr-1" />
          Paid
        </Badge>
      )
    }
    
    if (overdue) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertCircle className="size-3 mr-1" />
          Overdue
        </Badge>
      )
    }
    
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        Unpaid
      </Badge>
    )
  }

  const handleMarkAsPaid = (bill: Bill) => {
    // This would typically open a "Pay Bill" dialog
    // For now, we'll just log it - you can implement the full flow
    console.log("Mark bill as paid:", bill)
    // You would:
    // 1. Open an expense form
    // 2. Create the expense
    // 3. Update the bill with expense_id and status='paid'
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this bill?")) {
      await deleteBill.mutateAsync(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading bills...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Bills & Payables</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border rounded-md px-3 py-1.5 bg-background"
          >
            <option value="all">All Bills</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Paid</option>
          </select>
          
          <Button
            size="sm"
            onClick={() => {
              setEditingBill(undefined)
              setIsFormOpen(true)
            }}
          >
            Add Bill
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Total Unpaid</p>
          <p className="text-lg font-semibold text-yellow-600">
            {bills?.filter(b => b.status === "unpaid" && !isOverdue(b)).reduce((sum, b) => sum + b.amount, 0).toFixed(2) || 0} ETB
          </p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Overdue</p>
          <p className="text-lg font-semibold text-red-600">
            {bills?.filter(b => isOverdue(b)).reduce((sum, b) => sum + b.amount, 0).toFixed(2) || 0} ETB
          </p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Paid (Total)</p>
          <p className="text-lg font-semibold text-green-600">
            {bills?.filter(b => b.status === "paid").reduce((sum, b) => sum + b.amount, 0).toFixed(2) || 0} ETB
          </p>
        </div>
      </div>

      {/* Bills Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {filter === "all" 
                    ? "No bills found. Add your first bill above." 
                    : `No ${filter} bills.`}
                </TableCell>
              </TableRow>
            ) : (
              filteredBills?.map((bill) => {
                const overdue = isOverdue(bill)
                return (
                  <TableRow 
                    key={bill.id}
                    className={overdue && bill.status !== "paid" ? "bg-red-50/50" : ""}
                  >
                    <TableCell className="font-medium">
                      <div>
                        <p>{bill.vendor_name}</p>
                        {bill.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {bill.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {bill.category || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={overdue && bill.status !== "paid" ? "text-red-600 font-medium" : ""}>
                       
                      </div>
                      {overdue && bill.status !== "paid" && (
                        <p className="text-xs text-red-600">
                          {Math.ceil((new Date().getTime() - new Date(bill.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {bill.amount.toFixed(2)} ETB
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(bill)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <EllipsisVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-auto p-3 space-y-2" align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingBill(bill)
                              setIsFormOpen(true)
                            }}
                          >
                            <Pencil className="size-4 mr-2" />
                            Edit Bill
                          </DropdownMenuItem>
                          
                          {bill.status !== "paid" && (
                            <DropdownMenuItem
                              onClick={() => setPayingBill(bill)}
                              className="text-green-600"
                            >
                              <CheckCircle2 className="size-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => handleDelete(bill.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bill Form Sheet */}
      <BillForm
        initialData={editingBill}
        open={isFormOpen}
        setOpen={setIsFormOpen}
      />

    <ConfirmDialog
    open={!!payingBill}
    onOpenChange={(isOpen) => !isOpen && setPayingBill(null)}
    title="Mark this bill as paid?"
    description={
      <>
        This will record an expense of <span className="font-semibold text-foreground">{payingBill?.amount.toFixed(2)} ETB</span> for <span className="font-semibold text-foreground">{payingBill?.vendor_name}</span>.
      </>
    }
    confirmText="Confirm Payment"
    variant="success" // 👈 Makes the button green
    isPending={markAsPaid.isPending}
    onConfirm={handleConfirmPayment}
    />

  </div>
  )
}