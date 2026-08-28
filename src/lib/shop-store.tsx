import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Single data layer for Ozzy Coffee.
 * Currently in-memory demo data. When Lovable Cloud is enabled this module is
 * the only file that changes: the UI reads everything through useShop().
 */

export type MaterialId =
  | "coffee"
  | "peanut-butter"
  | "cinnamon"
  | "chips"
  | "milk"
  | "biscuit"
  | "water"
  | "coal"
  | "detergent"
  | "essence";

export type ProductId =
  | "coffee"
  | "peanut-tea"
  | "cinnamon-tea"
  | "chips"
  | "milk"
  | "biscuit"
  | "water";

export interface Material {
  id: MaterialId;
  name: string;
  unit: "g" | "ml" | "pcs";
  /** Quantity currently on hand, in `unit`. */
  remaining: number;
  /** Size of the last standard purchase, in `unit`. */
  purchaseQty: number;
  /** Price paid for that purchase, ETB. */
  purchasePrice: number;
  /** Reorder when remaining falls below this. */
  reorderLevel: number;
  /**
   * Consumables (coal, detergent, essence) are not tied to a recipe, so they are
   * never deducted automatically — you log their usage or purchase manually.
   */
  manualOnly?: boolean;
}

export interface RecipeLine {
  material: MaterialId;
  qty: number;
}

export interface Product {
  id: ProductId;
  name: string;
  /** Unit label shown next to the quantity, e.g. "cup". */
  unitLabel: string;
  /** Selling price per unit sold, ETB. */
  price: number;
  /** Materials consumed per unit sold. Editable from the Products page. */
  recipe: RecipeLine[];
}

export interface DailyEntry {
  id: string;
  date: string; // yyyy-mm-dd
  sold: Partial<Record<ProductId, number>>;
  note?: string | undefined;
}

export type ExpenseCategory =
  | "coffee beans"
  | "peanut butter"
  | "chips"
  | "milk"
  | "biscuit"
  | "water"
  | "coal"
  | "detergent"
  | "essence"
  | "light bill"
  | "rent"
  | "salary"
  | "other";

export interface Settings {
  /** Flag an item when its stock will run out within this many days. */
  lowStockDays: number;
  /** Flag an item when remaining falls under this % of the last purchase size. */
  lowStockPercent: number;
  /** Buy this many days before the item actually runs out. */
  restockBufferDays: number;
  /** Show the low-stock banner at the top of every page. */
  showLowStockBanner: boolean;
  /** Highlight bills due within this many days. */
  reminderLeadDays: number;
  /** Default quick range on the ledger page. */
  defaultRange: "7" | "30" | "90";
  /** How many days of history feed the usage average. */
  usageWindowDays: number;
}

export const DEFAULT_SETTINGS: Settings = {
  lowStockDays: 5,
  lowStockPercent: 15,
  restockBufferDays: 2,
  showLowStockBanner: true,
  reminderLeadDays: 7,
  defaultRange: "30",
  usageWindowDays: 7,
};

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  /** Optional stock top-up attached to this expense. */
  material?: MaterialId;
  qty?: number;
}

export interface Reminder {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // yyyy-mm-dd
  recurring: "monthly" | "once";
  paid: boolean;
  /** Amounts paid historically, used to predict the next bill. */
  history?: { date: string; amount: number }[];
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "coffee beans",
  "peanut butter",
  "chips",
  "milk",
  "biscuit",
  "water",
  "coal",
  "detergent",
  "essence",
  "light bill",
  "rent",
  "salary",
  "other",
];

const PRODUCTS_SEED: Product[] = [
  {
    id: "coffee",
    name: "Coffee",
    unitLabel: "cup",
    price: 30,
    recipe: [{ material: "coffee", qty: 12 }],
  },
  {
    id: "peanut-tea",
    name: "Peanut tea",
    unitLabel: "cup",
    price: 40,
    recipe: [
      { material: "peanut-butter", qty: 25 },
      { material: "milk", qty: 60 },
    ],
  },
  {
    id: "cinnamon-tea",
    name: "Cinnamon tea",
    unitLabel: "cup",
    price: 35,
    recipe: [{ material: "cinnamon", qty: 4 }],
  },
  {
    id: "chips",
    name: "Chips",
    unitLabel: "plate",
    price: 60,
    recipe: [{ material: "chips", qty: 150 }],
  },
  { id: "milk", name: "Milk", unitLabel: "cup", price: 25, recipe: [{ material: "milk", qty: 200 }] },
  {
    id: "biscuit",
    name: "Biscuit",
    unitLabel: "pack",
    price: 20,
    recipe: [{ material: "biscuit", qty: 1 }],
  },
  {
    id: "water",
    name: "Water bottle",
    unitLabel: "bottle",
    price: 25,
    recipe: [{ material: "water", qty: 1 }],
  },
];

