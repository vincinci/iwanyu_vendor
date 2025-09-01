import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  VENDORS: 'vendors',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  PAYOUTS: 'payouts',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs',
} as const;

// Storage bucket names
export const BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
  VENDOR_DOCUMENTS: 'vendor-documents',
  AVATARS: 'avatars',
} as const;