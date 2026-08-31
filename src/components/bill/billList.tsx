import { useState } from "react"
import { Pencil, CheckCircle2, Trash2, AlertCircle, EllipsisVertical } from "lucide-react"
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
import type { Bill } from "@/types/database"
import { ConfirmDialog } from "../ConfirmDialog"
import { SkeletonTable } from "../SkeletonLoader"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface BillListProps{
  onEdit: (item: any) => void
}

export function BillList({ onEdit }: BillListProps) {
  const [filter, setFilter] = useState<"all" | "unpaid" | "overdue" | "paid">("all")

  const { data: bills, isLoading } = useBills()
  const deleteBill = useDeleteBill()
  const markAsPaid = useMarkBillAsPaid()

  const [payingBill, setPayingBill] = useState<Bill | null>(null)
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setDeletingBillId(id)
  }

  const handleConfirmDelete = () => {
    if (!deletingBillId) return
    deleteBill.mutate(deletingBillId, {
      onSuccess: () => setDeletingBillId(null)
    })
  }

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

  if (isLoading) {
    return <SkeletonTable />
  }

  return (
    <div className="space-y-4">
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
      <Card className="rounded-md border">
        <CardHeader className="flex justify-between gap-2">
          <CardTitle>Bills List</CardTitle>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border rounded-md px-3 py-1.5 bg-background justify-end"
          >
            <option value="all">All Bills</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Paid</option>
          </select>
        </CardHeader>
        <CardContent>
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
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="sm">
                              <EllipsisVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-auto p-3 space-y-2" align="end">
                            <DropdownMenuItem
                              onClick={() => onEdit(bill)}
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
        </CardContent>
      </Card>

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

    <ConfirmDialog
      open={!!deletingBillId}
      onOpenChange={(isOpen) => !isOpen && setDeletingBillId(null)}
      title="Are you absolutely sure?"
      description="This action cannot be undone. This will permanently delete this bill from your records."
      confirmText="Delete Bill"
      variant="destructive" // 👈 This makes the button red
      isPending={deleteBill.isPending}
      onConfirm={handleConfirmDelete}
    />
  </div>
  )
}