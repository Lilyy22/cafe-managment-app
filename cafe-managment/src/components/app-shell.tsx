import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  BellRing,
  ChevronLeft,
  Coffee,
  LayoutDashboard,
  Menu,
  NotebookPen,
  Package,
  Receipt,
  Settings,
  Tags,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useShop } from "@/lib/shop-store";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/daily", label: "Daily entry", icon: NotebookPen },
  { to: "/ledger", label: "Sales & expenses", icon: Receipt },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/products", label: "Products & prices", icon: Tags },
  { to: "/reminders", label: "Bills", icon: BellRing },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const bottomNav = [
  { to: "/", short: "Home", icon: LayoutDashboard },
  { to: "/daily", short: "Daily", icon: NotebookPen },
  { to: "/ledger", short: "Sales", icon: Receipt },
  { to: "/inventory", short: "Stock", icon: Package },
  { to: "/products", short: "Products", icon: Tags },
] as const;


function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-3 px-3 py-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Coffee className="size-5" />
      </span>
      {!collapsed ? (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-base font-bold tracking-tight text-foreground">
            Ozzy Coffee
          </span>
          <span className="block truncate text-xs text-muted-foreground">Shop management</span>
        </span>
      ) : null}
    </Link>
  );
}

function NavList({
  collapsed,
  lowCount,
  onNavigate,
}: {
  collapsed?: boolean;
  lowCount: number;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-1 px-2">
      {nav.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={item.label}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              collapsed && "justify-center px-2",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
            {item.to === "/inventory" && lowCount > 0 ? (
              <span
                className={cn(
                  "ml-auto rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground",
                  collapsed && "ml-0 px-1",
                )}
              >
                {lowCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { materialStats, settings } = useShop();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const low = materialStats.filter((m) => m.low);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden shrink-0 flex-col border-r border-border/70 bg-card/80 backdrop-blur md:flex",
          collapsed ? "w-[74px]" : "w-64",
        )}
      >
        <Brand collapsed={collapsed} />
        <div className="flex-1 overflow-y-auto pb-4">
          <NavList collapsed={collapsed} lowCount={low.length} />
        </div>
        <div className="border-t border-border/70 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => setCollapsed((c) => !c)}
          >
            <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed ? <span className="ml-2">Collapse</span> : null}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[20rem] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Brand />
          <NavList lowCount={low.length} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className={cn("flex min-h-screen flex-col", collapsed ? "md:pl-[74px]" : "md:pl-64")}>
        <header className="sticky top-0 z-30 border-b border-border/70 bg-card/90 backdrop-blur">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight text-foreground md:text-2xl">
                {title}
              </h1>
              {description ? (
                <p className="hidden truncate text-xs text-muted-foreground sm:block">
                  {description}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-5 pb-24 sm:px-4 sm:py-6 md:pb-8">
          {settings?.showLowStockBanner && low.length > 0 ? (
            <Link
              to="/inventory"
              className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <span className="min-w-0">
                <span className="font-semibold text-foreground">
                  {low.length} item{low.length > 1 ? "s" : ""} low on stock
                </span>{" "}
                <span className="text-muted-foreground">
                  — {low.map((m) => m.name).join(", ")}. Tap to restock.
                </span>
              </span>
            </Link>
          ) : null}
          {description ? (
            <p className="mb-4 text-sm text-muted-foreground sm:hidden">{description}</p>
          ) : null}
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="grid grid-cols-5">
          {bottomNav.map((item) => {
            const active = pathname === item.to;
            const showBadge = item.to === "/inventory" && low.length > 0;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "relative flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg",
                      active && "bg-primary/10",
                    )}
                  >
                    <item.icon className="size-5" />
                  </span>
                  <span className="max-w-full truncate px-1">{item.short}</span>
                  {showBadge ? (
                    <span className="absolute right-[22%] top-1 size-2 rounded-full bg-destructive" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>

  );
}
