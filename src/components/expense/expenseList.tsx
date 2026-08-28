import { useState, useMemo } from 'react'
import { Card, CardTitle, CardHeader, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Filter } from 'lucide-react'
import { useExpenses, useDeleteExpense, useExpenseDropdowns } from '@/hooks/useExpenses'

// Helper to format ETB currency
function formatETB(amount: number): string {
  return `${amount.toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`
}

export function ExpenseList() {
  // 1. Fetch data from Supabase
  const { data: expenses, isLoading } = useExpenses()
  const { categories } = useExpenseDropdowns()
  const deleteExpense = useDeleteExpense()

  // 2. Filter State
  const [filterCategory, setFilterCategory] = useState('')
  const [filterDate, setFilterDate] = useState('')

  // 3. Filter Logic
  const visibleExpenses = useMemo(() => {
    if (!expenses) return []

    return expenses.filter((exp) => {
      const matchesCategory = filterCategory ? exp.expense_category === filterCategory : true
      const matchesDate = filterDate ? exp.date === filterDate : true
      return matchesCategory && matchesDate
    })
  }, [expenses, filterCategory, filterDate])

  // 4. Calculate Total
  const totalAmount = useMemo(() => {
    return visibleExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  }, [visibleExpenses])

  // 5. Clear Filters
  const clearFilters = () => {
    setFilterCategory('')
    setFilterDate('')
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading expenses...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="size-4 text-primary" />
              Expenses
            </CardTitle>
            <CardDescription>
              {visibleExpenses.length} record{visibleExpenses.length !== 1 ? 's' : ''} · Total: {formatETB(totalAmount)}
            </CardDescription>
          </div>
          {(filterCategory || filterDate) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid gap-3 sm:grid-cols-2 mt-4">
          <div className="space-y-1">
            <Label htmlFor="filter-category" className="text-xs">Filter by Category</Label>
            <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value ?? "all")}>
              <SelectTrigger id="filter-category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="filter-date" className="text-xs">Filter by Date</Label>
            <Input
              id="filter-date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="max-h-[420px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleExpenses.map((x) => (
              <TableRow key={x.id}>
                <TableCell className="font-medium">
                  {new Date(x.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{x.expense_category}</Badge>
                </TableCell>
                <TableCell className="max-w-[220px] truncate">
                  {x.duration || '-'}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatETB(x.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Delete expense: ${x.expense_category}?`)) {
                        deleteExpense.mutate(x.id)
                      }
                    }}
                    disabled={deleteExpense.isPending}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {visibleExpenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {expenses && expenses.length > 0 
                    ? 'No expenses match this filter.' 
                    : 'No expenses recorded yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}