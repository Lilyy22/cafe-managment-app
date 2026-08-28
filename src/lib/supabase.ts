import { createClient } from '@supabase/supabase-js';

// 1. Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Fail fast if variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

// 3. Create and export the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);