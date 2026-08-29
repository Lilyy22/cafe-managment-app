// src/types/database.ts

export interface Database {
    public: {
      Tables: {
        measurement_units: {
          Row: { id: string; name: string; symbol?: string };
          Insert: { id?: string; name: string; symbol?: string };
          Update: { id?: string; name?: string; symbol?: string };
        };
        durations: {
          Row: { id: string; name: string; days?: number };
          Insert: { id?: string; name: string; days?: number };
          Update: { id?: string; name?: string; days?: number };
        };
        expense_categories: {
          Row: { id: string; name: string; description?: string };
          Insert: { id?: string; name: string; description?: string };
          Update: { id?: string; name?: string; description?: string };
        };
        inventories: {
          Row: { 
            id: string; item: string; quantity: number; 
            unit_of_measurement: string; price: number; 
            remaining: number; days_left?: number; 
            created_at: string; updated_at: string; 
          };
          Insert: { 
            id?: string; item: string; quantity: number; 
            unit_of_measurement: string; price: number; 
            remaining: number; days_left?: number; 
            created_at?: string; updated_at?: string; 
          };
          Update: { 
            id?: string; item?: string; quantity?: number; 
            unit_of_measurement?: string; price?: number; 
            remaining?: number; days_left?: number; 
            created_at?: string; updated_at?: string; 
          };
        };
        bills: {
          Row: {
            id: string;
            vendor_name: string;
            description: string | null;
            category: string | null;
            amount: number;
            due_date: string;               // e.g., "2023-10-31"
            status: string;                 // e.g., "unpaid", "paid", "overdue"
            expense_id: string | null;
            paid_at: string | null;         // ✅ e.g., "2023-10-30T14:30:00.000Z" (Includes time!)
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            vendor_name: string;
            description?: string | null;
            category?: string | null;
            amount: number;
            due_date: string;
            status?: string;
            expense_id?: string | null;
            paid_at?: string | null;        // ✅ Optional, defaults to null
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            vendor_name?: string;
            description?: string | null;
            category?: string | null;
            amount?: number;
            due_date?: string;
            status?: string;
            expense_id?: string | null;
            paid_at?: string | null;        // ✅ Optional, set to ISO string when paid
            updated_at?: string;
          };
        }
        // ... add the rest of your tables (expenses, products, sales) following this pattern
      };
    };
  }


export interface Duration {
    name: string; // e.g., "daily", "weekly", "monthly"
    days?: number; // optional: number of days this represents
    description: string;
}

export interface ExpenseCategory {
    name: string;        // PRIMARY KEY (e.g., "Utilities", "Rent", "Supplies")
    description?: string;
}

export interface MeasurementUnit {
    name: string | null;        // PRIMARY KEY (e.g., "kg", "g", "ml", "pcs")
    description?: string;
}

export interface Expense {
  id: string;          // UUID (Primary Key for the expense itself)
  amount: number;
  date: string;
  expense_category: string;    // FK -> expense_categories.name (Stores the string!)
  duration: string;    // FK -> durations.name (Stores the string!)
  note?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data from Supabase
  category_details?: ExpenseCategory;
  duration_details?: Duration;
}

export interface Inventory {
    id: string;
    item: string;
    quantity: number;
    unit_of_measurement: MeasurementUnit;  // REFERENCES measurement_units(name)
    price: number;
    remaining: number;
    days_left?: number;
    created_at: string;
    updated_at?: string;
    
    // Optional join
    measurement_unit?: MeasurementUnit;
}

export interface Product {
    id: string;
    item: string;
    ingredient_id?: string;        // UUID reference to inventories.id
    usage_per_unit?: number;
    selling_price: number;
    created_at: string;
    updated_at?: string;
    
    // Optional joins
    inventory?: Inventory;
}

export interface Sale {
    id: string;
    date: string;
    product?: string;           // UUID reference to products.id
    quantity: number;             // How many were sold
    total_amount: number;         // quantity * selling_price
    note?: string | null;
    created_at: string;
    updated_at?: string;
    
    // Optional joins
    product_details?: Product;
}

export interface Bill {
  id: string;
  vendor_name: string;              // Usually required, so removed '?'
  description: string | null;       // Made nullable to match DB schema
  amount: number;                   // 💡 This is the monetary cost (not quantity)
  due_date: string;                 // e.g., "2023-10-31"
  category: string | null;
  status?: 'unpaid' | 'paid' | 'overdue' | null; // 💡 Union type for better autocomplete!
  paid_at: string | null;           // ✅ Perfect: Holds ISO time string or null
  expense_id: string | null;        // UUID reference to expense.id
  created_at: string;
  updated_at: string | null;
  
  // Optional joins (if you do a Supabase select with nested relations)
  expense_details?: Expense | null;
}