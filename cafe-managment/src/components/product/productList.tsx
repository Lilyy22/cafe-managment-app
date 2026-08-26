// src/components/ProductTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { useProducts, useUpdateProduct } from '@/hooks/useProducts'
import { Pencil } from 'lucide-react'
import { Button } from '../ui/button'

// Helper to format ETB currency
function formatETB(amount: number): string {
  return `${amount.toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`
}

interface ProductListProps {
  onEdit: (item: any) => void
}

export function ProductList({ onEdit }: ProductListProps) {
  const { data: products, isLoading } = useProducts()
  const updateProduct = useUpdateProduct()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Ingredient Usage</TableHead>
            <TableHead className="text-right">Cost / Unit</TableHead>
            <TableHead className="text-right">Selling Price</TableHead>
            <TableHead className="text-right">Margin</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => {
            // 1. Calculate Unit Cost from the linked Inventory item
            const inventoryItem = p.ingredient
            const unitCost = inventoryItem 
              ? (inventoryItem.price / (inventoryItem.quantity || 1)) 
              : 0
            
            // 2. Calculate Cost to make ONE product
            const cost = unitCost * (p.usage_per_unit || 0)
            
            // 3. Calculate Profit Margin
            const margin = p.selling_price > 0 ? ((p.selling_price - cost) / p.selling_price) * 100 : 0
            
            // 4. Determine the display unit
            const unitLabel = p.usage_measurement?.name || inventoryItem?.unit_of_measure?.name || 'unit'

            return (
              <TableRow key={p.id}>
                {/* Product Name */}
                <TableCell className="font-medium">
                  {p.item}
                </TableCell>
                
                {/* Ingredient / Recipe Section */}
                <TableCell>
                  {inventoryItem ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {inventoryItem.item}
                        <span className="text-xs text-muted-foreground">
                           {p.usage_per_unit}  {inventoryItem.unit_of_measure?.name || 'unit'}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Cost: {formatETB(cost)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">None linked</span>
                  )}
                </TableCell>

                {/* Cost per Unit */}
                <TableCell className="text-right text-sm">
                  {formatETB(cost)} <span className="text-muted-foreground">/ {unitLabel}</span>
                </TableCell>

                {/* Selling Price Input */}
                <TableCell className="text-right">
                  <span>{p.selling_price} ETB</span>
                </TableCell>

                {/* Margin & Profit */}
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={margin >= 40 ? "bg-green-200" : "bg-red-200"}>
                      <span className="text-black text-xs">{Math.round(margin)}% margin</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Profit: {formatETB(p.selling_price - cost)}
                    </span>
                  </div>
                </TableCell>

                {/* Edit Action */}
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => onEdit(p)}
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