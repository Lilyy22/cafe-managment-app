import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutGrid, List, PackagePlus, Pencil, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatETB, isoDate, useShop, type MaterialId, type MaterialStat } from "@/lib/shop-store";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Ozzy Coffee Management" },
      {
        name: "description",
        content:
          "Add coffee bean sacks and other stock, see what is left, log waste and know when to buy again.",
      },
      { property: "og:title", content: "Inventory — Ozzy Coffee Management" },
      {
        property: "og:description",
        content: "Stock levels, cost per gram, waste log and restock forecasts for Ozzy Coffee.",
      },
    ],
  }),
  component: InventoryPage,
});

type Panel = { kind: "adjust" | "waste" | "delete"; id: MaterialId } | null;

function InventoryPage() {
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="hidden text-right md:table-cell">Cost / unit</TableHead>
                  <TableHead className="hidden text-right lg:table-cell">Days left</TableHead>
                  <TableHead className="hidden text-right lg:table-cell">Buy around</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate">{m.name}</span>
                        {m.low ? <Badge variant="destructive">Low</Badge> : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(m.remaining).toLocaleString()} {m.unit}
                    </TableCell>
                    <TableCell className="hidden text-right md:table-cell">
                      {m.unitCost.toFixed(3)} ETB
                    </TableCell>
                    <TableCell className="hidden text-right lg:table-cell">
                      {m.daysRemaining !== null ? Math.floor(m.daysRemaining) : "—"}
                    </TableCell>
                    <TableCell className="hidden text-right lg:table-cell">
                      {m.restockDate ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPanel("adjust", m)}
                        >
                          <Pencil className="size-3.5 sm:mr-1" />
                          <span className="hidden sm:inline">Adjust</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPanel("waste", m)}
                        >
                          <TriangleAlert className="size-3.5 sm:mr-1" />
                          <span className="hidden sm:inline">Waste</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete item"
                          onClick={() => openPanel("delete", m)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No items match this filter.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((m) => (
            <Card key={m.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">{m.name}</CardTitle>
                    <CardDescription>
                      {m.unitCost.toFixed(3)} ETB / {m.unit} · last buy{" "}
                      {formatETB(m.purchasePrice)}
                    </CardDescription>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {m.low ? <Badge variant="destructive">Low</Badge> : null}
                    {m.manualOnly ? <Badge variant="secondary">Manual</Badge> : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-foreground">
                      {Math.round(m.remaining).toLocaleString()} {m.unit} left
                    </span>
                    <span className="text-muted-foreground">
                      worth {formatETB(m.remaining * m.unitCost)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, (m.remaining / Math.max(m.purchaseQty, 1)) * 100)}
                    className="mt-2"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  {m.manualOnly
                    ? "Not linked to a product — log usage manually."
                    : m.daysRemaining !== null
                      ? `Uses ~${Math.round(m.avgDailyUsage)} ${m.unit}/day · about ${Math.floor(
                          m.daysRemaining,
                        )} days left · buy around ${m.restockDate}`
                      : "No usage recorded yet."}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setMaterial(m.id);
                      setBuyOpen(true);
                    }}
                  >
                    <PackagePlus className="mr-1 size-4" /> Restock
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openPanel("adjust", m)}>
                    <Pencil className="mr-1 size-4" /> Adjust
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openPanel("waste", m)}>
                    <TriangleAlert className="mr-1 size-4" /> Waste
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => openPanel("delete", m)}
                  >
                    <Trash2 className="mr-1 size-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items match this filter.</p>
          ) : null}
        </div>
      )}

      {/* Add stock purchase */}
      <Sheet open={buyOpen} onOpenChange={setBuyOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add stock purchase</SheetTitle>
            <SheetDescription>e.g. 50,000 g coffee beans for 50,000 ETB</SheetDescription>
          </SheetHeader>
          <form onSubmit={submitPurchase} className="mt-4 space-y-4 pb-8">
            <div className="space-y-2">
              <Label>Item</Label>
              <Select value={material} onValueChange={(v) => setMaterial(v as MaterialId)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {materialStats.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity ({selected?.unit})</Label>
              <Input
                id="qty"
                type="number"
                inputMode="numeric"
                min={0}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="50000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Total price paid (ETB)</Label>
              <Input
                id="price"
                type="number"
                inputMode="numeric"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdate">Date</Label>
              <Input
                id="pdate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            {qty && price ? (
              <p className="rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
                Cost per {selected?.unit}:{" "}
                <span className="font-semibold text-foreground">
                  {(Number(price) / Number(qty)).toFixed(3)} ETB
                </span>
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              Add to warehouse
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Adjust / waste / delete */}
      <Sheet open={!!panel} onOpenChange={(v) => !v && setPanel(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {active && panel ? (
            <>
              <SheetHeader>
                <SheetTitle>
                  {panel.kind === "adjust"
                    ? `Adjust ${active.name}`
                    : panel.kind === "waste"
                      ? `Log waste — ${active.name}`
                      : `Delete ${active.name}?`}
                </SheetTitle>
                <SheetDescription>
                  {Math.round(active.remaining).toLocaleString()} {active.unit} on hand ·{" "}
                  {active.unitCost.toFixed(3)} ETB / {active.unit}
                </SheetDescription>
              </SheetHeader>

              {panel.kind === "adjust" ? (
                <div className="mt-4 space-y-4 pb-8">
                  <div className="space-y-2">
                    <Label htmlFor="adjust-qty">Correct stock on hand ({active.unit})</Label>
                    <Input
                      id="adjust-qty"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={adjustQty}
                      onChange={(e) => setAdjustQty(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adjust-reorder">Reorder alert level ({active.unit})</Label>
                    <Input
                      id="adjust-reorder"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={reorder}
                      onChange={(e) => setReorder(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      const target = Number(adjustQty);
                      adjustStock(active.id, target - active.remaining);
                      updateMaterial(active.id, { reorderLevel: Number(reorder) || 0 });
                      toast.success(`${active.name} updated`);
                      setPanel(null);
                    }}
                  >
                    Save changes
                  </Button>
                </div>
              ) : null}

              {panel.kind === "waste" ? (
                <div className="mt-4 space-y-4 pb-8">
                  <div className="space-y-2">
                    <Label htmlFor="waste-qty">Wasted quantity ({active.unit})</Label>
                    <Input
                      id="waste-qty"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={wasteQty}
                      onChange={(e) => setWasteQty(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waste-reason">Reason</Label>
                    <Textarea
                      id="waste-reason"
                      value={wasteReason}
                      onChange={(e) => setWasteReason(e.target.value)}
                      placeholder="Spilled, expired, spoiled…"
                    />
                  </div>
                  {Number(wasteQty) > 0 ? (
                    <p className="rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
                      Loss value:{" "}
                      <span className="font-semibold text-foreground">
                        {formatETB(Number(wasteQty) * active.unitCost)}
                      </span>{" "}
                      — recorded as an expense.
                    </p>
                  ) : null}
                  <Button
                    className="w-full"
                    onClick={() => {
                      const v = Number(wasteQty);
                      if (!v || v <= 0) {
                        toast.error("Enter the wasted quantity.");
                        return;
                      }
                      logWaste(active.id, v, wasteReason.trim(), isoDate(new Date()));
                      toast.success(`Logged ${v} ${active.unit} of ${active.name} as waste`);
                      setPanel(null);
                    }}
                  >
                    Log waste
                  </Button>
                </div>
              ) : null}

              {panel.kind === "delete" ? (
                <div className="mt-4 space-y-4 pb-8">
                  <p className="text-sm text-muted-foreground">
                    This removes {active.name} from the warehouse list. Past expenses and sales stay
                    untouched.
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      deleteMaterial(active.id);
                      toast.success(`${active.name} deleted`);
                      setPanel(null);
                    }}
                  >
                    Delete item
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setPanel(null)}>
                    Cancel
                  </Button>
                </div>
              ) : null}
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