const MATERIALS_SEED: Material[] = [
  {
    id: "coffee",
    name: "Coffee beans",
    unit: "g",
    remaining: 34200,
    purchaseQty: 50000,
    purchasePrice: 50000,
    reorderLevel: 6000,
  },
  {
    id: "peanut-butter",
    name: "Peanut butter",
    unit: "g",
    remaining: 1450,
    purchaseQty: 1000,
    purchasePrice: 950,
    reorderLevel: 400,
  },
  {
    id: "cinnamon",
    name: "Cinnamon",
    unit: "g",
    remaining: 620,
    purchaseQty: 500,
    purchasePrice: 700,
    reorderLevel: 150,
  },
  {
    id: "chips",
    name: "Chips (potato)",
    unit: "g",
    remaining: 8600,
    purchaseQty: 10000,
    purchasePrice: 4500,
    reorderLevel: 2000,
  },
  {
    id: "milk",
    name: "Milk",
    unit: "ml",
    remaining: 21000,
    purchaseQty: 20000,
    purchasePrice: 1800,
    reorderLevel: 5000,
  },
  {
    id: "biscuit",
    name: "Biscuit packs",
    unit: "pcs",
    remaining: 120,
    purchaseQty: 200,
    purchasePrice: 2400,
    reorderLevel: 40,
  },
  {
    id: "water",
    name: "Water bottles",
    unit: "pcs",
    remaining: 90,
    purchaseQty: 120,
    purchasePrice: 1560,
    reorderLevel: 24,
  },
  {
    id: "coal",
    name: "Coal",
    unit: "g",
    remaining: 26000,
    purchaseQty: 30000,
    purchasePrice: 1200,
    reorderLevel: 6000,
    manualOnly: true,
  },
  {
    id: "detergent",
    name: "Detergent",
    unit: "ml",
    remaining: 3200,
    purchaseQty: 5000,
    purchasePrice: 600,
    reorderLevel: 1000,
    manualOnly: true,
  },
  {
    id: "essence",
    name: "Essence",
    unit: "ml",
    remaining: 480,
    purchaseQty: 500,
    purchasePrice: 450,
    reorderLevel: 120,
    manualOnly: true,
  },
];

