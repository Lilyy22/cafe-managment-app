import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "./ui/card"

export function SkeletonTable() {
  return (
      <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="flex w-full flex-col gap-2 space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
            <div className="flex gap-4" key={index}>
            <Skeleton className="h-6 flex-1" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            </div>
        ))}
        </div>
      </CardContent>
    </Card>
      
  )
}
