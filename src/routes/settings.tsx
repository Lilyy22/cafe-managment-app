import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_SETTINGS, useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Ozzy Coffee Management" },
      {
        name: "description",
        content:
          "Tune low stock alerts, restock lead time, bill reminders and default report range for Ozzy Coffee.",
      },
      { property: "og:title", content: "Settings — Ozzy Coffee Management" },
      {
        property: "og:description",
        content: "Control alerts, forecasting windows and defaults across the Ozzy Coffee app.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, updateSettings, materialStats } = useShop();
  const low = materialStats.filter((m) => m.low);

  return (
    <AppShell
      title="Settings"
      description="Everything here changes how alerts and forecasts behave across the app."
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            updateSettings(DEFAULT_SETTINGS);
            toast.success("Settings reset to defaults");
          }}
        >
          Reset
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low stock alerts</CardTitle>
            <CardDescription>
              {low.length} item{low.length === 1 ? "" : "s"} currently flagged
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Show alert banner</p>
                <p className="text-xs text-muted-foreground">
                  A red banner on every page when something is running out.
                </p>
              </div>
              <Switch
                checked={settings.showLowStockBanner}
                onCheckedChange={(v) => updateSettings({ showLowStockBanner: v })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowDays">Warn when stock lasts fewer than (days)</Label>
              <Input
                id="lowDays"
                type="number"
                inputMode="numeric"
                min={1}
                value={settings.lowStockDays}
                onChange={(e) => updateSettings({ lowStockDays: Number(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowPct">Warn when below (% of last purchase)</Label>
              <Input
                id="lowPct"
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                value={settings.lowStockPercent}
                onChange={(e) => updateSettings({ lowStockPercent: Number(e.target.value) || 0 })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forecasting</CardTitle>
            <CardDescription>How restock dates and usage averages are calculated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buffer">Buy this many days before running out</Label>
              <Input
                id="buffer"
                type="number"
                inputMode="numeric"
                min={0}
                value={settings.restockBufferDays}
                onChange={(e) => updateSettings({ restockBufferDays: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="window">Usage average window (days of history)</Label>
              <Input
                id="window"
                type="number"
                inputMode="numeric"
                min={1}
                value={settings.usageWindowDays}
                onChange={(e) => updateSettings({ usageWindowDays: Number(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Default range on Sales & expenses</Label>
              <Select
                value={settings.defaultRange}
                onValueChange={(v) => updateSettings({ defaultRange: v as "7" | "30" | "90" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bills</CardTitle>
            <CardDescription>When upcoming payments should start showing up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:max-w-xs">
              <Label htmlFor="lead">Highlight bills due within (days)</Label>
              <Input
                id="lead"
                type="number"
                inputMode="numeric"
                min={0}
                value={settings.reminderLeadDays}
                onChange={(e) => updateSettings({ reminderLeadDays: Number(e.target.value) || 0 })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
