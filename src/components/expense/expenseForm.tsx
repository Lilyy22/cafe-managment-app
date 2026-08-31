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
import { HandCoins, Plus } from 'lucide-react'
import { useCreateExpense, useExpenseDropdowns } from '@/hooks/useExpenses'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface ExpenseFormProps {
  initialData?: any
  open: boolean
  setOpen: (open: boolean) => void
}

export function ExpenseForm({ initialData, open, setOpen }: ExpenseFormProps) {
  const isEditing = !!initialData

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

  const isBusy = isEditing

  return (
    <Sheet open={open} onOpenChange={(next) => !isBusy && setOpen(next)}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:min-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <HandCoins className="size-5 text-primary" />
            {isEditing ? "Edit item" : "Add expense"}
          </SheetTitle>
          <SheetDescription>
            e.g. 500 ETB for sugar
          </SheetDescription>
        </SheetHeader>

        <form id='EXPENSE_FORM_ID' onSubmit={submitExpense} className="space-y-4 px-4 grid gap-3 sm:grid-cols-2">
          
          {/* Date */}
          <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              value={eCat} 
              onValueChange={(value) => setECat(value ?? "other")} 
              required 
              disabled={dropdownsLoading}
            >
              <SelectTrigger className="w-full">
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
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select 
              value={eDuration} 
              onValueChange={(value) => setEDuration(value ?? "monthly")} 
              required 
              disabled={dropdownsLoading}
            >
              <SelectTrigger className="w-full">
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
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edesc">Description (Optional)</Label>
            <Input
              id="edesc"
              value={eDesc}
              onChange={(e) => setEDesc(e.target.value)}
              placeholder="e.g., Paid for August electricity"
            />
          </div>
        </form>
    
        {/* Submit Button */}
        <SheetFooter>
          <Button form="EXPENSE_FORM_ID" type="submit" disabled={isBusy}>
            {isBusy ? "Saving..." : isEditing ? "Update Item" : "Add Expense"}
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={isBusy}
            onClick={() => reset(getDefaultValues(isEditing, initialData))}
          >
            Reset form
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}