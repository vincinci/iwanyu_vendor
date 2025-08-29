import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

// Simple client-side Supabase client
export const createClientSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient<Database>(url, anonKey)
}

// Export default client
export const supabase = createClientSupabase()
