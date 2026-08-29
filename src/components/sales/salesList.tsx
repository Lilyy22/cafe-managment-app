// src/components/RecentSalesTable.tsx
import { useState, useMemo } from 'react'
import { Card, CardTitle, CardHeader, CardDescription, CardContent } from '../ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Trash2, CalendarDays } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useSalesByDateRange, useDeleteSale } from '@/hooks/useSales'
import { SkeletonTable } from '../SkeletonLoader'

function formatETB(amount: number): string {
  return `${amount.toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`
}

// Helper to get today's date in YYYY-MM-DD format
const getTodayString = () => new Date().toISOString().split('T')[0]

export function SalesList() {
  const { data: products, isLoading: productsLoading } = useProducts()
  const deleteSales = useDeleteSale()

  // 1. Default state is set to today
  const [startDate, setStartDate] = useState(getTodayString())
  const [endDate, setEndDate] = useState(getTodayString())

  // 2. Pass dates to the hook
  const { data: rawSales, isLoading: salesLoading } = useSalesByDateRange(startDate, endDate)

  // 3. Pivot flat DB rows into the Matrix format
  const { recent } = useMemo(() => {
    if (!rawSales || !products) return { recent: [] }

    const grouped: Record<string, { date: string; sold: Record<string, number>; totalRevenue: number }> = {}

    rawSales.forEach((sale) => {
      const date = sale.date
      if (!grouped[date]) {
        grouped[date] = { date, sold: {}, totalRevenue: 0 }
      }
      
      if (!grouped[date].sold[sale.product_id]) {
        grouped[date].sold[sale.product_id] = 0
      }
      grouped[date].sold[sale.product_id] += sale.quantity

      const productPrice = sale.product?.selling_price || 0
      grouped[date].totalRevenue += sale.quantity * productPrice
    })

    const recentArray = Object.values(grouped).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return { recent: recentArray }
  }, [rawSales, products])

  if (productsLoading || salesLoading) {
    return <SkeletonTable />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" />
              Sales Report
            </CardTitle>
            <CardDescription>Filter sales by date range</CardDescription>
          </div>
          
          {/* Date Filter UI */}
          <div className="flex items-end gap-4 bg-secondary/30 p-3 rounded-lg">
            <div className="space-y-1.5">
              <Label htmlFor="start-date" className="text-xs">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[150px] h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-date" className="text-xs">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[150px] h-8"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="overflow-x-auto">
        {recent.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sales found for this date range.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card z-10 w-[120px]">Date</TableHead>
                {products?.map((p) => (
                  <TableHead key={p.id} className="text-right min-w-[80px]">
                    {p.item}
                  </TableHead>
                ))}
                <TableHead className="text-right font-bold">Total Sales</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((e) => (
                <TableRow key={e.date}>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">
                    {new Date(e.date).toLocaleDateString()}
                  </TableCell>
                  {products?.map((p) => (
                    <TableCell key={p.id} className="text-right">
                      {e.sold[p.id] ?? 0}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-semibold text-primary">
                    {formatETB(e.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Delete all sales entries for ${e.date}?`)) {
                          deleteSales.mutate(e.date)
                        }
                      }}
                      disabled={deleteSales.isPending}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}