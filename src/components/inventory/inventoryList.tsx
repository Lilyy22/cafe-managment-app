import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Pencil, AlertTriangle } from 'lucide-react'
import { useInventories } from '@/hooks/useInventories'
import { SkeletonTable } from '../SkeletonLoader'

interface InventoryListProps {
  onEdit: (item: any) => void
}

// Helper to format ETB currency
function formatETB(amount: number): string {
  return `${amount.toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`
}

export function InventoryList({ onEdit }: InventoryListProps) {
  const { data: inventories, isLoading } = useInventories()

  if (isLoading) {
    return <SkeletonTable />
  }

  if (!inventories || inventories.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <AlertTriangle className="mx-auto h-12 w-12 mb-2 opacity-20" />
        <p>No inventory items found. Add some items!</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Remaining</TableHead>
            <TableHead className="text-right">Total Qty</TableHead>
            <TableHead className="text-right">Unit Cost</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventories.map((item) => {
            const unit = item.unit_of_measurement?.name || 'unit'
            const unitCost = item.price / (item.quantity || 1)
            const totalValue = item.remaining * unitCost
            const isLow = item.remaining < 10
            const isOutOfStock = item.remaining === 0

            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {item.item}
                    {isOutOfStock && (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                    {isLow && !isOutOfStock && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {Math.round(item.remaining).toLocaleString()} {unit}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {Math.round(item.quantity).toLocaleString()} {unit}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatETB(unitCost)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatETB(totalValue)}
                </TableCell>
                <TableCell className="text-right">
                  {isOutOfStock ? (
                    <span className="text-destructive font-semibold">Out of Stock</span>
                  ) : isLow ? (
                    <span className="text-yellow-600 font-medium">Low</span>
                  ) : (
                    <span className="text-green-600 font-medium">In Stock</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}