export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function addDays(date: string | Date, days: number) {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : new Date(date);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

export function addMonths(date: string, months: number) {
  const d = new Date(date + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return isoDate(d);
}

export function formatETB(n: number) {
  return `${Math.round(n).toLocaleString("en-US")} ETB`;
}

function rand(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function seedEntries(): DailyEntry[] {
  const out: DailyEntry[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = addDays(new Date(), -i);
    const weekend = [0, 6].includes(new Date(date + "T00:00:00").getDay());
    const boost = weekend ? 1.3 : 1;
    out.push({
      id: `entry-${date}`,
      date,
      sold: {
        coffee: Math.round(rand(70, 110) * boost),
        "peanut-tea": Math.round(rand(10, 26) * boost),
        "cinnamon-tea": Math.round(rand(8, 22) * boost),
        chips: Math.round(rand(6, 18) * boost),
        milk: Math.round(rand(5, 15) * boost),
        biscuit: Math.round(rand(4, 14) * boost),
        water: Math.round(rand(5, 20) * boost),
      },
    });
  }
  return out;
}

function seedExpenses(): Expense[] {
  const out: Expense[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = addDays(new Date(), -i);
    out.push({
      id: `exp-daily-${date}`,
      date,
      category: "other",
      description: "Daily running costs (water, cups, sugar)",
      amount: rand(250, 600),
    });
  }
  out.push(
    {
      id: "exp-coffee-1",
      date: addDays(new Date(), -21),
      category: "coffee beans",
      description: "50 kg coffee beans sack",
      amount: 50000,
      material: "coffee",
      qty: 50000,
    },
    {
      id: "exp-light",
      date: addDays(new Date(), -12),
      category: "light bill",
      description: "Electricity bill",
      amount: 1200,
    },
    {
      id: "exp-salary",
      date: addDays(new Date(), -8),
      category: "salary",
      description: "Waitress salary",
      amount: 6000,
    },
    {
      id: "exp-rent",
      date: addDays(new Date(), -8),
      category: "rent",
      description: "House rent",
      amount: 12000,
    },
  );
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function seedReminders(): Reminder[] {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return [
    {
      id: "rem-rent",
      title: "House rent",
      amount: 12000,
      dueDate: isoDate(nextMonth),
      recurring: "monthly",
      paid: false,
      history: [{ date: addDays(new Date(), -8), amount: 12000 }],
    },
    {
      id: "rem-salary",
      title: "Waitress salary",
      amount: 6000,
      dueDate: isoDate(new Date(today.getFullYear(), today.getMonth(), 28)),
      recurring: "monthly",
      paid: false,
      history: [{ date: addDays(new Date(), -8), amount: 6000 }],
    },
    {
      id: "rem-light",
      title: "Light bill",
      amount: 1200,
      dueDate: isoDate(new Date(today.getFullYear(), today.getMonth(), 20)),
      recurring: "monthly",
      paid: false,
      history: [{ date: addDays(new Date(), -12), amount: 1200 }],
    },
  ];
}

export interface MaterialStat extends Material {
  unitCost: number;
  avgDailyUsage: number;
  daysRemaining: number | null;
  restockDate: string | null;
  low: boolean;
}

interface ShopContextValue {
  products: Product[];
  materials: Material[];
  entries: DailyEntry[];
  expenses: Expense[];
  reminders: Reminder[];
  materialStats: MaterialStat[];
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  addEntry: (e: Omit<DailyEntry, "id">) => void;
  deleteEntry: (id: string) => void;
  addExpense: (e: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
  addPurchase: (m: MaterialId, qty: number, price: number, date: string) => void;
  adjustStock: (m: MaterialId, delta: number) => void;
  updateMaterial: (m: MaterialId, patch: Partial<Material>) => void;
  updateProduct: (p: ProductId, patch: Partial<Product>) => void;
  toggleReminder: (id: string) => void;
  payReminder: (id: string, amount: number, date: string) => void;
  updateReminder: (id: string, patch: Partial<Reminder>) => void;
  addReminder: (r: Omit<Reminder, "id">) => void;
  deleteReminder: (id: string) => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function revenueOf(entry: DailyEntry, products: Product[]) {
  return products.reduce((sum, p) => sum + (entry.sold[p.id] ?? 0) * p.price, 0);
}

export function cupsOf(entry: DailyEntry) {
  return Object.values(entry.sold).reduce<number>((s, n) => s + (n ?? 0), 0);
}

export function usageOf(entry: DailyEntry, material: MaterialId, products: Product[]) {
  return products.reduce((sum, p) => {
    const line = p.recipe.find((r) => r.material === material);
    return line ? sum + line.qty * (entry.sold[p.id] ?? 0) : sum;
  }, 0);
}

/** Material cost of one day's sales, using current unit costs. */
export function materialCostOf(entry: DailyEntry, stats: MaterialStat[], products: Product[]) {
  return stats.reduce((sum, m) => sum + usageOf(entry, m.id, products) * m.unitCost, 0);
}

/** Cost of the materials in one unit of a product. */
export function productCost(p: Product, stats: MaterialStat[]) {
  return p.recipe.reduce((sum, line) => {
    const m = stats.find((s) => s.id === line.material);
    return sum + (m ? m.unitCost * line.qty : 0);
  }, 0);
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS_SEED);
  const [materials, setMaterials] = useState<Material[]>(MATERIALS_SEED);
  const [entries, setEntries] = useState<DailyEntry[]>(seedEntries);
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [reminders, setReminders] = useState<Reminder[]>(seedReminders);
  // This was referenced throughout the file (in ShopContextValue's shape
  // and in the value object below) but never actually created — that's
  // the entire cause of the "settings"/"setSettings" build errors.
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const materialStats = useMemo<MaterialStat[]>(() => {
    const recent = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 7);
    return materials.map((m) => {
      const unitCost = m.purchaseQty > 0 ? m.purchasePrice / m.purchaseQty : 0;
      const used = recent.reduce((s, e) => s + usageOf(e, m.id, products), 0);
      const avgDailyUsage = recent.length ? used / recent.length : 0;
      const daysRemaining = avgDailyUsage > 0 ? m.remaining / avgDailyUsage : null;
      return {
        ...m,
        unitCost,
        avgDailyUsage,
        daysRemaining,
        restockDate:
          daysRemaining !== null
            ? addDays(new Date(), Math.max(0, Math.floor(daysRemaining) - 2))
            : null,
        low: m.remaining <= m.reorderLevel || (daysRemaining !== null && daysRemaining <= 5),
      };
    });
  }, [materials, entries, products]);

  const value = useMemo<ShopContextValue>(
    () => ({
      products,
      materials,
      entries,
      expenses,
      reminders,
      materialStats,
      settings,
      updateSettings: (patch) => setSettings((prev) => ({ ...prev, ...patch })),
      addEntry: (e) => {
        const entry: DailyEntry = { ...e, id: `entry-${e.date}-${Date.now()}` };
        setEntries((prev) => [entry, ...prev.filter((p) => p.date !== e.date)]);
        setMaterials((prev) =>
          prev.map((m) =>
            m.manualOnly
              ? m
              : { ...m, remaining: Math.max(0, m.remaining - usageOf(entry, m.id, products)) },
          ),
        );
      },
      deleteEntry: (id) => setEntries((prev) => prev.filter((e) => e.id !== id)),
      addExpense: (e) => {
        setExpenses((prev) => [{ ...e, id: `exp-${Date.now()}` }, ...prev]);
        if (e.material && e.qty) {
          const mat = e.material;
          const qty = e.qty;
          setMaterials((prev) =>
            prev.map((m) => (m.id === mat ? { ...m, remaining: m.remaining + qty } : m)),
          );
        }
      },
      deleteExpense: (id) => setExpenses((prev) => prev.filter((e) => e.id !== id)),
      addPurchase: (id, qty, price, date) => {
        const mat = materials.find((m) => m.id === id);
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, remaining: m.remaining + qty, purchaseQty: qty, purchasePrice: price }
              : m,
          ),
        );
        setExpenses((prev) => [
          {
            id: `exp-${Date.now()}`,
            date,
            category: (EXPENSE_CATEGORIES.includes(id as ExpenseCategory)
              ? id
              : id === "coffee"
                ? "coffee beans"
                : id === "peanut-butter"
                  ? "peanut butter"
                  : "other") as ExpenseCategory,
            description: `Purchase: ${mat?.name ?? id} (${qty.toLocaleString()} ${mat?.unit ?? ""})`,
            amount: price,
            material: id,
            qty,
          },
          ...prev,
        ]);
      },
      adjustStock: (id, delta) =>
        setMaterials((prev) =>
          prev.map((m) => (m.id === id ? { ...m, remaining: Math.max(0, m.remaining + delta) } : m)),
        ),
      updateMaterial: (id, patch) =>
        setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))),
      updateProduct: (id, patch) =>
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      toggleReminder: (id) =>
        setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, paid: !r.paid } : r))),
      payReminder: (id, amount, date) => {
        const rem = reminders.find((r) => r.id === id);
        if (!rem) return;
        setReminders((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  amount,
                  paid: r.recurring === "monthly" ? false : true,
                  dueDate: r.recurring === "monthly" ? addMonths(r.dueDate, 1) : r.dueDate,
                  history: [...(r.history ?? []), { date, amount }],
                }
              : r,
          ),
        );
        setExpenses((prev) => [
          {
            id: `exp-${Date.now()}`,
            date,
            category: rem.title.toLowerCase().includes("light")
              ? "light bill"
              : rem.title.toLowerCase().includes("rent")
                ? "rent"
                : rem.title.toLowerCase().includes("salary")
                  ? "salary"
                  : "other",
            description: `${rem.title} paid`,
            amount,
          },
          ...prev,
        ]);
      },
      updateReminder: (id, patch) =>
        setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))),
      addReminder: (r) => setReminders((prev) => [...prev, { ...r, id: `rem-${Date.now()}` }]),
      deleteReminder: (id) => setReminders((prev) => prev.filter((r) => r.id !== id)),
    }),
    [products, materials, entries, expenses, reminders, materialStats, settings],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}