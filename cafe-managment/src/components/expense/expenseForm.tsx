import { useState } from 'react'
import { Card, CardTitle, CardHeader, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useCreateExpense, useExpenseDropdowns } from '@/hooks/useExpenses'

export function ExpenseForm() {
  // 1. Local State
  const [eDate, setEDate] = useState(new Date().toISOString().split('T')[0])
  const [eCat, setECat] = useState('')
  const [eDuration, setEDuration] = useState('') // Added Duration State
  const [eDesc, setEDesc] = useState('')
  const [eAmount, setEAmount] = useState('')

  // 2. Hooks (Fetches both Categories and Durations from Supabase)
  const { categories, durations, isLoading: dropdownsLoading } = useExpenseDropdowns()
  const createExpense = useCreateExpense()

  // 3. Submit Handler
  const submitExpense = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!eCat || !eDuration || !eAmount) return

    createExpense.mutate(
      {
        amount: parseFloat(eAmount),
        date: eDate,
        expense_category: eCat,     // Passes string name (e.g., "Utilities")
        duration: eDuration // Passes string name (e.g., "monthly")
      },
      {
        onSuccess: () => {
          // Clear form on success
          setEDesc('')
          setEAmount('')
          setECat('')
          setEDuration('')
        }
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="size-4 text-primary" /> Add expense
        </CardTitle>
        <CardDescription>Light bill, coal, salary or anything else</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitExpense} className="grid gap-3 sm:grid-cols-2">
          
          {/* Date */}
          <div className="space-y-1">
            <Label htmlFor="edate">Date</Label>
            <Input
              id="edate"
              type="date"
              value={eDate}
              onChange={(e) => setEDate(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label htmlFor="eamount">Amount (ETB)</Label>
            <Input
              id="eamount"
              type="number"
              min={0}
              value={eAmount}
              onChange={(e) => setEAmount(e.target.value)}
              placeholder="1200"
              required
            />
          </div>

          {/* Category (Fetched from Supabase) */}
          <div className="space-y-1">
            <Label>Category</Label>
            <Select 
              value={eCat} 
              onValueChange={setECat} 
              required 
              disabled={dropdownsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={dropdownsLoading ? "Loading..." : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration (Fetched from Supabase) */}
          <div className="space-y-1">
            <Label>Duration</Label>
            <Select 
              value={eDuration} 
              onValueChange={setEDuration} 
              required 
              disabled={dropdownsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={dropdownsLoading ? "Loading..." : "Select duration"} />
              </SelectTrigger>
              <SelectContent>
                {durations?.map((d) => (
                  // Uses the 'name' string as the value (e.g., "daily", "monthly")
                  <SelectItem key={d.name} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="edesc">Description (Optional)</Label>
            <Input
              id="edesc"
              value={eDesc}
              onChange={(e) => setEDesc(e.target.value)}
              placeholder="e.g., Paid for August electricity"
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="sm:col-span-2" 
            disabled={createExpense.isPending || !eCat || !eDuration || !eAmount}
          >
            {createExpense.isPending ? 'Saving...' : 'Save expense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}