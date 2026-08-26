// src/components/sales/salesSummary.tsx

// Helper to format ETB currency
function formatETB(amount: number): string {
  return `${amount.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`
}

export interface StockImpactLine {
  id: string
  name: string
  unit: string
  deduction: number
  remaining: number
  projectedRemaining: number
}

interface SalesSummaryProps {
  sales: number
  materialCost: number
  stockImpact: StockImpactLine[]
}

// Pure display component — takes already-computed numbers, no data
// fetching or form state of its own. Reusable anywhere you want to show
// "what would this batch of sales cost/deduct" (the live form preview,
// a past entry's detail view, a daily report, etc).
export function SalesSummary({ sales, materialCost, stockImpact }: SalesSummaryProps) {
  const grossProfit = sales - materialCost

  return (
    <>
      <div className="rounded-lg bg-secondary/60 p-3 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Sales</span>
          <span className="font-semibold">{formatETB(sales)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Material cost</span>
          <span className="font-semibold">{formatETB(materialCost)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-border pt-1">
          <span className="text-muted-foreground">Gross profit</span>
          <span className="font-bold text-primary">{formatETB(grossProfit)}</span>
        </div>
      </div>

      {stockImpact.length > 0 && (
        <div className="rounded-lg border border-border p-3 text-sm space-y-1">
          <p className="font-semibold text-foreground">Stock impact</p>
          {stockImpact.map((s) => (
            <p key={s.id} className="text-muted-foreground">
              {s.name}: −{s.deduction.toLocaleString(undefined, { maximumFractionDigits: 2 })} {s.unit}
              {" → leaves "}
              <span className={s.projectedRemaining < 0 ? "text-destructive font-medium" : undefined}>
                {s.projectedRemaining.toLocaleString(undefined, { maximumFractionDigits: 2 })} {s.unit}
              </span>
            </p>
          ))}
        </div>
      )}
    </>
  )
}